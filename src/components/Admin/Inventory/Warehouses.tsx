"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, PlusIcon, RefreshCwIcon, Search01Icon, Delete02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { fulfilmentApi, type Warehouse } from "@/lib/api/endpoints/fulfilment";
import { ConfirmActionDialog } from "@/components/Admin/shared/ActionDialog";

const EMPTY_FORM = { name: "", code: "", country: "Tanzania", region: "", district: "", total_capacity: 0 };

export default function AdminWarehouses() {
  const [rows, setRows] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fulfilmentApi.listWarehouses({ search: debouncedQuery || undefined, page_size: 100 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load warehouses.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => { void load(); }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.region.trim()) return;
    setBusy(true);
    try {
      await fulfilmentApi.createWarehouse({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        country: form.country.trim(),
        region: form.region.trim(),
        district: form.district.trim() || null,
        total_capacity: form.total_capacity || 0,
      });
      setForm(EMPTY_FORM);
      toast.success("Warehouse created.");
      await load();
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "Unable to create warehouse.");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await fulfilmentApi.updateWarehouse(editing.id, {
        name: editing.name,
        code: editing.code,
        country: editing.country,
        region: editing.region,
        district: editing.district,
        status: editing.status,
        total_capacity: editing.total_capacity ?? 0,
      });
      toast.success("Warehouse updated.");
      setEditing(null);
      await load();
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "Unable to update warehouse.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await fulfilmentApi.deleteWarehouse(deleteTarget.id);
      toast.success("Warehouse deleted.");
      setDeleteTarget(null);
      await load();
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "Unable to delete warehouse.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-catalog-page space-y-5">
      <section className="admin-catalog-header">
        <h2 className="text-2xl font-bold">Warehouses</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage fulfilment warehouses and capacity.</p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={submit} className="admin-catalog-form">
          <h3 className="font-bold">Add Warehouse</h3>
          <Field label="Name"><input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
          <Field label="Code"><input className="field" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="DAR-01" /></Field>
          <Field label="Region"><input className="field" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="Dar es Salaam" /></Field>
          <Field label="District"><input className="field" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} /></Field>
          <Field label="Total capacity"><input type="number" min={0} className="field" value={form.total_capacity} onChange={(e) => setForm((f) => ({ ...f, total_capacity: Number(e.target.value) }))} /></Field>
          <button disabled={busy || !form.name.trim() || !form.code.trim() || !form.region.trim()} className="mt-5 w-full rounded-xl bg-foreground py-3 font-semibold text-background">
            <HugeiconsIcon icon={PlusIcon} className="mr-2 inline" size={14} />Add Warehouse
          </button>
        </form>

        <section className="admin-catalog-card overflow-hidden">
          <div className="admin-catalog-toolbar">
            <div className="relative flex-1">
              <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search warehouses..." className="h-10 w-full rounded-xl border pl-9 pr-3" />
            </div>
            <button onClick={() => void load()} className="rounded-xl border px-3" aria-label="Refresh">
              <HugeiconsIcon icon={RefreshCwIcon} size={16} />
            </button>
          </div>
          {loading ? (
            <p className="p-10 text-center text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="p-10 text-center text-destructive">{error}</p>
          ) : !rows.length ? (
            <p className="p-10 text-center text-muted-foreground">No warehouses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-5 py-3">Warehouse</th>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((w) => (
                    <tr key={w.id}>
                      <td className="px-5 py-4 font-semibold">
                        <Link href={`/admin/inventory/warehouses/${w.id}`} className="hover:text-primary-600">{w.name}</Link>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{w.code}</td>
                      <td className="px-5 py-4 text-muted-foreground">{[w.district, w.region, w.country].filter(Boolean).join(", ")}</td>
                      <td className="px-5 py-4 text-muted-foreground">{w.used_capacity ?? 0} / {w.total_capacity ?? 0}</td>
                      <td className="px-5 py-4"><StatusBadge status={w.status} /></td>
                      <td className="px-5 py-4">
                        <button onClick={() => setEditing({ ...w })} className="mr-4 text-primary-600">
                          <HugeiconsIcon icon={Edit02Icon} className="inline" size={14} /> Edit
                        </button>
                        <button onClick={() => setDeleteTarget(w)} className="text-destructive">
                          <HugeiconsIcon icon={Delete02Icon} className="inline" size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6">
            <div className="flex justify-between">
              <h3 className="font-bold">Edit Warehouse</h3>
              <button onClick={() => setEditing(null)} aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>
            <Field label="Name"><input className="field" value={editing.name} onChange={(e) => setEditing((c) => c ? { ...c, name: e.target.value } : c)} /></Field>
            <Field label="Status">
              <select className="field" value={editing.status} onChange={(e) => setEditing((c) => c ? { ...c, status: e.target.value as Warehouse["status"] } : c)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </Field>
            <button onClick={() => void save()} disabled={busy} className="mt-5 w-full rounded-xl bg-foreground py-3 font-semibold text-background">Save Changes</button>
          </div>
        </div>
      )}

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        title="Delete warehouse?"
        description={<>The warehouse <strong>{deleteTarget?.name}</strong> will be permanently deleted.</>}
        confirmLabel="Delete warehouse"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
      />
      <style jsx global>{`.field{margin-top:.5rem;min-height:46px;width:100%;border-radius:.75rem;border:2px solid #d8e0e9;background:#fff;padding:.7rem .9rem;outline:none}.field:focus{border-color:#f47524}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-700",
    maintenance: "bg-amber-100 text-amber-800",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${colors[status] ?? "bg-muted"}`}>{status}</span>;
}
