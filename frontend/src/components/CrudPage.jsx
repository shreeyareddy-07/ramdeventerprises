import { useEffect, useMemo, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
         AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Reusable CRUD screen.
 * props: title, subtitle, endpoint (e.g. "/products"), columns [{key,label,mono?,render?,align?}],
 *        fields [{key,label,type,required?,placeholder?,options?}], defaults, testId, allowEdit=true
 */
export default function CrudPage({
  title, subtitle, endpoint, columns, fields, defaults, testId,
  allowEdit = true, allowDelete = true, extraToolbar = null,
}) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaults);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint, { params: { search: q } });
      setRows(data);
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // initial
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

  const openCreate = () => { setEditing(null); setForm(defaults); setOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaults, ...row }); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {};
      fields.forEach((f) => {
        let v = form[f.key];
        if (f.type === "number") v = Number(v) || 0;
        payload[f.key] = v ?? "";
      });
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload);
        toast.success(`${title} updated`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`${title} created`);
      }
      setOpen(false);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const del = async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success("Deleted");
      setConfirmDel(null);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div data-testid={testId}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{subtitle}</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)}
                   className="pl-9 rounded-sm border-neutral-300 h-10 w-64" data-testid={`${testId}-search`} />
          </div>
          {extraToolbar}
          <Button onClick={openCreate} data-testid={`${testId}-create-btn`}
                  className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-10 px-4">
            <Plus className="w-4 h-4 mr-1.5" /> New
          </Button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`text-${c.align || "left"} px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium`}>
                  {c.label}
                </th>
              ))}
              {(allowEdit || allowDelete) && <th className="w-20"></th>}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={columns.length + 1} className="py-10 text-center text-neutral-400 text-sm">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="py-16 text-center">
                <div className="text-neutral-400 text-sm mb-4">No {title.toLowerCase()} yet</div>
                <Button onClick={openCreate} variant="outline" className="rounded-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Add your first {title.slice(0, -1).toLowerCase()}
                </Button>
              </td></tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={row.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-${c.align || "left"} ${c.mono ? "mono" : ""}`}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {(allowEdit || allowDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {allowEdit && (
                        <button onClick={() => openEdit(row)} data-testid={`${testId}-edit-${row.id}`}
                                className="p-1.5 hover:bg-neutral-100 rounded-sm text-neutral-500 hover:text-[#002FA7]">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {allowDelete && (
                        <button onClick={() => setConfirmDel(row)} data-testid={`${testId}-delete-${row.id}`}
                                className="p-1.5 hover:bg-red-50 rounded-sm text-neutral-500 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-sm max-w-lg" data-testid={`${testId}-dialog`}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold">
              {editing ? "Edit" : "New"} {title.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "col-span-2" : ""}>
                  <Label htmlFor={f.key}>{f.label}{f.required && " *"}</Label>
                  {f.type === "select" ? (
                    <select id={f.key} value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                            className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white"
                            data-testid={`${testId}-field-${f.key}`} required={f.required}>
                      {(f.options || []).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea id={f.key} value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                              className="mt-1.5 w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm min-h-[80px]"
                              placeholder={f.placeholder} data-testid={`${testId}-field-${f.key}`} />
                  ) : (
                    <Input id={f.key} type={f.type || "text"} value={form[f.key] ?? ""}
                           onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                           step={f.type === "number" ? "any" : undefined}
                           placeholder={f.placeholder} required={f.required}
                           className="mt-1.5 rounded-sm" data-testid={`${testId}-field-${f.key}`} />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={busy} data-testid={`${testId}-submit-btn`}
                      className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm">
                {busy ? "Saving…" : editing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={() => setConfirmDel(null)}>
        <AlertDialogContent className="rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {title.slice(0, -1).toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => del(confirmDel.id)} data-testid={`${testId}-confirm-delete-btn`}
                               className="bg-red-600 hover:bg-red-700 text-white rounded-sm">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
