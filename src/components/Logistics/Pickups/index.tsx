"use client";

import { logisticsApi } from "@/lib/api/endpoints/logistics";
import type { LogisticsMember, LogisticsPickupJob, Paginated, PickupJobStatus } from "@/types/api/logistics";
import type { CustomerPickupProof } from "@/types/api/pickup-verification";
import { Camera, ChevronLeft, ChevronRight, LocateFixed, PackageCheck, RefreshCw, ShieldCheck, UserRoundCheck } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const statuses: Array<PickupJobStatus | ""> = ["", "scheduled", "assigned", "en_route", "arrived", "completed", "failed", "cancelled"];
const transitions: Partial<Record<PickupJobStatus, PickupJobStatus[]>> = {
  scheduled: ["cancelled"], assigned: ["en_route", "cancelled"], en_route: ["arrived", "failed"],
  arrived: ["completed", "failed"], failed: ["cancelled"],
};
const label = (value: string) => value.replaceAll("_", " ");
const date = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not scheduled";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "The request could not be completed.";
const memberName = (member: LogisticsMember) => [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;

export default function PickupJobsPage() {
  const [data, setData] = useState<Paginated<LogisticsPickupJob> | null>(null); const [members, setMembers] = useState<LogisticsMember[]>([]);
  const [page, setPage] = useState(1); const [status, setStatus] = useState<PickupJobStatus | "">(""); const [mine, setMine] = useState(false);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [selected, setSelected] = useState<LogisticsPickupJob | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [jobs, team] = await Promise.all([logisticsApi.getPickupJobs({ page, page_size: 12, status: status || undefined, assigned_to_me: mine }), logisticsApi.getMembers()]); setData(jobs); setMembers(team.filter((item) => item.is_active)); } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); } }, [mine, page, status]);
  useEffect(() => { void load(); }, [load]);
  const names = useMemo(() => new Map(members.map((member) => [member.id, memberName(member)])), [members]);

  return <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-blue">Dispatch board</p><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pickup jobs</h2><p className="mt-1 text-sm text-slate-500">Assign couriers and keep every seller pickup moving.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"><RefreshCw size={17} className={loading ? "animate-spin" : ""} />Refresh</button></header>
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[15rem_1fr] sm:items-center sm:p-4 dark:border-slate-700 dark:bg-slate-800"><select aria-label="Filter pickup jobs by status" value={status} onChange={(e) => { setStatus(e.target.value as PickupJobStatus | ""); setPage(1); }} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm capitalize dark:border-slate-600 dark:bg-slate-900">{statuses.map((item) => <option key={item || "all"} value={item}>{item ? label(item) : "All statuses"}</option>)}</select><label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-1 text-sm font-medium"><input type="checkbox" checked={mine} onChange={(e) => { setMine(e.target.checked); setPage(1); }} className="h-5 w-5 rounded border-slate-300 accent-blue" />Only jobs assigned to me</label></section>
    {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><p className="break-words text-sm text-red-700">{error}</p><button onClick={() => void load()} className="mt-3 min-h-11 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white">Try again</button></div>}
    {loading && !data ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div> : data?.results.length ? <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.results.map((job) => <JobCard key={job.id} job={job} assignee={job.assigned_membership_id ? names.get(job.assigned_membership_id) : undefined} open={() => setSelected(job)} />)}</section> : !error && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800"><PackageCheck className="mx-auto text-slate-400" /><h3 className="mt-3 font-semibold">No pickup jobs found</h3><p className="mt-1 text-sm text-slate-500">New jobs appear after a ready shipment is scheduled for pickup.</p></div>}
    {data && data.total_pages > 1 && <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800"><span className="text-slate-500">{data.total} job(s) · Page {page} of {data.total_pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-11 rounded-xl border px-3 disabled:opacity-40" aria-label="Previous page"><ChevronLeft /></button><button disabled={page >= data.total_pages} onClick={() => setPage(page + 1)} className="min-h-11 rounded-xl border px-3 disabled:opacity-40" aria-label="Next page"><ChevronRight /></button></div></nav>}
    {selected && <JobPanel job={selected} members={members} close={() => setSelected(null)} changed={() => { setSelected(null); void load(); }} />}
  </div>;
}

