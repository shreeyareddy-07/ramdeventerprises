from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal
import uuid

import re
import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="BusinessFlow API", version="1.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("businessflow")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24  # 1 day for dev-friendliness
REFRESH_TOKEN_DAYS = 7


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Auth Models
# ---------------------------------------------------------------------------

Role = Literal["super_admin", "business_owner", "branch_manager", "employee", "customer"]


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    business_name: Optional[str] = None
    role: Optional[Role] = "business_owner"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordReq(BaseModel):
    email: EmailStr


class ResetPasswordReq(BaseModel):
    token: str
    password: str = Field(min_length=6)


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    business_name: Optional[str] = None
    created_at: str


def user_public(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "name": doc["name"],
        "email": doc["email"],
        "role": doc.get("role", "business_owner"),
        "business_name": doc.get("business_name"),
        "created_at": doc.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False,
                        samesite="lax", max_age=ACCESS_TOKEN_MINUTES * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False,
                        samesite="lax", max_age=REFRESH_TOKEN_DAYS * 86400, path="/")


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------

@api_router.post("/auth/register")
async def register(payload: UserRegister, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = new_id()
    doc = {
        "id": user_id,
        "name": payload.name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": payload.role or "business_owner",
        "business_name": payload.business_name,
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    access = create_access_token(user_id, email, doc["role"])
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {"user": user_public(doc), "access_token": access}


@api_router.post("/auth/login")
async def login(payload: UserLogin, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["id"], email, user.get("role", "business_owner"))
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"user": user_public(user), "access_token": access}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return {"user": user_public(current)}


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    tok = request.cookies.get("refresh_token")
    if not tok:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(tok, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(user["id"], user["email"], user.get("role", "business_owner"))
        response.set_cookie("access_token", access, httponly=True, secure=False,
                            samesite="lax", max_age=ACCESS_TOKEN_MINUTES * 60, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordReq):
    import secrets as _secrets
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user:
        # do not leak
        return {"ok": True}
    token = _secrets.token_urlsafe(32)
    expires = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    await db.password_reset_tokens.insert_one({
        "token": token, "user_id": user["id"], "expires_at": expires, "used": False,
    })
    logger.info(f"[RESET LINK] token={token} for user={user['email']}")
    return {"ok": True, "reset_token": token}


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordReq):
    rec = await db.password_reset_tokens.find_one({"token": payload.token, "used": False})
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid or used token")
    if datetime.fromisoformat(rec["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")
    await db.users.update_one({"id": rec["user_id"]}, {"$set": {"password_hash": hash_password(payload.password)}})
    await db.password_reset_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Business Domain Models
# ---------------------------------------------------------------------------

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    owner_id: str
    name: str
    sku: str
    category: str
    price: float
    cost: float = 0
    stock: int = 0
    low_stock_threshold: int = 10
    unit: str = "pcs"
    description: str = ""
    created_at: str = Field(default_factory=now_iso)


class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    cost: float = 0
    stock: int = 0
    low_stock_threshold: int = 10
    unit: str = "pcs"
    description: str = ""


class Customer(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    name: str
    email: str = ""
    phone: str = ""
    company: str = ""
    address: str = ""
    total_orders: int = 0
    total_spent: float = 0
    notes: str = ""
    created_at: str = Field(default_factory=now_iso)


class CustomerCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    company: str = ""
    address: str = ""
    notes: str = ""


class OrderItem(BaseModel):
    product_id: str
    name: str
    quantity: int
    price: float


class Order(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    order_number: str
    customer_id: Optional[str] = None
    customer_name: str = ""
    items: List[OrderItem] = []
    subtotal: float = 0
    tax: float = 0
    total: float = 0
    status: Literal["pending", "processing", "completed", "cancelled"] = "pending"
    payment_status: Literal["unpaid", "paid", "refunded"] = "unpaid"
    created_at: str = Field(default_factory=now_iso)


class OrderCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str = ""
    items: List[OrderItem]
    tax_rate: float = 0
    status: Literal["pending", "processing", "completed", "cancelled"] = "pending"
    payment_status: Literal["unpaid", "paid", "refunded"] = "unpaid"


class Invoice(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    invoice_number: str
    order_id: Optional[str] = None
    customer_name: str
    amount: float
    tax: float = 0
    total: float
    status: Literal["draft", "sent", "paid", "overdue"] = "draft"
    due_date: str = ""
    created_at: str = Field(default_factory=now_iso)


class InvoiceCreate(BaseModel):
    order_id: Optional[str] = None
    customer_name: str
    amount: float
    tax: float = 0
    status: Literal["draft", "sent", "paid", "overdue"] = "draft"
    due_date: str = ""


class Employee(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    name: str
    email: str = ""
    phone: str = ""
    role: str = ""
    department: str = ""
    salary: float = 0
    status: Literal["active", "inactive"] = "active"
    joined_at: str = Field(default_factory=now_iso)


class EmployeeCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    role: str = ""
    department: str = ""
    salary: float = 0
    status: Literal["active", "inactive"] = "active"


class Supplier(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    name: str
    contact_person: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    products_supplied: str = ""
    created_at: str = Field(default_factory=now_iso)


class SupplierCreate(BaseModel):
    name: str
    contact_person: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    products_supplied: str = ""


class Expense(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    category: str
    description: str
    amount: float
    date: str
    created_at: str = Field(default_factory=now_iso)


class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount: float
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).date().isoformat())


# ---------------------------------------------------------------------------
# Generic CRUD helpers
# ---------------------------------------------------------------------------

def _proj():
    return {"_id": 0}


async def _list(coll, owner_id: str, search: str = "", fields: List[str] = None, limit: int = 500):
    q = {"owner_id": owner_id}
    if search and fields:
        q["$or"] = [{f: {"$regex": re.escape(search), "$options": "i"}} for f in fields]
    items = await coll.find(q, _proj()).sort("created_at", -1).to_list(limit)
    return items


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

@api_router.get("/products")
async def list_products(search: str = "", current=Depends(get_current_user)):
    return await _list(db.products, current["id"], search, ["name", "sku", "category"])


@api_router.post("/products")
async def create_product(body: ProductCreate, current=Depends(get_current_user)):
    p = Product(owner_id=current["id"], **body.model_dump())
    await db.products.insert_one(p.model_dump())
    return p.model_dump()


@api_router.put("/products/{pid}")
async def update_product(pid: str, body: ProductCreate, current=Depends(get_current_user)):
    r = await db.products.update_one({"id": pid, "owner_id": current["id"]}, {"$set": body.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(404, "Product not found")
    doc = await db.products.find_one({"id": pid}, _proj())
    return doc


@api_router.delete("/products/{pid}")
async def delete_product(pid: str, current=Depends(get_current_user)):
    r = await db.products.delete_one({"id": pid, "owner_id": current["id"]})
    if r.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Customers
# ---------------------------------------------------------------------------

@api_router.get("/customers")
async def list_customers(search: str = "", current=Depends(get_current_user)):
    return await _list(db.customers, current["id"], search, ["name", "email", "phone", "company"])


@api_router.post("/customers")
async def create_customer(body: CustomerCreate, current=Depends(get_current_user)):
    c = Customer(owner_id=current["id"], **body.model_dump())
    await db.customers.insert_one(c.model_dump())
    return c.model_dump()


@api_router.put("/customers/{cid}")
async def update_customer(cid: str, body: CustomerCreate, current=Depends(get_current_user)):
    r = await db.customers.update_one({"id": cid, "owner_id": current["id"]}, {"$set": body.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(404, "Customer not found")
    return await db.customers.find_one({"id": cid}, _proj())


@api_router.delete("/customers/{cid}")
async def delete_customer(cid: str, current=Depends(get_current_user)):
    r = await db.customers.delete_one({"id": cid, "owner_id": current["id"]})
    if r.deleted_count == 0:
        raise HTTPException(404, "Customer not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

async def _next_seq(owner_id: str, key: str, prefix: str) -> str:
    coll = db.counters
    r = await coll.find_one_and_update(
        {"owner_id": owner_id, "key": key},
        {"$inc": {"value": 1}},
        upsert=True, return_document=True
    )
    val = (r or {}).get("value", 1)
    return f"{prefix}-{val:05d}"


@api_router.get("/orders")
async def list_orders(search: str = "", current=Depends(get_current_user)):
    return await _list(db.orders, current["id"], search, ["order_number", "customer_name", "status"])


@api_router.post("/orders")
async def create_order(body: OrderCreate, current=Depends(get_current_user)):
    if not body.items:
        raise HTTPException(400, "Order must contain at least one item")
    owner_id = current["id"]

    # Atomic conditional stock decrement per item. Rolls back on any failure.
    decremented = []  # [(product_id, qty), ...]
    for item in body.items:
        if item.quantity <= 0:
            raise HTTPException(400, f"Invalid quantity for {item.name}")
        r = await db.products.update_one(
            {"id": item.product_id, "owner_id": owner_id, "stock": {"$gte": item.quantity}},
            {"$inc": {"stock": -item.quantity}},
        )
        if r.modified_count == 0:
            # roll back previous decrements
            for pid, qty in decremented:
                await db.products.update_one({"id": pid, "owner_id": owner_id}, {"$inc": {"stock": qty}})
            prod = await db.products.find_one({"id": item.product_id, "owner_id": owner_id}, _proj())
            avail = prod.get("stock", 0) if prod else 0
            raise HTTPException(409, f"Insufficient stock for '{item.name}'. Available: {avail}, requested: {item.quantity}")
        decremented.append((item.product_id, item.quantity))

    subtotal = sum(i.price * i.quantity for i in body.items)
    tax = subtotal * (body.tax_rate or 0) / 100
    total = subtotal + tax
    order_number = await _next_seq(owner_id, "orders", "ORD")
    order = Order(
        owner_id=owner_id, order_number=order_number,
        customer_id=body.customer_id, customer_name=body.customer_name,
        items=body.items, subtotal=subtotal, tax=tax, total=total,
        status=body.status, payment_status=body.payment_status,
    )
    doc = order.model_dump()
    await db.orders.insert_one(doc)
    doc.pop("_id", None)

    if body.customer_id:
        await db.customers.update_one({"id": body.customer_id, "owner_id": owner_id},
                                      {"$inc": {"total_orders": 1, "total_spent": total}})
    return doc


@api_router.put("/orders/{oid}/status")
async def update_order_status(oid: str, status: str = Query(...), current=Depends(get_current_user)):
    if status not in {"pending", "processing", "completed", "cancelled"}:
        raise HTTPException(400, "Invalid status")
    order = await db.orders.find_one({"id": oid, "owner_id": current["id"]}, _proj())
    if not order:
        raise HTTPException(404, "Order not found")
    prev = order.get("status")

    updates = {"status": status}
    # Auto-mark payment paid when completed
    if status == "completed" and order.get("payment_status") != "paid":
        updates["payment_status"] = "paid"
    # Restore stock on cancellation (only if not already cancelled)
    if status == "cancelled" and prev != "cancelled":
        for item in order.get("items", []):
            await db.products.update_one(
                {"id": item["product_id"], "owner_id": current["id"]},
                {"$inc": {"stock": item["quantity"]}},
            )
    # If moving out of cancelled back to active — re-decrement (protect stock)
    if prev == "cancelled" and status != "cancelled":
        for item in order.get("items", []):
            r = await db.products.update_one(
                {"id": item["product_id"], "owner_id": current["id"], "stock": {"$gte": item["quantity"]}},
                {"$inc": {"stock": -item["quantity"]}},
            )
            if r.modified_count == 0:
                raise HTTPException(409, f"Cannot reactivate: insufficient stock for '{item.get('name','item')}'")

    await db.orders.update_one({"id": oid, "owner_id": current["id"]}, {"$set": updates})
    return await db.orders.find_one({"id": oid}, _proj())


@api_router.delete("/orders/{oid}")
async def delete_order(oid: str, current=Depends(get_current_user)):
    order = await db.orders.find_one({"id": oid, "owner_id": current["id"]}, _proj())
    if not order:
        raise HTTPException(404, "Order not found")
    # Restore stock unless it was already cancelled
    if order.get("status") != "cancelled":
        for item in order.get("items", []):
            await db.products.update_one(
                {"id": item["product_id"], "owner_id": current["id"]},
                {"$inc": {"stock": item["quantity"]}},
            )
    await db.orders.delete_one({"id": oid, "owner_id": current["id"]})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Invoices
# ---------------------------------------------------------------------------

@api_router.get("/invoices")
async def list_invoices(search: str = "", current=Depends(get_current_user)):
    return await _list(db.invoices, current["id"], search, ["invoice_number", "customer_name", "status"])


@api_router.post("/invoices")
async def create_invoice(body: InvoiceCreate, current=Depends(get_current_user)):
    invoice_number = await _next_seq(current["id"], "invoices", "INV")
    total = body.amount + body.tax
    inv = Invoice(owner_id=current["id"], invoice_number=invoice_number, total=total, **body.model_dump())
    await db.invoices.insert_one(inv.model_dump())
    return inv.model_dump()


@api_router.put("/invoices/{iid}/status")
async def update_invoice_status(iid: str, status: str = Query(...), current=Depends(get_current_user)):
    if status not in {"draft", "sent", "paid", "overdue"}:
        raise HTTPException(400, "Invalid status")
    r = await db.invoices.update_one({"id": iid, "owner_id": current["id"]}, {"$set": {"status": status}})
    if r.matched_count == 0:
        raise HTTPException(404, "Invoice not found")
    return await db.invoices.find_one({"id": iid}, _proj())


@api_router.delete("/invoices/{iid}")
async def delete_invoice(iid: str, current=Depends(get_current_user)):
    r = await db.invoices.delete_one({"id": iid, "owner_id": current["id"]})
    if r.deleted_count == 0:
        raise HTTPException(404, "Invoice not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Employees / Suppliers / Expenses (generic pattern)
# ---------------------------------------------------------------------------

@api_router.get("/employees")
async def list_employees(search: str = "", current=Depends(get_current_user)):
    return await _list(db.employees, current["id"], search, ["name", "email", "role", "department"])


@api_router.post("/employees")
async def create_employee(body: EmployeeCreate, current=Depends(get_current_user)):
    e = Employee(owner_id=current["id"], **body.model_dump())
    await db.employees.insert_one(e.model_dump())
    return e.model_dump()


@api_router.put("/employees/{eid}")
async def update_employee(eid: str, body: EmployeeCreate, current=Depends(get_current_user)):
    r = await db.employees.update_one({"id": eid, "owner_id": current["id"]}, {"$set": body.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(404, "Employee not found")
    return await db.employees.find_one({"id": eid}, _proj())


@api_router.delete("/employees/{eid}")
async def delete_employee(eid: str, current=Depends(get_current_user)):
    r = await db.employees.delete_one({"id": eid, "owner_id": current["id"]})
    if r.deleted_count == 0:
        raise HTTPException(404, "Employee not found")
    return {"ok": True}


@api_router.get("/suppliers")
async def list_suppliers(search: str = "", current=Depends(get_current_user)):
    return await _list(db.suppliers, current["id"], search, ["name", "contact_person", "email"])


@api_router.post("/suppliers")
async def create_supplier(body: SupplierCreate, current=Depends(get_current_user)):
    s = Supplier(owner_id=current["id"], **body.model_dump())
    await db.suppliers.insert_one(s.model_dump())
    return s.model_dump()


@api_router.put("/suppliers/{sid}")
async def update_supplier(sid: str, body: SupplierCreate, current=Depends(get_current_user)):
    r = await db.suppliers.update_one({"id": sid, "owner_id": current["id"]}, {"$set": body.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(404, "Supplier not found")
    return await db.suppliers.find_one({"id": sid}, _proj())


@api_router.delete("/suppliers/{sid}")
async def delete_supplier(sid: str, current=Depends(get_current_user)):
    r = await db.suppliers.delete_one({"id": sid, "owner_id": current["id"]})
    if r.deleted_count == 0:
        raise HTTPException(404, "Supplier not found")
    return {"ok": True}


@api_router.get("/expenses")
async def list_expenses(search: str = "", current=Depends(get_current_user)):
    return await _list(db.expenses, current["id"], search, ["category", "description"])


@api_router.post("/expenses")
async def create_expense(body: ExpenseCreate, current=Depends(get_current_user)):
    e = Expense(owner_id=current["id"], **body.model_dump())
    await db.expenses.insert_one(e.model_dump())
    return e.model_dump()


@api_router.delete("/expenses/{eid}")
async def delete_expense(eid: str, current=Depends(get_current_user)):
    r = await db.expenses.delete_one({"id": eid, "owner_id": current["id"]})
    if r.deleted_count == 0:
        raise HTTPException(404, "Expense not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Business Profile & Settings
# ---------------------------------------------------------------------------

class BusinessProfile(BaseModel):
    business_name: str = ""
    industry: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    tax_id: str = ""
    currency: str = "USD"
    logo_url: str = ""


@api_router.get("/business/profile")
async def get_business_profile(current=Depends(get_current_user)):
    doc = await db.business_profiles.find_one({"owner_id": current["id"]}, _proj())
    if not doc:
        return BusinessProfile(business_name=current.get("business_name") or "").model_dump()
    doc.pop("owner_id", None)
    return doc


@api_router.put("/business/profile")
async def update_business_profile(body: BusinessProfile, current=Depends(get_current_user)):
    data = body.model_dump()
    data["owner_id"] = current["id"]
    await db.business_profiles.update_one({"owner_id": current["id"]}, {"$set": data}, upsert=True)
    data.pop("owner_id", None)
    data.pop("_id", None)
    return data


# ---------------------------------------------------------------------------
# Payments (India-focused: UPI + Bank + card-last4)
# ---------------------------------------------------------------------------

class PaymentSettings(BaseModel):
    account_holder: str = ""
    upi_id: str = ""
    bank_name: str = ""
    account_number_last4: str = ""
    ifsc: str = ""
    pan: str = ""
    gstin: str = ""
    currency: str = "INR"


class Payment(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    reference: str
    invoice_id: Optional[str] = None
    invoice_number: str = ""
    customer_name: str = ""
    amount: float
    method: Literal["upi", "card", "netbanking", "cash", "bank_transfer"] = "upi"
    status: Literal["received", "pending", "refunded", "failed"] = "received"
    note: str = ""
    payer_upi: str = ""
    created_at: str = Field(default_factory=now_iso)


class PaymentCreate(BaseModel):
    invoice_id: Optional[str] = None
    customer_name: str = ""
    amount: float
    method: Literal["upi", "card", "netbanking", "cash", "bank_transfer"] = "upi"
    status: Literal["received", "pending", "refunded", "failed"] = "received"
    note: str = ""
    payer_upi: str = ""


@api_router.get("/payments/settings")
async def get_payment_settings(current=Depends(get_current_user)):
    doc = await db.payment_settings.find_one({"owner_id": current["id"]}, _proj())
    if not doc:
        return PaymentSettings().model_dump()
    doc.pop("owner_id", None)
    return doc


@api_router.put("/payments/settings")
async def update_payment_settings(body: PaymentSettings, current=Depends(get_current_user)):
    data = body.model_dump()
    # never store the full account number — always keep only last 4
    if data.get("account_number_last4"):
        digits = "".join(ch for ch in data["account_number_last4"] if ch.isdigit())
        data["account_number_last4"] = digits[-4:]
    data["owner_id"] = current["id"]
    await db.payment_settings.update_one({"owner_id": current["id"]}, {"$set": data}, upsert=True)
    data.pop("owner_id", None)
    data.pop("_id", None)
    return data


@api_router.get("/payments")
async def list_payments(current=Depends(get_current_user)):
    return await _list(db.payments, current["id"], "", [], 500)


@api_router.post("/payments")
async def create_payment(body: PaymentCreate, current=Depends(get_current_user)):
    reference = await _next_seq(current["id"], "payments", "PAY")
    invoice_number = ""
    if body.invoice_id:
        inv = await db.invoices.find_one({"id": body.invoice_id, "owner_id": current["id"]})
        if inv:
            invoice_number = inv.get("invoice_number", "")
            # auto-mark invoice paid if payment covers total
            if body.status == "received" and body.amount >= inv.get("total", 0):
                await db.invoices.update_one({"id": body.invoice_id}, {"$set": {"status": "paid"}})
    p = Payment(owner_id=current["id"], reference=reference, invoice_number=invoice_number, **body.model_dump())
    await db.payments.insert_one(p.model_dump())
    return p.model_dump()


@api_router.delete("/payments/{pid}")
async def delete_payment(pid: str, current=Depends(get_current_user)):
    r = await db.payments.delete_one({"id": pid, "owner_id": current["id"]})
    if r.deleted_count == 0:
        raise HTTPException(404, "Payment not found")
    return {"ok": True}


@api_router.get("/payments/upi-link")
async def upi_link(amount: float = 0, note: str = "", upi_id: str = "", current=Depends(get_current_user)):
    """Build a UPI deep link. If upi_id query param provided, use it; else use owner's saved UPI."""
    from urllib.parse import quote
    payee = upi_id.strip()
    if not payee:
        s = await db.payment_settings.find_one({"owner_id": current["id"]}, _proj())
        payee = (s or {}).get("upi_id", "")
    if not payee:
        raise HTTPException(400, "No UPI ID provided or configured in Payment settings")
    s = await db.payment_settings.find_one({"owner_id": current["id"]}, _proj()) or {}
    name = s.get("account_holder") or current.get("business_name") or current.get("name") or "Merchant"
    tn = note or f"Payment to {name}"
    link = f"upi://pay?pa={quote(payee)}&pn={quote(name)}&am={amount:.2f}&cu=INR&tn={quote(tn)}"
    return {"upi_link": link, "payee": payee, "payee_name": name, "amount": amount, "currency": "INR"}


# ---------------------------------------------------------------------------
# Dashboard analytics
# ---------------------------------------------------------------------------

@api_router.get("/dashboard/overview")
async def dashboard_overview(current=Depends(get_current_user)):
    owner_id = current["id"]

    # Aggregations
    total_products = await db.products.count_documents({"owner_id": owner_id})
    total_customers = await db.customers.count_documents({"owner_id": owner_id})
    total_orders = await db.orders.count_documents({"owner_id": owner_id})
    total_employees = await db.employees.count_documents({"owner_id": owner_id})

    orders = await db.orders.find({"owner_id": owner_id}, _proj()).to_list(2000)
    total_revenue = sum(o.get("total", 0) for o in orders if o.get("payment_status") == "paid" or o.get("status") == "completed")

    expenses = await db.expenses.find({"owner_id": owner_id}, _proj()).to_list(2000)
    total_expenses = sum(e.get("amount", 0) for e in expenses)

    # Sales by day (last 14 days)
    from collections import defaultdict
    by_day = defaultdict(float)
    orders_by_day = defaultdict(int)
    today = datetime.now(timezone.utc).date()
    for i in range(13, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        by_day[d] = 0.0
        orders_by_day[d] = 0
    for o in orders:
        try:
            d = datetime.fromisoformat(o["created_at"]).date().isoformat()
        except Exception:
            continue
        if d in by_day:
            by_day[d] += o.get("total", 0)
            orders_by_day[d] += 1
    sales_series = [{"date": d, "revenue": round(by_day[d], 2), "orders": orders_by_day[d]}
                    for d in sorted(by_day.keys())]

    # Category breakdown
    products = await db.products.find({"owner_id": owner_id}, _proj()).to_list(2000)
    cat_map = defaultdict(int)
    for p in products:
        cat_map[p.get("category", "Uncategorized")] += 1
    category_breakdown = [{"name": k, "value": v} for k, v in cat_map.items()]

    # Recent orders
    recent_orders = sorted(orders, key=lambda x: x.get("created_at", ""), reverse=True)[:6]

    # Low stock
    low_stock = [p for p in products if p.get("stock", 0) <= p.get("low_stock_threshold", 10)][:6]

    return {
        "kpis": {
            "revenue": round(total_revenue, 2),
            "orders": total_orders,
            "customers": total_customers,
            "products": total_products,
            "employees": total_employees,
            "expenses": round(total_expenses, 2),
            "profit": round(total_revenue - total_expenses, 2),
        },
        "sales_series": sales_series,
        "category_breakdown": category_breakdown,
        "recent_orders": recent_orders,
        "low_stock": low_stock,
    }


# ---------------------------------------------------------------------------
# Global search
# ---------------------------------------------------------------------------

@api_router.get("/search")
async def global_search(q: str = "", current=Depends(get_current_user)):
    if not q or len(q) < 1:
        return {"results": []}
    owner_id = current["id"]
    results = []
    async def _find(coll, fields, kind, label_field):
        query = {"owner_id": owner_id, "$or": [{f: {"$regex": re.escape(q), "$options": "i"}} for f in fields]}
        docs = await coll.find(query, _proj()).limit(5).to_list(5)
        for d in docs:
            results.append({"kind": kind, "id": d.get("id"), "label": d.get(label_field, ""), "sub": d.get(fields[1], "") if len(fields) > 1 else ""})
    await _find(db.products, ["name", "sku"], "product", "name")
    await _find(db.customers, ["name", "email"], "customer", "name")
    await _find(db.orders, ["order_number", "customer_name"], "order", "order_number")
    await _find(db.invoices, ["invoice_number", "customer_name"], "invoice", "invoice_number")
    await _find(db.employees, ["name", "email"], "employee", "name")
    return {"results": results}


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

@api_router.post("/dev/seed")
async def seed_demo_data(current=Depends(get_current_user)):
    owner_id = current["id"]

    # Only seed if empty
    if await db.products.count_documents({"owner_id": owner_id}) > 0:
        return {"ok": True, "message": "Already seeded"}

    products_seed = [
        {"name": "Masala Chai Premix 1kg", "sku": "MC-01", "category": "Consumables", "price": 450, "cost": 180, "stock": 85},
        {"name": "Filter Coffee Powder 500g", "sku": "FC-02", "category": "Consumables", "price": 320, "cost": 140, "stock": 42},
        {"name": "Steel Tiffin Box Set", "sku": "TB-04", "category": "Retail", "price": 899, "cost": 380, "stock": 6},
        {"name": "Copper Water Bottle 1L", "sku": "CW-22", "category": "Retail", "price": 1299, "cost": 520, "stock": 40},
        {"name": "Khadi Notebook A5", "sku": "NB-A5", "category": "Stationery", "price": 249, "cost": 90, "stock": 3},
        {"name": "Wireless Earbuds Pro", "sku": "EB-11", "category": "Electronics", "price": 4999, "cost": 2100, "stock": 27},
        {"name": "LED Study Lamp", "sku": "DL-77", "category": "Electronics", "price": 1499, "cost": 620, "stock": 15},
        {"name": "Handloom Cotton Kurta", "sku": "KR-09", "category": "Apparel", "price": 1899, "cost": 780, "stock": 9},
    ]
    for p in products_seed:
        p.update({"id": new_id(), "owner_id": owner_id, "low_stock_threshold": 10,
                  "unit": "pcs", "description": "", "created_at": now_iso()})
    await db.products.insert_many(products_seed)

    customers_seed = [
        {"name": "Rahul Sharma", "email": "rahul@sharma.co.in", "phone": "+91 98100-11223", "company": "Sharma Retail"},
        {"name": "Priya Iyer", "email": "priya@iyerfoods.in", "phone": "+91 98450-33445", "company": "Iyer Foods"},
        {"name": "Arjun Mehta", "email": "arjun@mehtaco.in", "phone": "+91 99870-55667", "company": "Mehta & Co."},
        {"name": "Sneha Reddy", "email": "sneha@reddyclinic.in", "phone": "+91 90080-77889", "company": "Reddy Clinic"},
        {"name": "Vikram Nair", "email": "vikram@nairhotels.in", "phone": "+91 97440-99001", "company": "Nair Hotels"},
    ]
    for c in customers_seed:
        c.update({"id": new_id(), "owner_id": owner_id, "address": "", "notes": "",
                  "total_orders": 0, "total_spent": 0, "created_at": now_iso()})
    await db.customers.insert_many(customers_seed)

    # Orders spread across last 10 days
    import random
    prods = await db.products.find({"owner_id": owner_id}, _proj()).to_list(20)
    custs = await db.customers.find({"owner_id": owner_id}, _proj()).to_list(20)
    statuses = ["completed", "completed", "completed", "processing", "pending", "cancelled"]
    for day in range(10, 0, -1):
        for _ in range(random.randint(1, 3)):
            cust = random.choice(custs)
            items = []
            for _ in range(random.randint(1, 3)):
                pr = random.choice(prods)
                items.append({"product_id": pr["id"], "name": pr["name"],
                              "quantity": random.randint(1, 4), "price": pr["price"]})
            subtotal = sum(i["price"] * i["quantity"] for i in items)
            tax = round(subtotal * 0.08, 2)
            total = round(subtotal + tax, 2)
            st = random.choice(statuses)
            order_number = await _next_seq(owner_id, "orders", "ORD")
            created = (datetime.now(timezone.utc) - timedelta(days=day, hours=random.randint(1, 20))).isoformat()
            await db.orders.insert_one({
                "id": new_id(), "owner_id": owner_id, "order_number": order_number,
                "customer_id": cust["id"], "customer_name": cust["name"], "items": items,
                "subtotal": subtotal, "tax": tax, "total": total, "status": st,
                "payment_status": "paid" if st == "completed" else "unpaid",
                "created_at": created,
            })

    # Employees
    employees_seed = [
        {"name": "Sanya Kapoor", "email": "sanya@company.in", "role": "Store Manager", "department": "Operations", "salary": 52000, "phone": "+91 98111-22334"},
        {"name": "Rohit Verma", "email": "rohit@company.in", "role": "Cashier", "department": "Sales", "salary": 28000, "phone": "+91 99887-66553"},
        {"name": "Ananya Das", "email": "ananya@company.in", "role": "Accountant", "department": "Finance", "salary": 46000, "phone": "+91 90090-11223"},
        {"name": "Karthik Rao", "email": "karthik@company.in", "role": "Warehouse Lead", "department": "Logistics", "salary": 34000, "phone": "+91 98220-99887"},
    ]
    for e in employees_seed:
        e.update({"id": new_id(), "owner_id": owner_id, "status": "active", "joined_at": now_iso()})
    await db.employees.insert_many(employees_seed)

    suppliers_seed = [
        {"name": "Tata Beverages Pvt Ltd", "contact_person": "Anil Bhatt", "email": "anil@tatabev.in", "phone": "+91 22 5555 0100"},
        {"name": "Bharat Electronics Distribution", "contact_person": "Meena Rao", "email": "meena@bharatelec.in", "phone": "+91 80 5555 2020"},
        {"name": "Northwood Paper India", "contact_person": "Ritu Malhotra", "email": "ritu@northwood.in", "phone": "+91 11 5555 4040"},
    ]
    for s in suppliers_seed:
        s.update({"id": new_id(), "owner_id": owner_id, "address": "", "products_supplied": "", "created_at": now_iso()})
    await db.suppliers.insert_many(suppliers_seed)

    expenses_seed = [
        {"category": "Rent", "description": "Monthly shop rent", "amount": 22000},
        {"category": "Utilities", "description": "Electricity + Water", "amount": 3400},
        {"category": "Marketing", "description": "Instagram + Meta ads", "amount": 4800},
        {"category": "Salaries", "description": "Weekly payroll", "amount": 36000},
        {"category": "GST", "description": "Quarterly GST filing", "amount": 8500},
        {"category": "Supplies", "description": "Cleaning + packaging", "amount": 1200},
    ]
    for e in expenses_seed:
        e.update({"id": new_id(), "owner_id": owner_id,
                  "date": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 20))).date().isoformat(),
                  "created_at": now_iso()})
    await db.expenses.insert_many(expenses_seed)

    # Invoices from completed orders
    orders_all = await db.orders.find({"owner_id": owner_id, "status": "completed"}, _proj()).to_list(50)
    for o in orders_all[:8]:
        inv_num = await _next_seq(owner_id, "invoices", "INV")
        await db.invoices.insert_one({
            "id": new_id(), "owner_id": owner_id, "invoice_number": inv_num,
            "order_id": o["id"], "customer_name": o["customer_name"],
            "amount": o["subtotal"], "tax": o["tax"], "total": o["total"],
            "status": "paid", "due_date": "", "created_at": o["created_at"],
        })

    return {"ok": True, "message": "Seeded demo data"}


# ---------------------------------------------------------------------------
# Router / CORS / Startup
# ---------------------------------------------------------------------------

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
            "https://ramdeventerprises-1qr4.vercel.app",
            "https://ramdeventerprises-1qr4-73pd7mxys-ramdeventerprise.vercel.app"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index([("owner_id", 1), ("created_at", -1)])
    await db.customers.create_index([("owner_id", 1), ("created_at", -1)])
    await db.orders.create_index([("owner_id", 1), ("created_at", -1)])
    await db.invoices.create_index([("owner_id", 1), ("created_at", -1)])
    # seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@businessflow.io").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@12345")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": new_id(),
            "name": "Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "super_admin",
            "business_name": "BusinessFlow HQ",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
