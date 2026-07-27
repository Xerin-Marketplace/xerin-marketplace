"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService, type AdminProduct } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/errors";
import UnavailableFeature from "@/components/Admin/Common/UnavailableFeature";
import { formatCurrency } from "@/lib/formatCurrency";

const message = (error: unknown) => error instanceof ApiError || error instanceof Error ? error.message : "Unable to load product moderation data.";

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try { setProducts(await adminService.listPendingProducts()); }
    catch (cause) { setError(message(cause)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const approve = async (id: string) => {
    setBusy(id);
    try { await adminService.approveProduct(id); toast.success("Product approved."); await load(); }
    catch (cause) { toast.error(message(cause)); }
    finally { setBusy(null); }
  };

  const reject = async (id: string) => {
    const reason = window.prompt("Enter the product rejection reason:")?.trim();
    if (!reason) return;
    setBusy(id);
    try { await adminService.rejectProduct(id, reason); toast.success("Product rejected."); await load(); }
    catch (cause) { toast.error(message(cause)); }
    finally { setBusy(null); }
  };

  return <div className="space-y-5">
    <UnavailableFeature title="Full admin product management is not available yet" description="The backend currently supports pending-product moderation only. Full listing, details, create, update, archive and admin delete operations are not simulated." />
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-5"><div><h3 className="text-lg font-semibold">Pending product moderation</h3><p className="text-sm text-gray-500">Live submissions returned by the backend.</p></div><button onClick={() => void load()} className="rounded-xl border px-4 py-2 text-sm font-semibold">Refresh</button></div>
      {loading ? <p className="p-10 text-center text-gray-500">Loading pending products...</p> : error ? <div className="p-10 text-center"><p className="text-red-600">{error}</p><button onClick={() => void load()} className="mt-3 font-semibold text-orange-600">Retry</button></div> : products.length === 0 ? <p className="p-10 text-center text-gray-500">No products awaiting approval.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50"><tr>{["Product","SKU","Price","Status","Created","Actions"].map(label => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody className="divide-y">{products.map(product => <tr key={product.id}><td className="px-5 py-4 font-semibold">{product.name}</td><td className="px-5 py-4 text-gray-500">{product.sku}</td><td className="px-5 py-4">{formatCurrency(product.price, product.currency)}</td><td className="px-5 py-4 capitalize">{product.status.replaceAll("_", " ")}</td><td className="px-5 py-4 text-gray-500">{new Date(product.created_at).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex gap-2"><button disabled={busy === product.id} onClick={() => void approve(product.id)} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button disabled={busy === product.id} onClick={() => void reject(product.id)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Reject</button></div></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
