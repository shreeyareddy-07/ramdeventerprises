import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { api } from "@/lib/api";

const KIND_ROUTE = {
  product: "/app/products",
  customer: "/app/customers",
  order: "/app/orders",
  invoice: "/app/invoices",
  employee: "/app/employees",
};

export default function GlobalSearch({ open, onOpenChange }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [onOpenChange]);

  useEffect(() => {
    if (!q) { setResults([]); return; }
    const id = setTimeout(async () => {
      try {
        const { data } = await api.get("/search", { params: { q } });
        setResults(data.results || []);
      } catch {}
    }, 200);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search products, customers, orders, invoices…"
        value={q}
        onValueChange={setQ}
        data-testid="global-search-input"
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {["product", "customer", "order", "invoice", "employee"].map((k) => {
          const items = results.filter((r) => r.kind === k);
          if (!items.length) return null;
          return (
            <CommandGroup key={k} heading={k.charAt(0).toUpperCase() + k.slice(1) + "s"}>
              {items.map((r) => (
                <CommandItem
                  key={r.kind + r.id}
                  onSelect={() => { onOpenChange(false); nav(KIND_ROUTE[r.kind]); }}
                  data-testid={`search-result-${r.kind}-${r.id}`}
                >
                  <span className="font-medium">{r.label}</span>
                  {r.sub && <span className="ml-2 text-xs text-neutral-500">{r.sub}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
