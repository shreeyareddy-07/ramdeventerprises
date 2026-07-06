import CrudPage from "@/components/CrudPage";

export default function Customers() {
  return (
    <CrudPage
      title="Customers"
      subtitle="CRM"
      endpoint="/customers"
      testId="customers-page"
      defaults={{ name: "", email: "", phone: "", company: "", address: "", notes: "" }}
      fields={[
        { key: "name", label: "Full name", required: true },
        { key: "company", label: "Company" },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone" },
        { key: "address", label: "Address", full: true },
        { key: "notes", label: "Notes", type: "textarea", full: true },
      ]}
      columns={[
        { key: "name", label: "Name", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-neutral-500">{r.company}</div></div> },
        { key: "email", label: "Email", mono: true },
        { key: "phone", label: "Phone", mono: true },
        { key: "total_orders", label: "Orders", align: "right", mono: true },
        { key: "total_spent", label: "Spent", align: "right", mono: true, render: (r) => `$${(r.total_spent||0).toFixed(2)}` },
      ]}
    />
  );
}
