import CrudPage from "@/components/CrudPage";

export default function Suppliers() {
  return (
    <CrudPage
      title="Suppliers"
      subtitle="Procurement"
      endpoint="/suppliers"
      testId="suppliers-page"
      defaults={{ name: "", contact_person: "", email: "", phone: "", address: "", products_supplied: "" }}
      fields={[
        { key: "name", label: "Supplier name", required: true, full: true },
        { key: "contact_person", label: "Contact person" },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone" },
        { key: "address", label: "Address" },
        { key: "products_supplied", label: "Products supplied", type: "textarea", full: true },
      ]}
      columns={[
        { key: "name", label: "Supplier", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-neutral-500">{r.contact_person}</div></div> },
        { key: "email", label: "Email", mono: true },
        { key: "phone", label: "Phone", mono: true },
      ]}
    />
  );
}
