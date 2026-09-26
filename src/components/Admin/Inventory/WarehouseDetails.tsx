"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, PlusIcon, RefreshCwIcon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { fulfilmentApi, type Warehouse, type WarehouseBin } from "@/lib/api/endpoints/fulfilment";

export default function AdminWarehouseDetails({ warehouseId }: { warehouseId?: string }) {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [bins, setBins] = useState<WarehouseBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [binForm, setBinForm] = useState({ aisle: "", shelf: "", bin: "", zone: "", capacity: 100 });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError("");
    try {
      const [w, b] = await Promise.all([
        fulfilmentApi.getWarehouse(warehouseId),
        fulfilmentApi.listBins(warehouseId),
      ]);
      setWarehouse(w);
      setBins(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load warehouse.");
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => { void load(); }, [load]);

  const addBin = async (e: FormEvent) => {
    e.preventDefault();
    if (!warehouseId || !binForm.aisle.trim() || !binForm.shelf.trim() || !binForm.bin.trim()) return;
    setBusy(true);
    try {
      await fulfilmentApi.createBin(warehouseId, {
        aisle: binForm.aisle.trim(),
        shelf: binForm.shelf.trim(),
        bin: binForm.bin.trim(),
        zone: binForm.zone.trim() || null,
        capacity: binForm.capacity || 0,
      });
      setBinForm({ aisle: "", shelf: "", bin: "", zone: "", capacity: 100 });
      toast.success("Bin created.");
      await load();
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "Unable to create bin.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="p-10 text-center text-muted-foreground">Loading warehouse...</p>;
  if (error || !warehouse) return <p className="p-10 text-center text-destructive">{error || "Warehouse not found."}</p>;

  return (
    <div className="admin-catalog-page space-y-5">
      <section className="admin-catalog-header flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/dashboard?tab=inventory&menu=inventory&item=warehouses" className="text-sm text-primary-600">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1 inline" size={14} />All warehouses
          </Link>
          <h2 className="mt-1 text-2xl font-bold">{warehouse.name} <span className="text-muted-foreground text-lg">({warehouse.code})</span></h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[warehouse.street, warehouse.ward, warehouse.district, warehouse.region, warehouse.country].filter(Boolean).join(", ")}
          </p>
        </div>
        <button onClick={() => void load()} className="rounded-xl border px-3 py-2" aria-label="Refresh">
          <HugeiconsIcon icon={RefreshCwIcon} size={16} />
        </button>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="admin-catalog-card p-5">
          <p className="text-xs uppercase text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-bold capitalize">{warehouse.status}</p>
        </div>
        <div className="admin-catalog-card p-5">
          <p className="text-xs uppercase text-muted-foreground">Capacity</p>
          <p className="mt-1 text-lg font-bold">{warehouse.used_capacity ?? 0} / {warehouse.total_capacity ?? 0}</p>
        </div>
        <div className="admin-catalog-card p-5">
          <p className="text-xs uppercase text-muted-foreground">Bins</p>
          <p className="mt-1 text-lg font-bold">{bins.length}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={addBin} className="admin-catalog-form">
          <h3 className="font-bold">Add Bin</h3>
          <Field label="Aisle"><input className="field" value={binForm.aisle} onChange={(e) => setBinForm((f) => ({ ...f, aisle: e.target.value }))} placeholder="A1" /></Field>
          <Field label="Shelf"><input className="field" value={binForm.shelf} onChange={(e) => setBinForm((f) => ({ ...f, shelf: e.target.value }))} placeholder="S1" /></Field>
          <Field label="Bin"><input className="field" value={binForm.bin} onChange={(e) => setBinForm((f) => ({ ...f, bin: e.target.value }))} placeholder="B1" /></Field>
          <Field label="Zone"><input className="field" value={binForm.zone} onChange={(e) => setBinForm((f) => ({ ...f, zone: e.target.value }))} placeholder="general" /></Field>
          <Field label="Capacity"><input type="number" min={0} className="field" value={binForm.capacity} onChange={(e) => setBinForm((f) => ({ ...f, capacity: Number(e.target.value) }))} /></Field>
          <button disabled={busy || !binForm.aisle || !binForm.shelf || !binForm.bin} className="mt-5 w-full rounded-xl bg-foreground py-3 font-semibold text-background">
            <HugeiconsIcon icon={PlusIcon} className="mr-2 inline" size={14} />Add Bin
          </button>
        </form>

        <section className="admin-catalog-card overflow-hidden">
          <div className="admin-catalog-toolbar"><h3 className="font-bold">Storage bins</h3></div>
          {!bins.length ? (
            <p className="p-10 text-center text-muted-foreground">No bins in this warehouse yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-5 py-3">Bin</th>
                    <th className="px-5 py-3">Zone</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bins.map((b) => (
                    <tr key={b.id}>
                      <td className="px-5 py-4 font-semibold">{b.aisle}-{b.shelf}-{b.bin}</td>
                      <td className="px-5 py-4 text-muted-foreground">{b.zone ?? "—"}</td>
                      <td className="px-5 py-4 text-muted-foreground">{b.used_capacity} / {b.capacity}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${b.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                          {b.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
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
