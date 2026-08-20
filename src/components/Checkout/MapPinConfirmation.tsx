"use client";

import { usersApi } from "@/lib/api/endpoints/users";
import type { Address, MapResolvedLocation } from "@/types/api/user";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Crosshair, Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MapPinConfirmation({
  address,
  onConfirmed,
}: {
  address: Address;
  onConfirmed: (address: Address) => void;
}) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<MapResolvedLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const countryCode = ["tanzania", "united republic of tanzania", "tz"].includes(address.country.trim().toLowerCase()) ? "TZ" : undefined;

  useEffect(() => {
    setSearch("");
    setLocation(null);
  }, [address.id]);

  const suggestions = useQuery({
    queryKey: ["map", "autocomplete", countryCode || "global", search],
    queryFn: ({ signal }) => usersApi.searchMapPlaces(search.trim(), countryCode, signal),
    enabled: search.trim().length >= 3,
    staleTime: 30_000,
  });

  const choosePlace = async (placeId: string) => {
    setLocating(true);
    try {
      const resolved = await usersApi.getMapPlace(placeId, countryCode);
      setLocation(resolved);
      setSearch(resolved.formatted_address);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resolve that location");
    } finally {
      setLocating(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location access is not supported by this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setLocation(await usersApi.reverseGeocode(coords.latitude, coords.longitude));
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to identify your location");
        } finally { setLocating(false); }
      },
      () => { setLocating(false); toast.error("Allow location access, or search for the delivery point"); },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const confirm = async () => {
    if (!location) return;
    setConfirming(true);
    try {
      const result = await usersApi.confirmMapPin(
        address.id,
        Number(location.latitude),
        Number(location.longitude),
      );
      onConfirmed(result.address);
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Map pin confirmation failed");
    } finally { setConfirming(false); }
  };

  if (address.delivery_ready) {
    return <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={16} /><span><b>Delivery location confirmed.</b> Logistics companies can calculate a road-distance quote for this address.</span></div>;
  }

  return <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
    <div className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0 text-amber-700" size={18} /><div><p className="text-sm font-bold text-amber-900">Confirm the exact delivery point</p><p className="mt-1 text-xs leading-5 text-amber-800">Search for the location or use your phone’s GPS. A confirmed pin is required before logistics pricing.</p></div></div>
    <div className="relative mt-3">
      <Search className="absolute left-3 top-3.5 text-slate-400" size={17} />
      <input value={search} onChange={(event) => { setSearch(event.target.value); setLocation(null); }} placeholder="Search street, building or landmark" className="h-12 w-full rounded-xl border border-amber-200 bg-white pl-10 pr-3 text-base outline-none focus:border-orange sm:text-sm" />
      {suggestions.data && search.trim().length >= 3 && !location && <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border bg-white p-1 shadow-xl">{suggestions.data.map((item) => <button type="button" key={item.place_id} onClick={() => void choosePlace(item.place_id)} className="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"><b className="block text-slate-800">{item.main_text || item.description}</b>{item.secondary_text && <span className="text-xs text-slate-500">{item.secondary_text}</span>}</button>)}</div>}
    </div>
    <button type="button" onClick={useMyLocation} disabled={locating} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 sm:w-auto"><Crosshair size={17} />{locating ? "Finding location…" : "Use my current location"}</button>
    {location && <div className="mt-3 rounded-xl bg-white p-3"><p className="break-words text-sm font-medium text-slate-800">{location.formatted_address}</p><p className="mt-1 text-xs text-slate-500">Pin: {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}</p><button type="button" onClick={() => void confirm()} disabled={confirming} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange px-4 text-sm font-bold text-white sm:w-auto">{confirming ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}{confirming ? "Confirming…" : "Confirm this delivery pin"}</button></div>}
  </div>;
}
