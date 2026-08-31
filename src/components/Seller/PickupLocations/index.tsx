"use client";

import { sellerPickupApi } from "@/lib/api/endpoints/seller-pickup";
import { usersApi } from "@/lib/api/endpoints/users";
import { getTanzaniaRegions } from "@/lib/locations/storeLocations";
import type { MapResolvedLocation } from "@/types/api/user";
import type { SellerPickupLocation } from "@/types/api/seller-pickup";
import { AlertTriangle, CheckCircle2, MapPin, Plus, RefreshCw, Search, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const empty = { label: "Main pickup", contact: "", phone: "", instructions: "" };

export default function SellerPickupLocations() {
  const [rows, setRows] = useState<SellerPickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<MapResolvedLocation | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ place_id: string; description: string }>>([]);
  const [deleteTarget, setDeleteTarget] = useState<SellerPickupLocation | null>(null);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");

  const load = async () => { setLoading(true); try { setRows((await sellerPickupApi.list()).results); } catch (e) { toast.error(message(e)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  useEffect(() => {
    let cancelled = false;
    getTanzaniaRegions()
      .then((values) => { if (!cancelled) setRegionOptions(values); })
      .catch(() => { if (!cancelled) setRegionOptions([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (search.trim().length < 3 || location) { setSuggestions([]); return; }
    const timer = window.setTimeout(async () => { try { setSuggestions(await usersApi.searchMapPlaces(search.trim(), "TZ")); } catch { setSuggestions([]); } }, 350);
    return () => window.clearTimeout(timer);
  }, [search, location]);

  const choose = async (placeId: string) => { setBusy(true); try { const next = await usersApi.getMapPlace(placeId, "TZ"); setLocation(next); setSearch(next.formatted_address); setSuggestions([]); const raw = (next.region || next.city || "").trim(); const canonical = regionOptions.find((r) => normalizeRegion(r) === normalizeRegion(raw)) || canonicalTanzaniaRegion(raw, regionOptions); setSelectedRegion(canonical); } catch (e) { toast.error(message(e)); } finally { setBusy(false); } };
  const close = () => { setOpen(false); setForm(empty); setSearch(""); setLocation(null); setSuggestions([]); setSelectedRegion(""); };
  const create = async () => {
    if (!location || !selectedRegion || !form.contact.trim() || !form.phone.trim()) { toast.error("Select the exact map location, official region, pickup contact and phone"); return; }
    setBusy(true);
    try {
      await sellerPickupApi.create({ label: form.label.trim(), formatted_address: location.formatted_address, country: location.country || "Tanzania", region: selectedRegion, city: location.city || location.region || "Unknown", district: location.district, ward: location.ward, street: location.street, postal_code: location.postal_code, place_id: location.place_id, latitude: Number(location.latitude), longitude: Number(location.longitude), pickup_contact_name: form.contact.trim(), pickup_phone: form.phone.trim(), pickup_instructions: form.instructions.trim() || null, is_default: rows.length === 0, is_active: true });
      toast.success("Pickup location created"); close(); await load();
    } catch (e) { toast.error(message(e)); } finally { setBusy(false); }
  };
  const setDefault = async (id: string) => { setBusy(true); try { await sellerPickupApi.setDefault(id); toast.success("Default pickup location updated"); await load(); } catch (e) { toast.error(message(e)); } finally { setBusy(false); } };
  const remove = async () => { if (!deleteTarget) return; setBusy(true); try { await sellerPickupApi.remove(deleteTarget.id); toast.success("Pickup location removed"); setDeleteTarget(null); await load(); } catch (e) { toast.error(message(e)); } finally { setBusy(false); } };

  return <div className="mx-auto max-w-6xl space-y-5">
    <section className="rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-[#1f2937] sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-orange">Seller fulfillment</p><h1 className="mt-1 text-xl font-bold dark:text-white sm:text-2xl">Pickup Locations</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Logistics distance and readiness checks use your active default pickup location, exact GPS pin, contact name and phone.</p></div><button onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange px-4 text-sm font-bold text-white"><Plus size={17} />Add pickup location</button></div></section>
    {loading ? <div className="grid gap-3 sm:grid-cols-2">{[1,2].map(x => <div key={x} className="h-44 animate-pulse rounded-2xl bg-slate-100" />)}</div> : rows.length ? <div className="grid gap-4 sm:grid-cols-2">{rows.map(row => <article key={row.id} className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#1f2937] sm:p-5 ${row.is_default ? "border-orange" : "dark:border-white/10"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words font-bold dark:text-white">{row.label}</h2><p className="mt-1 break-words text-sm leading-6 text-slate-500">{row.formatted_address}</p></div>{row.is_default && <span className="shrink-0 rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase text-orange">Default</span>}</div><div className="mt-3 space-y-1 text-xs text-slate-500"><p><b>Contact:</b> {row.pickup_contact_name} · {row.pickup_phone}</p><p><b>GPS:</b> {Number(row.latitude).toFixed(6)}, {Number(row.longitude).toFixed(6)}</p></div><div className="mt-4 flex flex-col gap-2 sm:flex-row">{!row.is_default && <button disabled={busy} onClick={() => void setDefault(row.id)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold"><Star size={14} />Make default</button>}<button disabled={busy} onClick={() => setDeleteTarget(row)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-semibold text-red-600"><Trash2 size={14} />Remove</button></div></article>)}</div> : <div className="rounded-2xl border border-dashed bg-white p-10 text-center dark:border-white/10 dark:bg-[#1f2937]"><MapPin className="mx-auto text-slate-300" size={34} /><p className="mt-3 font-semibold dark:text-white">No pickup location configured</p><p className="mt-1 text-sm text-slate-500">Add one before preparing seller orders for logistics pickup.</p></div>}

    {open && <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"><div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-[#1f2937] sm:rounded-2xl"><div className="flex items-center justify-between border-b p-4 dark:border-white/10 sm:px-5"><div><h2 className="text-lg font-bold dark:text-white">Add pickup location</h2><p className="text-xs text-slate-500">Confirm the exact origin used by logistics.</p></div><button onClick={close} className="grid h-10 w-10 place-items-center rounded-xl border dark:border-white/10"><X size={17} /></button></div><div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
      <Field label="Location label"><input value={form.label} onChange={e => setForm(x => ({...x,label:e.target.value}))} className={input} /></Field>
      <Field label="Search exact pickup point"><div className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input value={search} onChange={e => { setSearch(e.target.value); setLocation(null); }} placeholder="Building, street or landmark" className={`${input} pl-10`} />{suggestions.length > 0 && <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border bg-white p-1 shadow-xl">{suggestions.map(s => <button key={s.place_id} type="button" onClick={() => void choose(s.place_id)} className="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">{s.description}</button>)}</div>}</div>{location && <p className="mt-2 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={15}/>{location.formatted_address}<br/>GPS {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}</p>}</Field>
      {location && <Field label="Region"><select required value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className={input}><option value="">Select official region</option>{regionOptions.map(region => <option key={region} value={region}>{region}</option>)}</select><p className="mt-1.5 text-xs font-normal text-slate-500">Choose the official Tanzania region used for Xerin Express route matching. This prevents spelling errors.</p></Field>}
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Pickup contact name"><input value={form.contact} onChange={e => setForm(x => ({...x,contact:e.target.value}))} className={input} /></Field><Field label="Pickup phone"><input value={form.phone} onChange={e => setForm(x => ({...x,phone:e.target.value}))} className={input} placeholder="+255..." inputMode="tel" /></Field></div>
      <Field label="Pickup instructions (optional)"><textarea value={form.instructions} onChange={e => setForm(x => ({...x,instructions:e.target.value}))} className={`${input} min-h-24 py-3`} /></Field>
    </div><div className="flex flex-col-reverse gap-2 border-t p-4 dark:border-white/10 sm:flex-row sm:justify-end"><button onClick={close} className="min-h-11 rounded-xl border px-5 text-sm font-semibold">Cancel</button><button disabled={busy || !location || !selectedRegion} onClick={() => void create()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange px-5 text-sm font-bold text-white disabled:opacity-50">{busy && <RefreshCw className="animate-spin" size={15}/>}Save pickup location</button></div></div></div>}
    {deleteTarget && <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"><div role="dialog" aria-modal="true" aria-labelledby="remove-pickup-title" className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-[#1f2937] sm:rounded-2xl sm:p-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10"><AlertTriangle size={20}/></span><div><h2 id="remove-pickup-title" className="font-bold text-slate-900 dark:text-white">Remove pickup location?</h2><p className="mt-1 text-sm leading-6 text-slate-500">{deleteTarget.label} will no longer be available as a fulfillment origin. This action cannot be undone.</p></div></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button disabled={busy} onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10">Keep location</button><button disabled={busy} onClick={() => void remove()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white disabled:opacity-50">{busy && <RefreshCw className="animate-spin" size={15}/>}Remove location</button></div></div></div>}
  </div>;
}

const input = "h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-orange dark:border-white/10 dark:bg-white/5 dark:text-white sm:text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-slate-700 dark:text-white/80">{label}<div className="mt-1.5">{children}</div></label>; }
function message(error: unknown) { const e = error as { response?: { data?: { detail?: string | { message?: string } } }; message?: string }; const d=e.response?.data?.detail; return (typeof d === "string" ? d : d?.message) || e.message || "Request failed"; }

function normalizeRegion(value: string) { return value.toLowerCase().replace(/[^a-z]/g, ""); }
function canonicalTanzaniaRegion(value: string, options: string[]) {
  const aliases: Record<string, string> = { daressalam: "Dar es Salaam", daressalaam: "Dar es Salaam" };
  const target = aliases[normalizeRegion(value)];
  return target && options.includes(target) ? target : "";
}
