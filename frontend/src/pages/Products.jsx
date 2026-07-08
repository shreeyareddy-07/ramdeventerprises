import CrudPage from "@/components/CrudPage";

export default function Products() {
  return (
    <CrudPage
      title="Products"
      subtitle="Inventory"
      endpoint="/products"
      testId="products-page"
      defaults={{ name: "", sku: "", category: "", price: 0, cost: 0, stock: 0, low_stock_threshold: 10, unit: "pcs", description: "" }}
      fields={[
        { key: "name", label: "Name", required: true, full: true },
        { key: "sku", label: "SKU", required: true },
        { key: "category", label: "Category", required: true },
        { key: "price", label: "Price", type: "number", required: true },
        { key: "cost", label: "Cost", type: "number" },
        { key: "stock", label: "Stock", type: "number" },
        { key: "low_stock_threshold", label: "Low stock at", type: "number" },
        { key: "unit", label: "Unit" },
        { key: "description", label: "Description", type: "textarea", full: true },
      ]}
      columns={[
        { key: "name", label: "Name", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-neutral-500">{r.category}</div></div> },
        { key: "sku", label: "SKU", mono: true },
        { key: "price", label: "Price", mono: true, align: "right", render: (r) => `₹${(r.price||0).toFixed(2)}` },
        { key: "stock", label: "Stock", mono: true, align: "right",
          render: (r) => <span className={r.stock <= (r.low_stock_threshold||10) ? "text-amber-700 font-semibold" : ""}>{r.stock}</span> },
      ]}
    />
  );
}
