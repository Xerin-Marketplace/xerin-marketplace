"use client";


import { Spinner } from "@/components/ui/Spinner";
import { deliveryVerificationApi } from "@/lib/api/endpoints/delivery-verification";
import { logisticsApi } from "@/lib/api/endpoints/logistics";
import { resolveBackendDocumentUrl } from "@/lib/documents/backend-document";
import type { DeliveryProofStart } from "@/types/api/delivery-verification";
import type { LogisticsShipment } from "@/types/api/logistics";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, CheckmarkCircle02Icon, LocationUpdate01Icon, RefreshCwIcon, ShieldCheckIcon, TruckIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { FormEvent, useCallback, useEffect, useState } from "react";

const message = (error: unknown) => error instanceof Error ? error.message : "The request could not be completed.";
const date = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function LogisticsDeliveryVerification() {
 const [shipments, setShipments] = useState<LogisticsShipment[]>([]); const [loading, setLoading] = useState(true);
 const [error, setError] = useState(""); const [selected, setSelected] = useState<LogisticsShipment | null>(null);
 const load = useCallback(async () => { setLoading(true); setError(""); try { const data = await logisticsApi.getShipments({ page: 1, page_size: 100, status: "out_for_delivery" }); setShipments(data.results); } catch (err) { setError(message(err)); } finally { setLoading(false); } }, []);
 useEffect(() => { void load(); }, [load]);

 return <div className="mx-auto max-w-7xl space-y-5">
 <header className="flex flex-col gap-3 rounded-xl bg-carbon p-4 text-white sm:flex-row sm:items-end sm:justify-between sm:p-6"><div><p className="text-sm text-white/70">Proof of delivery</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">Recipient OTP verification</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Capture delivery evidence at the confirmed destination, send the recipient’s OTP, and verify it before completing delivery.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-card/15 px-4 text-sm font-semibold disabled:opacity-50">{loading ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={16} />}Refresh</button></header>
 {error && <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm text-red-dark">{error}</div>}
 {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-xl bg-muted dark:bg-muted" />)}</div> : shipments.length ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shipments.map((shipment) => <article key={shipment.id} className="rounded-xl border border-border bg-card p-4 shadow-sm dark:border-border dark:bg-muted"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><HugeiconsIcon icon={TruckIcon} size={20} /></span><span className="rounded-full bg-yellow-light-2 px-2.5 py-1 text-xs font-semibold text-yellow-dark-2">Out for delivery</span></div><h3 className="mt-4 break-all font-bold">{shipment.tracking_number || `Shipment ${shipment.id.slice(0, 8)}`}</h3><p className="mt-1 text-sm text-muted-foreground">Order {shipment.order_id.slice(0, 8)} · {shipment.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</p><p className="mt-3 text-xs text-muted-foreground">Created {date(shipment.created_at)}</p><button onClick={() => setSelected(shipment)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"><HugeiconsIcon icon={ShieldCheckIcon} size={18} />Start delivery proof</button></article>)}</section> : !error && <div className="rounded-xl border border-dashed border-border bg-card p-9 text-center dark:border-border dark:bg-muted"><HugeiconsIcon icon={CheckmarkCircle02Icon} className="mx-auto text-green-dark" size={28} /><h3 className="mt-3 font-bold">No deliveries awaiting OTP</h3><p className="mt-1 text-sm text-muted-foreground">Shipments appear here after they are marked out for delivery.</p></div>}
 {selected && <DeliveryFlow shipment={selected} close={() => setSelected(null)} complete={() => { setSelected(null); void load(); }} />}
 </div>;
}

