import CrudPage from "@/components/CrudPage";

export default function Employees() {
  return (
    <CrudPage
      title="Employees"
      subtitle="HR"
      endpoint="/employees"
      testId="employees-page"
      defaults={{ name: "", email: "", phone: "", role: "", department: "", salary: 0, status: "active" }}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "email", label: "Email", type: "email" },
        { key: "role", label: "Role" },
        { key: "department", label: "Department" },
        { key: "phone", label: "Phone" },
        { key: "salary", label: "Salary", type: "number" },
        { key: "status", label: "Status", type: "select",
          options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
      ]}
      columns={[
        { key: "name", label: "Name", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-neutral-500">{r.role} · {r.department}</div></div> },
        { key: "email", label: "Email", mono: true },
        { key: "salary", label: "Salary", align: "right", mono: true, render: (r) => `₹${(r.salary||0).toFixed(2)}` },
        { key: "status", label: "Status", render: (r) => <span className={`text-xs uppercase tracking-wider ${r.status==="active"?"text-green-700":"text-neutral-500"}`}>{r.status}</span> },
      ]}
    />
  );
}
