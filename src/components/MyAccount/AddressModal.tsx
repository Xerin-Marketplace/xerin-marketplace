"use client";


import { Spinner } from "@/components/ui/Spinner";
import React, { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Crosshair, Loader2, MapPin, Search } from "lucide-react";
import { usersApi } from "@/lib/api/endpoints/users";
import type { Address, AddressRequest, MapResolvedLocation } from "@/types/api/user";

type Props = {
 isOpen: boolean;
 closeModal: () => void;
 initialAddress?: Address | null;
 isSubmitting?: boolean;
 onSubmit: (payload: AddressRequest) => Promise<void> | void;
};

const emptyForm: AddressRequest = {
 label: "Home",
 recipient_name: "",
 recipient_phone: "",
 country: "Tanzania",
 region: "",
 district: "",
 ward: "",
 city: "",
 street: "",
 landmark: "",
 postal_code: "",
 latitude: null,
 longitude: null,
 formatted_address: null,
 place_id: null,
 delivery_instructions: null,
 is_default: false,
};

const input =
 "mt-1.5 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none transition focus:border-[#f7941d] focus:ring-4 focus:ring-orange-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5";

const TANZANIA_REGIONS = [
 "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera",
 "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara",
 "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North",
 "Pemba South", "Pwani", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu",
 "Singida", "Songwe", "Tabora", "Tanga", "Zanzibar North",
 "Zanzibar South and Central", "Zanzibar West",
] as const;

const normalizeLocationKey = (value?: string | null) =>
 (value || "").trim().replace(/\s+/g, " ").toLowerCase();

const isTanzania = (value?: string | null) =>
 ["tanzania", "united republic of tanzania", "tz"].includes(normalizeLocationKey(value));

const canonicalTanzaniaRegion = (value?: string | null) => {
 const key = normalizeLocationKey(value);
 if (!key) return "";
 if (key === "dar es salam" || key === "dar es salaam") return "Dar es Salaam";
 return TANZANIA_REGIONS.find((region) => normalizeLocationKey(region) === key) || "";
};

