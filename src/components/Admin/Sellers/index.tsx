"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api/client";
import { adminService, type AdminSeller, type AdminSellerDocument } from "@/lib/api/endpoints/admin";

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : "Unable to complete this seller action.";

export default function AdminSellers({ mode = "all" }: { mode?: "all" | "applications" }) {
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(mode === "applications" ? "under_review" : "all");
  const [selected, setSelected] = useState<AdminSeller | null>(null);
  const [documents, setDocuments] = useState<AdminSellerDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setSellers(await adminService.listAllSellers()); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => sellers.filter((seller) => {
    const matchesStatus = status === "all" || seller.status === status;
    const haystack = `${seller.business_name} ${seller.contact_email ?? ""} ${seller.contact_phone ?? ""}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [query, sellers, status]);

  const openSeller = async (seller: AdminSeller) => {
    setSelected(seller);
    setRejectReason("");
    setDocumentsLoading(true);
    try { setDocuments(await adminService.getSellerDocuments(seller.id)); }
    catch (error) { setDocuments([]); toast.error(errorMessage(error)); }
    finally { setDocumentsLoading(false); }
  };

  const approve = async () => {
    if (!selected) return;
    setBusy("approve");
    try {
      const updated = await adminService.approveSeller(selected.id);
      setSellers((items) => items.map((item) => item.id === updated.id ? updated : item));
      setSelected(updated);
      toast.success("Seller approved successfully.");
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(null); }
  };

  const reject = async () => {
    if (!selected || !rejectReason.trim()) { toast.error("Add a rejection reason first."); return; }
    setBusy("reject");
    try {
      const updated = await adminService.rejectSeller(selected.id, rejectReason.trim());
      setSellers((items) => items.map((item) => item.id === updated.id ? updated : item));
      setSelected(updated);
      toast.success("Seller application rejected.");
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(null); }
  };

  const counts = {
    total: sellers.length,
    review: sellers.filter((seller) => seller.status.includes("review")).length,
    approved: sellers.filter((seller) => seller.status === "approved").length,
    rejected: sellers.filter((seller) => seller.status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[["All sellers", counts.total], ["Under review", counts.review], ["Approved", counts.approved], ["Rejected", counts.rejected]].map(([label, value], index) => (
          <div key={label} className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ${["border-orange-100 bg-gradient-to-br from-white to-orange-50", "border-amber-100 bg-gradient-to-br from-white to-amber-50", "border-green-100 bg-gradient-to-br from-white to-green-50", "border-red-100 bg-gradient-to-br from-white to-red-50"][index]}`}><span className={`absolute inset-x-0 top-0 h-1 ${["bg-orange-500", "bg-amber-500", "bg-green-500", "bg-red-500"][index]}`} /><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-semibold text-[#111827]">{value}</p></div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h3 className="text-lg font-semibold text-[#111827]">{mode === "applications" ? "Seller applications" : "All sellers"}</h3><p className="text-sm text-gray-500">{mode === "applications" ? "Review business details and KYC documents before approval." : "Search, review and manage every seller account on the marketplace."}</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, email or phone" className="min-w-[260px] rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm outline-none focus:border-[#f47524]" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"><option value="all">All statuses</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
            <button type="button" onClick={() => void load()} className="rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">Refresh</button>
          </div>
        </div>
        {loading ? <div className="p-12 text-center text-gray-500">Loading sellers...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-500">No sellers match these filters.</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f8fafc] text-xs uppercase text-gray-500"><tr>{["Business", "Contact", "Location", "Submitted", "Status", ""].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((seller) => <tr key={seller.id} className="hover:bg-orange-50/40"><td className="px-5 py-4 font-medium text-[#111827]">{seller.business_name}</td><td className="px-5 py-4 text-sm text-gray-600">{seller.contact_email ?? seller.contact_phone ?? "—"}</td><td className="px-5 py-4 text-sm text-gray-600">{[seller.business_city, seller.business_country].filter(Boolean).join(", ") || "—"}</td><td className="px-5 py-4 text-sm text-gray-600">{new Date(seller.created_at).toLocaleDateString()}</td><td className="px-5 py-4"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">{seller.status.replaceAll("_", " ")}</span></td><td className="px-5 py-4 text-right"><button onClick={() => void openSeller(seller)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:border-[#f47524] hover:text-[#f47524]">Review</button></td></tr>)}</tbody></table></div>
        )}
      </div>

      {selected ? <div className="fixed inset-0 z-[99999] flex justify-end bg-black/40" onMouseDown={() => setSelected(null)}><aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#f47524]">Seller application</p><h3 className="mt-1 text-2xl font-semibold text-[#111827]">{selected.business_name}</h3><p className="mt-1 text-sm text-gray-500">{selected.contact_email ?? "No contact email"}</p></div><button onClick={() => setSelected(null)} className="rounded-lg bg-gray-100 px-3 py-2">Close</button></div><div className="mt-6 grid grid-cols-2 gap-3">{[["Status", selected.status.replaceAll("_", " ")], ["Experience", selected.years_in_business ?? "—"], ["Location", [selected.business_city, selected.business_country].filter(Boolean).join(", ") || "—"], ["Agreement", selected.agreement_accepted ? "Accepted" : "Not accepted"]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#f8fafc] p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-sm font-medium capitalize text-[#111827]">{value}</p></div>)}</div><div className="mt-6"><h4 className="font-semibold text-[#111827]">KYC documents</h4>{documentsLoading ? <p className="mt-3 text-sm text-gray-500">Loading documents...</p> : <div className="mt-3 space-y-2">{documents.map((document) => <a key={document.id} href={document.document_url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-[#f47524]"><span className="text-sm font-medium capitalize">{document.document_type.replaceAll("_", " ")}</span><span className="text-xs capitalize text-gray-500">{document.status}</span></a>)}{documents.length === 0 ? <p className="rounded-xl bg-orange-50 p-4 text-sm text-orange-700">No KYC documents uploaded.</p> : null}</div>}</div><div className="mt-6 border-t border-gray-100 pt-6"><label className="text-sm font-medium text-[#111827]">Rejection reason</label><textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={3} placeholder="Explain what the seller must correct..." className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[#f47524]" /><div className="mt-3 flex gap-3"><button disabled={Boolean(busy)} onClick={() => void approve()} className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy === "approve" ? "Approving..." : "Approve seller"}</button><button disabled={Boolean(busy)} onClick={() => void reject()} className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy === "reject" ? "Rejecting..." : "Reject application"}</button></div></div></aside></div> : null}
    </div>
  );
}