function JobCard({ job, assignee, open }: { job: LogisticsPickupJob; assignee?: string; open: () => void }) {
  return <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><PackageCheck size={19} /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize dark:bg-slate-700">{label(job.status)}</span></div><h3 className="mt-4 break-all font-semibold">{job.pickup_reference}</h3><p className="mt-1 text-sm text-slate-500">Shipment {job.shipment_id.slice(0, 8)}</p><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Courier</dt><dd className="max-w-[65%] break-words text-right font-medium">{assignee || "Unassigned"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Scheduled</dt><dd className="max-w-[65%] text-right">{date(job.scheduled_for)}</dd></div></dl><button onClick={open} className="mt-4 min-h-11 w-full rounded-xl border border-blue text-sm font-semibold text-blue hover:bg-blue/5">Manage job</button></article>;
}

function JobPanel({ job, members, close, changed }: { job: LogisticsPickupJob; members: LogisticsMember[]; close: () => void; changed: () => void }) {
  const allowed = transitions[job.status] || []; const [memberId, setMemberId] = useState(job.assigned_membership_id || ""); const [scheduled, setScheduled] = useState(job.scheduled_for ? job.scheduled_for.slice(0, 16) : "");
  const [next, setNext] = useState<PickupJobStatus | "">(allowed[0] || ""); const [notes, setNotes] = useState(""); const [failure, setFailure] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [pickupProof, setPickupProof] = useState<CustomerPickupProof | null>(null);
  const [proofLoading, setProofLoading] = useState(job.status === "arrived");
  const [proofUploading, setProofUploading] = useState(false);
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [proofLat, setProofLat] = useState("");
  const [proofLng, setProofLng] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [locating, setLocating] = useState(false);
  const assign = async (e: FormEvent) => { e.preventDefault(); if (!memberId) return; setBusy(true); setError(""); try { await logisticsApi.assignPickupJob(job.id, { assigned_membership_id: memberId, scheduled_for: scheduled ? new Date(scheduled).toISOString() : undefined }); changed(); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } };
  const update = async (e: FormEvent) => { e.preventDefault(); if (!next) return; if (next === "failed" && !failure.trim()) { setError("Failure reason is required when a pickup fails."); return; } setBusy(true); setError(""); try { await logisticsApi.updatePickupJobStatus(job.id, { status: next, notes: notes || undefined, failure_reason: failure || undefined }); changed(); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } };
  useEffect(() => {
    if (job.status !== "arrived") return;
    let active = true;
    setProofLoading(true);
    logisticsApi.getPickupProof(job.shipment_id)
      .then((proof) => { if (active) setPickupProof(proof); })
      .catch(() => { if (active) setPickupProof(null); })
      .finally(() => { if (active) setProofLoading(false); });
    return () => { active = false; };
  }, [job.shipment_id, job.status]);

  const locatePickup = () => {
    if (!navigator.geolocation) {
      setError("GPS location is not supported by this browser.");
      return;
    }
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProofLat(String(position.coords.latitude));
        setProofLng(String(position.coords.longitude));
        setLocating(false);
      },
      () => {
        setError("Unable to read the courier GPS location. Allow location access and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const uploadProof = async (event: FormEvent) => {
    event.preventDefault();
    if (!proofPhoto || !proofLat.trim() || !proofLng.trim()) {
      setError("Pickup photo and current GPS coordinates are required.");
      return;
    }
    setProofUploading(true); setError("");
    try {
      const proof = await logisticsApi.uploadPickupProof(job.shipment_id, {
        photo: proofPhoto,
        latitude: proofLat,
        longitude: proofLng,
        courier_reference: job.pickup_reference,
        notes: proofNotes || undefined,
      });
      setPickupProof(proof);
      setProofPhoto(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProofUploading(false);
    }
  };
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Manage pickup job"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{job.pickup_reference}</h3><p className="mt-1 text-sm capitalize text-slate-500">Current status: {label(job.status)}</p></div><button onClick={close} className="min-h-11 rounded-xl px-3 text-sm font-semibold">Close</button></div>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{job.status === "arrived" && <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-800">
          <p className="flex items-center gap-2 font-semibold text-slate-950"><ShieldCheck size={17} />Seller handover + pickup proof</p>
          <p className="mt-1 leading-6">Courier arrival is recorded. The seller must confirm the physical handover. Then capture the package photo and GPS below. Xerin automatically moves the shipment to <b>Dispatched</b> after valid proof is stored.</p>
        </div>

        {proofLoading ? <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">Checking pickup evidence…</div> : pickupProof ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white"><PackageCheck size={18} /></span><div><p className="font-bold text-emerald-950">Pickup proof captured</p><p className="mt-1 text-sm text-emerald-800">Status: {label(pickupProof.status)}. The shipment custody chain is recorded. You can now complete this pickup job.</p></div></div>
        </div> : <form onSubmit={uploadProof} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div><h4 className="flex items-center gap-2 font-semibold"><Camera size={18} />Capture pickup evidence</h4><p className="mt-1 text-xs leading-5 text-slate-500">Take or choose a clear photo of the package after the seller physically hands it to the courier.</p></div>
          <label className="block text-sm font-semibold">Pickup photo<input required type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => setProofPhoto(event.target.files?.[0] || null)} className="mt-1.5 block min-h-11 w-full rounded-xl border border-slate-300 p-2 text-sm dark:border-slate-600" /></label>
          {proofPhoto && <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900"><Camera size={16} /><span className="min-w-0 truncate">{proofPhoto.name}</span></div>}
          <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Latitude<input required inputMode="decimal" value={proofLat} onChange={(event) => setProofLat(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 dark:border-slate-600" /></label><label className="text-sm font-semibold">Longitude<input required inputMode="decimal" value={proofLng} onChange={(event) => setProofLng(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 dark:border-slate-600" /></label></div>
          <button type="button" onClick={locatePickup} disabled={locating || proofUploading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue text-sm font-semibold text-blue disabled:opacity-50"><LocateFixed size={17} />{locating ? "Finding pickup location…" : "Use current GPS location"}</button>
          <textarea value={proofNotes} onChange={(event) => setProofNotes(event.target.value)} placeholder="Pickup condition or courier note (optional)" maxLength={2000} className="min-h-20 w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm dark:border-slate-600" />
          <button disabled={proofUploading || !proofPhoto || !proofLat.trim() || !proofLng.trim()} className="min-h-11 w-full rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-50">{proofUploading ? "Uploading pickup proof…" : "Capture pickup proof"}</button>
          <p className="text-xs leading-5 text-slate-500">If the seller has not confirmed handover yet, Xerin will safely block this upload and ask you to wait for seller confirmation.</p>
        </form>}
      </div>}
      {!(["completed", "cancelled"] as PickupJobStatus[]).includes(job.status) && <form onSubmit={assign} className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><h4 className="flex items-center gap-2 font-semibold"><UserRoundCheck size={18} />Assign or reschedule</h4><select required value={memberId} onChange={(e) => setMemberId(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900"><option value="">Select an active team member</option>{members.map((member) => <option key={member.id} value={member.id}>{memberName(member)} · {label(member.member_role)}</option>)}</select><input type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900" /><button disabled={busy || !memberId} className="min-h-11 w-full rounded-xl border border-blue px-4 text-sm font-semibold text-blue disabled:opacity-50">{busy ? "Saving…" : "Save assignment"}</button></form>}
      {allowed.length > 0 && <form onSubmit={update} className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><h4 className="font-semibold">Update pickup status</h4><select value={next} onChange={(e) => setNext(e.target.value as PickupJobStatus)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 capitalize dark:border-slate-600 dark:bg-slate-900">{allowed.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Courier note (optional)" className="min-h-24 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900" />{next === "failed" && <input required value={failure} onChange={(e) => setFailure(e.target.value)} placeholder="Failure reason" className="min-h-11 w-full rounded-xl border border-red-300 bg-white px-3 text-sm dark:bg-slate-900" />}<button disabled={busy || !next || (next === "completed" && !pickupProof)} className="min-h-11 w-full rounded-xl bg-blue px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : `Mark ${next ? label(next) : "status"}`}</button>{next === "completed" && <p className="text-xs text-slate-500">{pickupProof ? "Seller handover and pickup evidence are recorded. Complete the pickup to continue delivery." : "Capture the pickup-proof photo above before completing this job."}</p>}</form>}
      {(job.dispatcher_notes || job.courier_notes || job.failure_reason) && <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-700"><h4 className="font-semibold">Job notes</h4>{job.dispatcher_notes && <p><span className="text-slate-500">Dispatcher:</span> {job.dispatcher_notes}</p>}{job.courier_notes && <p><span className="text-slate-500">Courier:</span> {job.courier_notes}</p>}{job.failure_reason && <p className="text-red-700"><span className="font-medium">Failure:</span> {job.failure_reason}</p>}</div>}
    </div></div>;
}