function DeliveryFlow({ shipment, close, complete }: { shipment: LogisticsShipment; close: () => void; complete: () => void }) {
 const [recipient, setRecipient] = useState(""); const [latitude, setLatitude] = useState(""); const [longitude, setLongitude] = useState("");
 const [notes, setNotes] = useState(""); const [photo, setPhoto] = useState<File | null>(null); const [started, setStarted] = useState<DeliveryProofStart | null>(null); const [resending, setResending] = useState(false); const [resendCooldown, setResendCooldown] = useState(0);
 const [otp, setOtp] = useState(""); const [busy, setBusy] = useState(false); const [locating, setLocating] = useState(false); const [error, setError] = useState("");
 const locate = () => { if (!navigator.geolocation) { setError("Location services are unavailable on this device."); return; } setLocating(true); setError(""); navigator.geolocation.getCurrentPosition((position) => { setLatitude(position.coords.latitude.toFixed(6)); setLongitude(position.coords.longitude.toFixed(6)); setLocating(false); }, () => { setError("Location permission was denied or the GPS position could not be found."); setLocating(false); }, { enableHighAccuracy: true, timeout: 15000 }); };
 const start = async (event: FormEvent) => { event.preventDefault(); if (!photo) { setError("Take or select a delivery photo."); return; } setBusy(true); setError(""); try { const body = new FormData(); body.append("recipient_name", recipient.trim()); body.append("latitude", latitude); body.append("longitude", longitude); if (notes.trim()) body.append("notes", notes.trim()); body.append("photo", photo); setStarted(await deliveryVerificationApi.start(shipment.id, body)); } catch (err) { setError(message(err)); } finally { setBusy(false); } };
 const verify = async (event: FormEvent) => { event.preventDefault(); if (!started || !/^\d{6}$/.test(otp)) { setError("Enter the complete six-digit recipient code."); return; } setBusy(true); setError(""); try { await deliveryVerificationApi.verify(started.proof.id, otp); complete(); } catch (err) { setError(message(err)); } finally { setBusy(false); } };
 const resendOtp = async () => {
 if (!started || resending || resendCooldown > 0) return;
 setResending(true); setError("");
 try {
 const refreshed = await deliveryVerificationApi.resendOtp(started.proof.id);
 setStarted(refreshed);
 setOtp("");
 setResendCooldown(30);
 } catch (err) {
 const text = message(err);
 setError(text);
 const match = text.match(/wait\s+(\d+)\s+seconds/i);
 if (match) setResendCooldown(Number(match[1]));
 } finally {
 setResending(false);
 }
 };
 useEffect(() => {
 if (resendCooldown <= 0) return;
 const timer = window.setInterval(() => {
 setResendCooldown((current) => Math.max(0, current - 1));
 }, 1000);
 return () => window.clearInterval(timer);
 }, [resendCooldown]);
 return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Delivery verification"><div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-card shadow-lg sm:rounded-xl dark:bg-card"><header className="sticky top-0 z-10 flex items-start justify-between border-b bg-card p-4 sm:p-5 dark:border-border dark:bg-card"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Secure delivery</p><h3 className="mt-1 break-all text-lg font-bold">{shipment.tracking_number || shipment.id.slice(0, 8)}</h3></div><button onClick={close} aria-label="Close" className="grid min-h-11 min-w-11 place-items-center rounded-xl bg-muted dark:bg-muted"><HugeiconsIcon icon={Cancel01Icon} size={18} /></button></header><div className="p-4 sm:p-6">{error && <p className="mb-4 rounded-xl bg-red-light-6 p-3 text-sm text-red-dark">{error}</p>}{!started ? <form onSubmit={start} className="space-y-4"><div className="rounded-xl bg-yellow-light-4 p-4 text-sm text-amber-900"><strong>Before continuing:</strong> stand at the recipient’s confirmed destination. The backend rejects evidence captured outside the permitted distance.</div><label className="block text-sm font-semibold">Recipient name<input required minLength={2} maxLength={150} value={recipient} onChange={(event) => setRecipient(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-transparent px-3" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Latitude<input required inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-transparent px-3" /></label><label className="text-sm font-semibold">Longitude<input required inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-transparent px-3" /></label></div><button type="button" onClick={locate} disabled={locating} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary text-sm font-semibold text-primary disabled:opacity-50"><HugeiconsIcon icon={LocationUpdate01Icon} size={18} />{locating ? "Finding location…" : "Use current GPS location"}</button><label className="block text-sm font-semibold">Delivery photo<input required type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => setPhoto(event.target.files?.[0] || null)} className="mt-1.5 block min-h-11 w-full rounded-xl border border-border p-2 text-sm" /></label>{photo && <div className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm dark:bg-muted"><HugeiconsIcon icon={Camera01Icon} size={16} /><span className="min-w-0 truncate">{photo.name}</span></div>}<label className="block text-sm font-semibold">Delivery note<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional condition or recipient note" className="mt-1.5 min-h-24 w-full rounded-xl border border-border bg-transparent p-3" /></label><button disabled={busy || !photo} className="min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50">{busy ? "Sending OTP…" : "Capture proof and send OTP"}</button></form> : <form onSubmit={verify} className="space-y-5"><div className="overflow-hidden rounded-xl border border-border dark:border-border"><img src={resolveBackendDocumentUrl(started.proof.photo_url)} alt="Delivery evidence" className="max-h-64 w-full bg-muted object-contain" /><div className="p-4"><h4 className="font-bold">OTP sent successfully</h4><p className="mt-1 text-sm text-muted-foreground">Sent via {started.otp_delivery_channels.join(" and ")}. Ask the recipient to read the code from their phone or email.</p>{started.dev_otp && <p className="mt-2 rounded-lg bg-yellow-light-4 p-2 font-mono text-sm text-amber-900">Development OTP: {started.dev_otp}</p>}</div></div><label className="block text-center text-sm font-semibold">Recipient six-digit code<input autoFocus required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="mx-auto mt-2 block min-h-14 w-full max-w-xs rounded-xl border-2 border-primary bg-transparent px-4 text-center text-2xl font-bold tracking-[.35em]" /></label><p className="text-center text-xs text-muted-foreground">Expires {date(started.proof.otp_expires_at)} · Failed attempts: {started.proof.otp_attempts}</p><div className="rounded-xl border border-border bg-muted p-3 text-center dark:border-border dark:bg-muted">
 <p className="text-xs text-muted-foreground">Didn’t receive the code?</p>
 <button
 type="button"
 onClick={() => void resendOtp()}
 disabled={resending || resendCooldown > 0 || busy}
 className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary px-4 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50"
 >
 {resending ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={16} />}
 {resending
 ? "Resending OTP…"
 : resendCooldown > 0
 ? `Resend OTP in ${resendCooldown}s`
 : "Resend OTP"}
 </button>
 <p className="mt-2 text-[11px] text-muted-foreground">
 Resending creates a fresh code and invalidates the previous one.
 </p>
</div><button disabled={busy || resending || otp.length !== 6} className="min-h-12 w-full rounded-xl bg-green-dark px-4 text-sm font-bold text-white disabled:opacity-50">{busy ? "Verifying…" : "Verify OTP and complete delivery"}</button></form>}</div></div></div>;
}
