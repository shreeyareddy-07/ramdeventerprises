# BusinessFlow — Product Requirements Document

## Original problem
Build BusinessFlow — a full-stack, production-ready ERP + CRM + Business Management SaaS for SMEs across Retail, Restaurants, Cafes, Schools, Colleges, Hospitals, Clinics, Hotels, Real Estate, Manufacturing, Agriculture, Service Businesses.

## Stack (adapted to platform)
- Backend: FastAPI (Python) + MongoDB (Motor async)
- Frontend: React 19 + React Router 7 + Tailwind + shadcn/ui + Recharts + Framer Motion
- Auth: Custom JWT (email/password), httpOnly cookies + bcrypt hashing, role-based

## Design language
Swiss & High-Contrast — Klein Blue (#002FA7) + Yellow (#FFD700) accent + neutral #F5F5F0 canvas. Cabinet Grotesk/Outfit for display, IBM Plex Sans for body, IBM Plex Mono for numerics. Sharp corners (rounded-sm), sidebar dark, main light.

## User personas
- Super admin (platform), Business owner (primary v1), Branch manager, Employee, Customer (v2)

## v1 — SHIPPED (July 2026)
- Marketing landing page (hero, features, industries, pricing, testimonial, FAQ, footer)
- Auth: signup, login, forgot-password (token in logs), JWT httpOnly cookies, /auth/me
- Dashboard: KPIs (revenue/orders/customers/products/profit/employees/expenses), 14-day sales line chart, category pie, recent orders table, low-stock alerts
- Products / Inventory: full CRUD with low-stock threshold + highlight
- Customers CRM: full CRUD with total orders + total spent aggregates
- Orders: create with line items (product select auto-fills price), auto ORD-NNNNN numbering, tax computed, stock decremented, status pipeline (pending → processing → completed → cancelled), payment status
- Invoices: create with INV-NNNNN numbering, status pipeline (draft/sent/paid/overdue)
- Employees: full CRUD
- Suppliers: full CRUD
- Expenses: full CRUD + total-tracked KPI
- Reports: bar chart, pie chart, CSV export of sales series
- Business Profile: settings form
- Global search: ⌘K command palette across products/customers/orders/invoices/employees
- Seed demo data: one-click populates realistic products, customers, orders, invoices, employees, suppliers, expenses per user
- Test creds saved to /app/memory/test_credentials.md

## v1 test summary
Iteration 1 (07/2026): 1 HIGH bug in POST /api/orders (ObjectId leakage) — fixed. Iteration 2: full regression PASS. All flows verified via testing_agent_v3.

## Prioritized backlog
### P0 — Next up
- Multi-branch support (Branches model + branch selector in topbar + branch-scoped queries)
- Customer Portal (customer login, order tracking, invoice download)
- Attendance + Payroll modules
- PDF invoice download + Email send

### P1
- Support Tickets module
- Purchase Orders + Stock Transfers between branches
- Email verification on signup + Nodemailer/Resend integration
- Online store (public product catalog + checkout)
- Advanced Reports: profit margin per product, customer LTV, cohort retention
- Role-based permission enforcement (business_owner vs branch_manager vs employee views)

### P2
- Barcode / QR generation on products
- Import CSV wizard
- Audit log viewer
- Two-factor auth
- Stripe subscription billing for tiered plans