export default function AddressModal({
 isOpen,
 closeModal,
 initialAddress,
 isSubmitting = false,
 onSubmit,
}: Props) {
 const [form, setForm] = useState<AddressRequest>(emptyForm);
 const [mapSearch, setMapSearch] = useState("");
 const [mapLocation, setMapLocation] = useState<MapResolvedLocation | null>(null);
 const [mapSuggestions, setMapSuggestions] = useState<Array<{ place_id: string; description: string; main_text?: string | null; secondary_text?: string | null }>>([]);
 const [mapBusy, setMapBusy] = useState(false);
 const [locationError, setLocationError] = useState("");
 const [editLocationDetails, setEditLocationDetails] = useState(false);
 const [showManualFallback, setShowManualFallback] = useState(false);

 useEffect(() => {
  if (!isOpen) return;
  setMapSearch(initialAddress?.formatted_address || "");
  setMapLocation(
   initialAddress?.latitude != null && initialAddress?.longitude != null
    ? {
      provider: "google",
      place_id: initialAddress.place_id || null,
      display_name: initialAddress.formatted_address || null,
      formatted_address: initialAddress.formatted_address || [initialAddress.street, initialAddress.city, initialAddress.region, initialAddress.country].filter(Boolean).join(", "),
      latitude: Number(initialAddress.latitude),
      longitude: Number(initialAddress.longitude),
      country: initialAddress.country,
      region: initialAddress.region,
      city: initialAddress.city,
      district: initialAddress.district || null,
      ward: initialAddress.ward || null,
      street: initialAddress.street,
      postal_code: initialAddress.postal_code || null,
     }
    : null,
  );
  setMapSuggestions([]);
  setLocationError("");
  setEditLocationDetails(false);
  setShowManualFallback(Boolean(initialAddress && initialAddress.latitude == null));
  setForm({
   label: initialAddress?.label || "Home",
   recipient_name: initialAddress?.recipient_name || "",
   recipient_phone: initialAddress?.recipient_phone || "",
   country: initialAddress?.country || "Tanzania",
   region: isTanzania(initialAddress?.country || "Tanzania")
    ? canonicalTanzaniaRegion(initialAddress?.region)
    : (initialAddress?.region || ""),
   district: initialAddress?.district || "",
   ward: initialAddress?.ward || "",
   city: initialAddress?.city || "",
   street: initialAddress?.street || "",
   landmark: initialAddress?.landmark || "",
   postal_code: initialAddress?.postal_code || "",
   latitude: initialAddress?.latitude == null ? null : Number(initialAddress.latitude),
   longitude: initialAddress?.longitude == null ? null : Number(initialAddress.longitude),
   formatted_address: initialAddress?.formatted_address || null,
   place_id: initialAddress?.place_id || null,
   delivery_instructions: initialAddress?.delivery_instructions || null,
   is_default: Boolean(initialAddress?.is_default),
  });
 }, [initialAddress, isOpen]);

 useEffect(() => {
  if (!isOpen || mapLocation || mapSearch.trim().length < 3) {
   setMapSuggestions([]);
   return;
  }

  const timer = window.setTimeout(async () => {
   try {
    const countryCode = isTanzania(form.country) ? "TZ" : undefined;
    setMapSuggestions(await usersApi.searchMapPlaces(mapSearch.trim(), countryCode));
   } catch {
    setMapSuggestions([]);
   }
  }, 350);

  return () => window.clearTimeout(timer);
 }, [form.country, isOpen, mapLocation, mapSearch]);

 const applyResolvedLocation = (resolved: MapResolvedLocation) => {
  const latitude = Number(resolved.latitude);
  const longitude = Number(resolved.longitude);

  setMapLocation(resolved);
  setMapSearch(resolved.formatted_address);
  setMapSuggestions([]);
  setLocationError("");
  setEditLocationDetails(false);

  setForm((current) => {
   const country = resolved.country?.trim() || current.country;
   const resolvedRegion = resolved.region?.trim() || current.region;
   return {
    ...current,
    country,
    region: isTanzania(country)
     ? canonicalTanzaniaRegion(resolvedRegion) || current.region
     : resolvedRegion,
    district: resolved.district?.trim() || current.district || "",
    ward: resolved.ward?.trim() || current.ward || "",
    city: resolved.city?.trim() || current.city,
    street: resolved.street?.trim() || resolved.formatted_address || current.street,
    postal_code: resolved.postal_code?.trim() || current.postal_code || "",
    latitude,
    longitude,
    formatted_address: resolved.formatted_address,
    place_id: resolved.place_id || null,
   };
  });
 };

 const chooseMapPlace = async (placeId: string) => {
  setMapBusy(true);
  try {
   const countryCode = isTanzania(form.country) ? "TZ" : undefined;
   const resolved = await usersApi.getMapPlace(placeId, countryCode);
   applyResolvedLocation(resolved);
   toast.success("Exact delivery location selected.");
  } catch (error) {
   toast.error(error instanceof Error ? error.message : "Unable to resolve that location.");
  } finally {
   setMapBusy(false);
  }
 };

 const useCurrentLocation = () => {
  if (!navigator.geolocation) {
   const message = "Location access is not supported by this browser. Search for the delivery point instead.";
   setLocationError(message);
   toast.error(message);
   return;
  }

  setLocationError("");
  setMapBusy(true);
  navigator.geolocation.getCurrentPosition(
   async ({ coords }) => {
    try {
     const resolved = await usersApi.reverseGeocode(coords.latitude, coords.longitude);
     applyResolvedLocation({
      ...resolved,
      latitude: coords.latitude,
      longitude: coords.longitude,
     });
     toast.success("Your current GPS location has been added.");
    } catch (error) {
     toast.error(error instanceof Error ? error.message : "Unable to identify your current location.");
    } finally {
     setMapBusy(false);
    }
   },
   (error) => {
    setMapBusy(false);
    const message =
     error.code === 1
      ? "Location permission is blocked. Allow Location for this site in your browser, then try again."
      : error.code === 2
       ? "Your device could not determine its location. Turn on GPS or search for the address."
       : "Finding your location took too long. Try again or search for the delivery point.";
    setLocationError(message);
    toast.error(message);
   },
   { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
 };

 if (!isOpen) return null;

 const set = (key: keyof AddressRequest, value: string | boolean | number | null) =>
  setForm((current) => ({ ...current, [key]: value }));

 const hasGpsLocation = form.latitude != null && form.longitude != null;
 const hasRequiredResolvedAddress = Boolean(
  hasGpsLocation &&
  form.country?.trim() &&
  form.region?.trim() &&
  form.city?.trim() &&
  form.street?.trim()
 );

 const submit = async (event: FormEvent) => {
  event.preventDefault();
  await onSubmit({
   label: form.label?.trim() || null,
   recipient_name: form.recipient_name?.trim() || null,
   recipient_phone: form.recipient_phone?.trim() || null,
   country: form.country.trim(),
   region: isTanzania(form.country) ? canonicalTanzaniaRegion(form.region) : form.region.trim(),
   district: form.district?.trim() || null,
   ward: form.ward?.trim() || null,
   city: form.city.trim(),
   street: form.street.trim(),
   landmark: form.landmark?.trim() || null,
   postal_code: form.postal_code?.trim() || null,
   latitude: form.latitude == null ? null : Number(form.latitude),
   longitude: form.longitude == null ? null : Number(form.longitude),
   formatted_address: form.formatted_address?.trim() || null,
   place_id: form.place_id?.trim() || null,
   delivery_instructions: form.delivery_instructions?.trim() || null,
   is_default: Boolean(form.is_default),
  });
 };

 return (
  <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/55 p-4 sm:p-8">
   <div className="mx-auto my-8 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-darkTheme-card sm:p-7">
    <div className="flex items-start justify-between gap-4">
     <div>
      <h3 className="text-xl font-bold">{initialAddress ?"Edit Delivery Address" : "Add Delivery Address"}</h3>
      <p className="mt-1 text-sm text-[#64748b]">
       These details are used for checkout, shipping quotes and logistics handover.
      </p>
     </div>
     <button type="button" disabled={isSubmitting} onClick={closeModal} className="rounded-xl border border-[#e2e8f0] px-3 py-2 text-sm font-semibold">Close</button>
    </div>

    <form onSubmit={submit} className="mt-6">
     <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Address label">
       <input value={form.label || ""} onChange={(e)=>set("label",e.target.value)} className={input} placeholder="Home, Office..." />
      </Field>
      <Field label="Recipient name">
       <input value={form.recipient_name || ""} onChange={(e)=>set("recipient_name",e.target.value)} className={input} placeholder="Person receiving delivery" />
      </Field>
      <Field label="Recipient phone">
       <input value={form.recipient_phone || ""} onChange={(e)=>set("recipient_phone",e.target.value)} className={input} placeholder="+255..." />
      </Field>
      <Field label="Delivery instructions">
       <input
        value={form.delivery_instructions || ""}
        onChange={(e)=>set("delivery_instructions",e.target.value)}
        className={input}
        placeholder="Gate, floor, entrance..."
       />
      </Field>
     </div>

     <section className="mt-6 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-[#e2e8f0] p-4 dark:border-white/10 sm:p-5">
       <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange/10 text-orange">
         <MapPin size={19} />
        </span>
        <div>
         <h4 className="font-bold text-dark dark:text-white">Exact delivery location on Google Maps</h4>
         <p className="mt-1 text-xs leading-5 text-[#64748b]">
          Use your current GPS location or search for a place. Xerin will automatically extract the country, region, district, ward, city, street, postal code, latitude and longitude from Google whenever those details are available.
         </p>
        </div>
       </div>

       <div className="relative mt-4">
        <Search className="absolute left-3 top-3.5 text-[#94a3b8]" size={17} />
        <input
         value={mapSearch}
         onChange={(event) => {
          setMapSearch(event.target.value);
          setMapLocation(null);
          set("latitude", null);
          set("longitude", null);
          set("formatted_address", null);
          set("place_id", null);
         }}
         className={`${input} mt-0 pl-10`}
         placeholder="Search street, building, landmark or place"
        />
        {mapSuggestions.length > 0 && !mapLocation && (
         <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white p-1 shadow-xl dark:border-white/10 dark:bg-darkTheme-card">
          {mapSuggestions.map((item) => (
           <button
            key={item.place_id}
            type="button"
            onClick={() => void chooseMapPlace(item.place_id)}
            className="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f8fafc] dark:hover:bg-white/5"
           >
            <b className="block text-dark dark:text-white">{item.main_text || item.description}</b>
            {item.secondary_text && <span className="text-xs font-normal text-[#64748b]">{item.secondary_text}</span>}
           </button>
          ))}
         </div>
        )}
       </div>

       <button
        type="button"
        onClick={useCurrentLocation}
        disabled={mapBusy}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange/30 bg-white px-4 text-sm font-bold text-orange transition hover:border-orange hover:bg-orange hover:text-white disabled:opacity-60 dark:bg-white/5 sm:w-auto"
       >
        {mapBusy ? <Spinner size={17} /> : <Crosshair size={17} />}
        {mapBusy ? "Finding and filling address..." : "Use my current location & fill address"}
       </button>

       {!hasGpsLocation && (
        <button
         type="button"
         onClick={() => setShowManualFallback((value) => !value)}
         className="mt-3 ml-0 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#64748b] hover:text-orange sm:ml-2 sm:w-auto"
        >
         {showManualFallback ? "Hide manual address fields" : "Enter address manually instead"}
        </button>
       )}

       {locationError && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
         {locationError}
        </p>
       )}
      </div>

      {form.latitude != null && form.longitude != null && (
       <div>
        <iframe
         title="Selected delivery location"
         className="h-56 w-full border-0 sm:h-72"
         loading="lazy"
         referrerPolicy="no-referrer-when-downgrade"
         src={`https://www.google.com/maps?q=${Number(form.latitude)},${Number(form.longitude)}&z=17&output=embed`}
        />
        <div className="flex flex-col gap-3 border-t border-[#e2e8f0] bg-white p-4 dark:border-white/10 dark:bg-darkTheme-card sm:flex-row sm:items-center sm:justify-between">
         <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-green">
           <CheckCircle2 size={16} /> Exact GPS pin selected
          </p>
          <p className="mt-1 break-words text-xs text-[#64748b]">
           {form.formatted_address || mapSearch || "Selected map location"}
          </p>
          <p className="mt-1 font-mono text-xs text-dark dark:text-white">
           Latitude: {Number(form.latitude).toFixed(6)} · Longitude: {Number(form.longitude).toFixed(6)}
          </p>
         </div>
         <a
          href={`https://www.google.com/maps/search/?api=1&query=${Number(form.latitude)},${Number(form.longitude)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] px-3 text-xs font-bold text-dark hover:border-orange hover:text-orange dark:border-white/10 dark:text-white"
         >
          Open in Google Maps
         </a>
        </div>
       </div>
      )}
     </section>

     {hasGpsLocation && !editLocationDetails ? (
      <section className="mt-5 rounded-2xl border border-green/20 bg-green/[0.04] p-4 sm:p-5">
       <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
         <p className="flex items-center gap-2 text-sm font-bold text-green">
          <CheckCircle2 size={17} />
          Address details filled automatically
         </p>
         <p className="mt-1 text-xs leading-5 text-[#64748b]">
          These details came from your selected Google/GPS location. You do not need to type them manually.
         </p>
        </div>
        <button
         type="button"
         onClick={() => setEditLocationDetails(true)}
         className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white px-3 text-xs font-bold text-dark hover:border-orange hover:text-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
         Edit extracted details
        </button>
       </div>

       <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
         ["Country", form.country],
         ["Region", form.region],
         ["District", form.district],
         ["Ward", form.ward],
         ["City", form.city],
         ["Street", form.street],
         ["Postal code", form.postal_code],
        ].map(([label, value]) => (
         <div key={label} className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">{label}</p>
          <p className="mt-0.5 break-words text-sm font-semibold text-dark dark:text-white">
           {value || "Not returned by Google"}
          </p>
         </div>
        ))}
       </div>

       {!hasRequiredResolvedAddress && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
         Google could not return every required address field for this point. Please use <b>Edit extracted details</b> and complete only the missing information.
        </div>
       )}
      </section>
     ) : (hasGpsLocation || showManualFallback) ? (
      <section className="mt-5 rounded-2xl border border-[#e2e8f0] p-4 dark:border-white/10 sm:p-5">
       <div className="mb-4 flex items-center justify-between gap-3">
        <div>
         <h4 className="font-bold text-dark dark:text-white">
          {hasGpsLocation ? "Edit extracted location details" : "Manual address fallback"}
         </h4>
         <p className="mt-1 text-xs text-[#64748b]">
          {hasGpsLocation
           ? "Only change a value if Google returned it incorrectly."
           : "Use this only if you cannot use Google search or device location."}
         </p>
        </div>
        {hasGpsLocation && (
         <button
          type="button"
          onClick={() => setEditLocationDetails(false)}
          className="shrink-0 text-xs font-bold text-orange hover:underline"
         >
          Done editing
         </button>
        )}
       </div>

       <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country" required>
         <input
          required
          value={form.country}
          onChange={(e) => {
           const country = e.target.value;
           setForm((current) => ({
            ...current,
            country,
            region: isTanzania(country) ? canonicalTanzaniaRegion(current.region) : current.region,
           }));
          }}
          className={input}
         />
        </Field>

        <Field label={isTanzania(form.country) ? "Region (official)" : "Region / State / Province"} required>
         {isTanzania(form.country) ? (
          <select
           required
           value={canonicalTanzaniaRegion(form.region)}
           onChange={(e) => set("region", e.target.value)}
           className={input}
          >
           <option value="">Select official region</option>
           {TANZANIA_REGIONS.map((region) => (
            <option key={region} value={region}>{region}</option>
           ))}
          </select>
         ) : (
          <input
           required
           value={form.region}
           onChange={(e) => set("region", e.target.value)}
           className={input}
           placeholder="State / province / region"
          />
         )}
        </Field>

        <Field label="District">
         <input value={form.district || ""} onChange={(e)=>set("district",e.target.value)} className={input} placeholder="District" />
        </Field>
        <Field label="Ward">
         <input value={form.ward || ""} onChange={(e)=>set("ward",e.target.value)} className={input} placeholder="Ward" />
        </Field>
        <Field label="City" required>
         <input required value={form.city} onChange={(e)=>set("city",e.target.value)} className={input} placeholder="City" />
        </Field>
        <Field label="Postal code">
         <input value={form.postal_code || ""} onChange={(e)=>set("postal_code",e.target.value)} className={input} placeholder="Optional" />
        </Field>
        <Field label="Street / address line" required wide>
         <input required value={form.street} onChange={(e)=>set("street",e.target.value)} className={input} placeholder="Street, building and house number" />
        </Field>
        <Field label="Landmark" wide>
         <input value={form.landmark || ""} onChange={(e)=>set("landmark",e.target.value)} className={input} placeholder="Near..." />
        </Field>
       </div>
      </section>
     ) : null}

     <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-[#e2e8f0] p-4 text-sm dark:border-white/10">
      <input type="checkbox" checked={Boolean(form.is_default)} onChange={(e)=>set("is_default",e.target.checked)} />
      <span><b>Use as default delivery address</b><span className="mt-0.5 block text-xs font-normal text-[#64748b]">Checkout will prefer this address.</span></span>
     </label>

     <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button type="button" disabled={isSubmitting} onClick={closeModal} className="rounded-xl border border-[#e2e8f0] px-5 py-3 text-sm font-semibold">Cancel</button>
      <button type="submit" disabled={isSubmitting || !form.country?.trim() || !form.region?.trim() || !form.city?.trim() || !form.street?.trim()} className="rounded-xl bg-[#f7941d] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
       {isSubmitting ? "Saving..." : initialAddress ? "Save Changes" : "Add Address"}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}

function Field({label,required=false,wide=false,children}:{label:string;required?:boolean;wide?:boolean;children:React.ReactNode}) {
 return <label className={`text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>{label}{required && <span className="text-red-500"> *</span>}{children}</label>;
}
