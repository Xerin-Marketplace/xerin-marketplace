"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/endpoints/auth";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { useAuth } from "@/hooks/useAuth";
import { authStorage } from "@/lib/auth/storage";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 Store01Icon,
 AgreementIcon,
 Location05Icon,
 ArrowDown01Icon,
 ArrowLeft01Icon,
 CheckmarkCircle02Icon,
 InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { PhoneInput, buildInternationalPhone, PHONE_COUNTRIES, DEFAULT_DIAL_CODE } from "../phone-input";
import {
 STORE_COUNTRIES,
 getGlobalCities,
 getGlobalStates,
 getTanzaniaDistricts,
 getTanzaniaRegions,
 getTanzaniaWards,
} from "@/lib/locations/storeLocations";

const TANZANIA_NAMES = new Set([
 "tanzania",
 "united republic of tanzania",
 "tanzania, united republic of",
]);

function isTanzania(country: string) {
 return TANZANIA_NAMES.has(country.trim().toLowerCase());
}

function countryFlag(countryCode: string) {
 return countryCode
 .toUpperCase()
 .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export default function RoleOnboarding({ role }: { role: "seller" | "winga" }) {
 const router = useRouter();
 const { isAuthenticated, user, setSession } = useAuth();
 const [busy, setBusy] = useState(false);
 const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
 const [categoryIds, setCategoryIds] = useState<string[]>([]);
 const [regionOptions, setRegionOptions] = useState<string[]>([]);
 const [districtOptions, setDistrictOptions] = useState<string[]>([]);
 const [wardOptions, setWardOptions] = useState<string[]>([]);
 const [locationLoading, setLocationLoading] = useState(false);
 const [locationError, setLocationError] = useState<string | null>(null);

 const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_DIAL_CODE);
 const [form, setForm] = useState({
 business_name: "",
 business_description: "",
 business_country: "Tanzania",
 business_region: "",
 business_city: "",
 business_district: "",
 business_ward: "",
 business_address: "",
 product_description: "",
 years_in_business: "",
 website_url: "",
 contact_email: user?.email || "",
 contact_phone: user?.phone || "",
 agreement_accepted: false,
 country: "Tanzania",
 region: "",
 city: "",
 district: "",
 ward: "",
 });

 const selectedCountry = role === "seller" ? form.business_country : form.country;
 const selectedRegion = role === "seller" ? form.business_region : form.region;
 const selectedDistrict = role === "seller" ? form.business_district : form.district;
 const localCountry = useMemo(() => isTanzania(selectedCountry), [selectedCountry]);

 useEffect(() => {
 if (!isAuthenticated) router.replace(`/signin?redirect=/onboarding/${role}`);
 }, [isAuthenticated, role, router]);

 useEffect(() => {
 if (user) {
 setForm((p) => ({ ...p, contact_email: p.contact_email || user.email || "" }));
 const existing = (user.phone || "").replace(/[^\d]/g, "");
 if (existing && !form.contact_phone) {
 const match = [...PHONE_COUNTRIES]
 .map((c) => c.code)
 .sort((a, b) => b.length - a.length)
 .find((code) => existing.startsWith(code));
 if (match) {
 setPhoneDialCode(match);
 setForm((p) => ({ ...p, contact_phone: p.contact_phone || existing.slice(match.length) }));
 } else {
 setForm((p) => ({ ...p, contact_phone: p.contact_phone || existing }));
 }
 }
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [user]);

 useEffect(() => {
 if (role !== "seller") return;
 sellersApi
 .getBusinessCategories()
 .then((rows) => setCategories(rows.map((r) => ({ id: String(r.id), name: r.name }))))
 .catch(() => toast.error("Unable to load business categories."));
 }, [role]);

 useEffect(() => {
 let cancelled = false;
 async function loadRegions() {
 if (!selectedCountry) {
 setRegionOptions([]);
 return;
 }
 setLocationLoading(true);
 setLocationError(null);
 try {
 const values = localCountry
 ? await getTanzaniaRegions()
 : await getGlobalStates(selectedCountry);
 if (!cancelled) setRegionOptions(values);
 } catch {
 if (!cancelled) {
 setRegionOptions([]);
 setLocationError("Location suggestions are temporarily unavailable. Please try again.");
 }
 } finally {
 if (!cancelled) setLocationLoading(false);
 }
 }
 loadRegions();
 return () => {
 cancelled = true;
 };
 }, [selectedCountry, localCountry]);

 useEffect(() => {
 let cancelled = false;
 async function loadDistricts() {
 if (!selectedCountry || !selectedRegion) {
 setDistrictOptions([]);
 return;
 }
 setLocationLoading(true);
 setLocationError(null);
 try {
 const values = localCountry
 ? await getTanzaniaDistricts(selectedRegion)
 : await getGlobalCities(selectedCountry, selectedRegion);
 if (!cancelled) setDistrictOptions(values);
 } catch {
 if (!cancelled) {
 setDistrictOptions([]);
 setLocationError("Location suggestions are temporarily unavailable. Please try again.");
 }
 } finally {
 if (!cancelled) setLocationLoading(false);
 }
 }
 loadDistricts();
 return () => {
 cancelled = true;
 };
 }, [selectedCountry, selectedRegion, localCountry]);

 useEffect(() => {
 let cancelled = false;
 async function loadWards() {
 if (!localCountry || !selectedDistrict) {
 setWardOptions([]);
 return;
 }
 setLocationLoading(true);
 setLocationError(null);
 try {
 const values = await getTanzaniaWards(selectedDistrict);
 if (!cancelled) setWardOptions(values);
 } catch {
 if (!cancelled) {
 setWardOptions([]);
 setLocationError("Ward suggestions are temporarily unavailable. Please try again.");
 }
 } finally {
 if (!cancelled) setLocationLoading(false);
 }
 }
 loadWards();
 return () => {
 cancelled = true;
 };
 }, [localCountry, selectedDistrict]);

 const update = (key: string, value: string | boolean) =>
 setForm((p) => ({ ...p, [key]: value }));

 const toggleCategory = (id: string) =>
 setCategoryIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

 const refreshUser = (nextUser: any) => {
 const current = authStorage.getSession();
 if (current) setSession({ ...current, user: nextUser });
 };

 function handleCountryChange(value: string) {
 setRegionOptions([]);
 setDistrictOptions([]);
 setWardOptions([]);
 if (role === "seller") {
 setForm((p) => ({
 ...p,
 business_country: value,
 business_region: "",
 business_city: "",
 business_district: "",
 business_ward: "",
 }));
 } else {
 setForm((p) => ({
 ...p,
 country: value,
 region: "",
 city: "",
 district: "",
 ward: "",
 }));
 }
 }

 function handleRegionChange(value: string) {
 setDistrictOptions([]);
 setWardOptions([]);
 if (role === "seller") {
 setForm((p) => ({
 ...p,
 business_region: value,
 business_city: "",
 business_district: "",
 business_ward: "",
 }));
 } else {
 setForm((p) => ({ ...p, region: value, city: "", district: "", ward: "" }));
 }
 }

 function handleDistrictChange(value: string) {
 setWardOptions([]);
 if (role === "seller") {
 setForm((p) => ({
 ...p,
 business_district: value,
 business_city: value,
 business_ward: "",
 }));
 } else {
 setForm((p) => ({ ...p, district: value, city: value, ward: "" }));
 }
 }

 const submit = async (e: FormEvent) => {
 e.preventDefault();
 setBusy(true);
 try {
 if (role === "seller") {
 if (
 !form.business_name.trim() ||
 !form.business_description.trim() ||
 !form.business_country.trim() ||
 !form.business_region.trim() ||
 !form.business_city.trim() ||
 (localCountry && !form.business_ward.trim()) ||
 !categoryIds.length ||
 !form.agreement_accepted
 ) {
 toast.error("Complete the required seller onboarding details.");
 return;
 }

 const res = await authApi.onboardSeller({
 business_name: form.business_name.trim(),
 business_category_ids: categoryIds,
 business_description: form.business_description.trim(),
 business_country: form.business_country.trim(),
 business_region: form.business_region.trim() || undefined,
 business_city: form.business_city.trim(),
 business_district: form.business_district.trim() || undefined,
 business_ward: form.business_ward.trim() || undefined,
 business_address: form.business_address.trim() || undefined,
 product_description: form.product_description.trim() || undefined,
 years_in_business: form.years_in_business.trim() || undefined,
 website_url: form.website_url.trim() || undefined,
 contact_email: form.contact_email.trim() || undefined,
 contact_phone: form.contact_phone.trim()
 ? buildInternationalPhone(form.contact_phone, phoneDialCode)
 : undefined,
 agreement_accepted: true,
 });
 refreshUser(res.user);
 toast.success(res.message);
 router.replace("/seller/dashboard");
 } else {
 if (
 !form.country.trim() ||
 !form.region.trim() ||
 !form.city.trim() ||
 (localCountry && !form.ward.trim())
 ) {
 toast.error("Select your country, region, district/city and ward.");
 return;
 }
 const res = await authApi.onboardBroker({
 country: form.country.trim(),
 region: form.region.trim(),
 city: form.city.trim(),
 district: form.district.trim() || undefined,
 ward: form.ward.trim() || undefined,
 });
 refreshUser(res.user);
 toast.success(res.message);
 router.replace("/broker/dashboard");
 }
 } catch (err: any) {
 toast.error(err?.message || "Unable to complete onboarding.");
 } finally {
 setBusy(false);
 }
 };

 if (!isAuthenticated) return null;

 const input =
 "h-12 w-full rounded-xl border border-border bg-card px-4 outline-none focus:border-primary ";

 const locationSelect = `${input} appearance-none cursor-pointer`;

 const countrySelect = (value: string, onChange: (value: string) => void, label: string) => (
 <div className="relative">
 <select
 className={`${locationSelect} pr-10`}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 required
 aria-label={label}
 >
 <option value="" disabled>
 Select country *
 </option>
 {STORE_COUNTRIES.map((country) => (
 <option key={country.value} value={country.value}>
 {countryFlag(country.countryCode)} {country.label}
 </option>
 ))}
 </select>
 <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">⌄</span>
 </div>
 );

 const locationFields = role === "seller"
 ? {
 country: form.business_country,
 region: form.business_region,
 district: form.business_district,
 ward: form.business_ward,
 }
 : {
 country: form.country,
 region: form.region,
 district: form.district,
 ward: form.ward,
 };

 return (
 <main className="min-h-[100dvh] bg-card">
 <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1100px] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-8 sm:py-8 lg:px-12">
 <div className="flex items-center justify-between">
 <Link href="/" className="inline-flex w-fit items-center gap-2">
 <Image
 src="/images/logo/xerin-logo-mark.png"
 alt="Xerin Marketplace"
 width={30}
 height={30}
 priority
 className="h-[30px] w-[30px] object-contain"
 />
 <span className="text-base font-bold text-foreground sm:text-lg">Xerin Marketplace</span>
 </Link>
 <Link
 href="/choose-role"
 className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
 Change role
 </Link>
 </div>

 <div className="flex flex-1 items-start justify-center py-6 sm:py-10">
 <div className="w-full max-w-[640px]">
 <div className="mb-6 sm:mb-8">
 <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: role === "seller" ? "#123B5D" : "#C6922E" }}>
 <HugeiconsIcon icon={role === "seller" ? Store01Icon : AgreementIcon} size={24} />
 </div>
 <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
 {role === "seller" ? "Seller onboarding" : "Winga onboarding"}
 </p>
 <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
 {role === "seller" ? "Set up your Seller account" : "Set up your Winga account"}
 </h1>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 Your basic Xerin account is already verified. Complete only the information needed for this role.
 </p>
 </div>

 <form onSubmit={submit} className="space-y-5">
 {role === "seller" ? (
 <>
 <section className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#123B5D]/10 text-[#123B5D]">
 <HugeiconsIcon icon={Store01Icon} size={16} />
 </span>
 <div>
 <h2 className="text-sm font-bold text-foreground">Business details</h2>
 <p className="text-xs text-muted-foreground">Tell buyers who you are.</p>
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">Business name *</label>
 <input className={input} value={form.business_name} onChange={(e) => update("business_name", e.target.value)} placeholder="e.g. Amina Crafts" />
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">Business description *</label>
 <textarea className={`${input} min-h-28 py-3`} value={form.business_description} onChange={(e) => update("business_description", e.target.value)} placeholder="What does your business sell?" />
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">Business categories *</label>
 <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-border bg-card p-3 sm:grid-cols-2">
 {categories.map((c) => (
 <label key={c.id} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${categoryIds.includes(c.id) ? "border-primary bg-primary/5 font-medium" : "border-transparent hover:bg-muted"}`}>
 <input
 type="checkbox"
 checked={categoryIds.includes(c.id)}
 onChange={() => toggleCategory(c.id)}
 className="accent-orange"
 />
 {c.name}
 </label>
 ))}
 </div>
 </div>
 </section>

 <section className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#123B5D]/10 text-[#123B5D]">
 <HugeiconsIcon icon={Location05Icon} size={16} />
 </span>
 <div>
 <h2 className="text-sm font-bold text-foreground">Business location</h2>
 <p className="text-xs text-muted-foreground">Select step by step — Xerin stores the official location names used by delivery routing.</p>
 </div>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 {countrySelect(form.business_country, handleCountryChange, "Business country")}
 <select
 className={locationSelect}
 value={form.business_region}
 onChange={(e) => handleRegionChange(e.target.value)}
 disabled={!form.business_country || locationLoading}
 required
 >
 <option value="">{locationLoading ? "Loading regions..." : localCountry ? "Select region *" : "Select state / region *"}</option>
 {regionOptions.map((item) => (
 <option key={item} value={item}>{item}</option>
 ))}
 </select>
 <select
 className={locationSelect}
 value={form.business_district}
 onChange={(e) => handleDistrictChange(e.target.value)}
 disabled={!form.business_region || locationLoading}
 required
 >
 <option value="">{localCountry ? "Select district *" : "Select city *"}</option>
 {districtOptions.map((item) => (
 <option key={item} value={item}>{item}</option>
 ))}
 </select>
 {localCountry ? (
 <select
 className={locationSelect}
 value={form.business_ward}
 onChange={(e) => update("business_ward", e.target.value)}
 disabled={!form.business_district || locationLoading}
 required
 >
 <option value="">Select ward *</option>
 {wardOptions.map((item) => (
 <option key={item} value={item}>{item}</option>
 ))}
 </select>
 ) : (
 <div className="flex h-12 items-center rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground">
 Ward is only required where local administrative ward data is available.
 </div>
 )}
 </div>
 {locationError && <p className="text-xs text-red">{locationError}</p>}
 <input
 className={input}
 placeholder="Business address / street / landmark"
 value={form.business_address}
 onChange={(e) => update("business_address", e.target.value)}
 />
 </section>

 <section className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#123B5D]/10 text-[#123B5D]">
 <HugeiconsIcon icon={InformationCircleIcon} size={16} />
 </span>
 <div>
 <h2 className="text-sm font-bold text-foreground">Extra details</h2>
 <p className="text-xs text-muted-foreground">Optional — helps your store get approved faster.</p>
 </div>
 </div>
 <textarea
 className={`${input} min-h-24 py-3`}
 placeholder="Products you plan to sell"
 value={form.product_description}
 onChange={(e) => update("product_description", e.target.value)}
 />
 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">Years in business</label>
 <input className={input} placeholder="e.g. 3" value={form.years_in_business} onChange={(e) => update("years_in_business", e.target.value)} />
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">Website URL</label>
 <input className={input} placeholder="https://" value={form.website_url} onChange={(e) => update("website_url", e.target.value)} />
 </div>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">Contact email</label>
 <input type="email" className={input} placeholder="you@example.com" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">Contact phone</label>
 <PhoneInput
 id="seller-contact-phone"
 value={form.contact_phone}
 onChange={(v) => update("contact_phone", v)}
 dialCode={phoneDialCode}
 onDialCodeChange={setPhoneDialCode}
 placeholder="712 345 678"
 />
 </div>
 </div>
 </section>

 <label className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
 <input
 type="checkbox"
 checked={form.agreement_accepted}
 onChange={(e) => update("agreement_accepted", e.target.checked)}
 className="mt-1 accent-orange"
 />
 <span className="text-sm">I agree to the Seller Agreement and Xerin Market seller policies. *</span>
 </label>
 </>
 ) : (
 <>
 <section className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6922E]/15 text-[#C6922E]">
 <HugeiconsIcon icon={Location05Icon} size={16} />
 </span>
 <div>
 <h2 className="text-sm font-bold text-foreground">Your operating location</h2>
 <p className="text-xs text-muted-foreground">Select your official location. Tanzania locations include Region, District and Ward.</p>
 </div>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 {countrySelect(form.country, handleCountryChange, "Country")}
 <select
 className={locationSelect}
 value={form.region}
 onChange={(e) => handleRegionChange(e.target.value)}
 disabled={!form.country || locationLoading}
 required
 >
 <option value="">{locationLoading ? "Loading regions..." : localCountry ? "Select region *" : "Select state / region *"}</option>
 {regionOptions.map((item) => (
 <option key={item} value={item}>{item}</option>
 ))}
 </select>
 <select
 className={locationSelect}
 value={form.district}
 onChange={(e) => handleDistrictChange(e.target.value)}
 disabled={!form.region || locationLoading}
 required
 >
 <option value="">{localCountry ? "Select district *" : "Select city *"}</option>
 {districtOptions.map((item) => (
 <option key={item} value={item}>{item}</option>
 ))}
 </select>
 {localCountry ? (
 <select
 className={locationSelect}
 value={form.ward}
 onChange={(e) => update("ward", e.target.value)}
 disabled={!form.district || locationLoading}
 required
 >
 <option value="">Select ward *</option>
 {wardOptions.map((item) => (
 <option key={item} value={item}>{item}</option>
 ))}
 </select>
 ) : (
 <div className="flex h-12 items-center rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground">
 City is selected from the state / region above.
 </div>
 )}
 </div>
 {locationError && <p className="text-xs text-red">{locationError}</p>}
 </section>

 <div className="flex items-start gap-3 rounded-xl border border-[#C6922E]/30 bg-[#C6922E]/5 p-4 text-sm text-muted-foreground">
 <HugeiconsIcon icon={InformationCircleIcon} size={18} className="mt-0.5 shrink-0 text-[#C6922E]" />
 <span>After this step, your Winga account starts in <strong className="text-foreground">Pending KYC</strong>. Complete identity verification from the Winga dashboard before promotion and selling features unlock.</span>
 </div>
 </>
 )}

 <button
 disabled={busy}
 className="h-12 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
 >
 {busy ? "Saving..." : role === "seller" ? "Continue to Seller Center" : "Continue to Winga Dashboard"}
 </button>
 </form>
 </div>
 </div>

 <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-1 text-[11px] text-muted-foreground sm:gap-4 sm:text-xs">
 <Link href="/help" className="hover:text-foreground dark:hover:text-white">Help Center</Link>
 <span>•</span>
 <Link href="/terms" className="hover:text-foreground dark:hover:text-white">Terms</Link>
 <span>•</span>
 <Link href="/privacy" className="hover:text-foreground dark:hover:text-white">Privacy</Link>
 <span>•</span>
 <span>© {new Date().getFullYear()} XerinMarket</span>
 </div>
 </div>
 </main>
 );
}
