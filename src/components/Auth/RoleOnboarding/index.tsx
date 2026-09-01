"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/endpoints/auth";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { useAuth } from "@/hooks/useAuth";
import { authStorage } from "@/lib/auth/storage";

export default function RoleOnboarding({ role }: { role: "seller" | "winga" }) {
  const router = useRouter();
  const { isAuthenticated, user, setSession } = useAuth();
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState<{id:string; name:string}[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    business_name: "", business_description: "", business_country: "Tanzania", business_region: "", business_city: "", business_address: "", product_description: "", years_in_business: "", website_url: "", contact_email: user?.email || "", contact_phone: user?.phone || "", agreement_accepted: false,
    country: "Tanzania", region: "", city: "",
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace(`/signin?redirect=/onboarding/${role}`);
  }, [isAuthenticated, role, router]);

  useEffect(() => {
    if (user) setForm((p) => ({ ...p, contact_email: p.contact_email || user.email || "", contact_phone: p.contact_phone || user.phone || "" }));
  }, [user]);

  useEffect(() => {
    if (role !== "seller") return;
    sellersApi.getBusinessCategories().then((rows) => setCategories(rows.map((r) => ({ id: String(r.id), name: r.name })))).catch(() => toast.error("Unable to load business categories."));
  }, [role]);

  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));
  const toggleCategory = (id: string) => setCategoryIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const refreshUser = (nextUser: any) => {
    const current = authStorage.getSession();
    if (current) setSession({ ...current, user: nextUser });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (role === "seller") {
        if (!form.business_name.trim() || !form.business_description.trim() || !form.business_country.trim() || !form.business_city.trim() || !categoryIds.length || !form.agreement_accepted) {
          toast.error("Complete the required seller onboarding details."); return;
        }
        const res = await authApi.onboardSeller({
          business_name: form.business_name.trim(), business_category_ids: categoryIds, business_description: form.business_description.trim(), business_country: form.business_country.trim(), business_region: form.business_region.trim() || undefined, business_city: form.business_city.trim(), business_address: form.business_address.trim() || undefined, product_description: form.product_description.trim() || undefined, years_in_business: form.years_in_business.trim() || undefined, website_url: form.website_url.trim() || undefined, contact_email: form.contact_email.trim() || undefined, contact_phone: form.contact_phone.trim() || undefined, agreement_accepted: true,
        });
        refreshUser(res.user); toast.success(res.message); router.replace("/seller/dashboard");
      } else {
        if (!form.country.trim() || !form.region.trim() || !form.city.trim()) { toast.error("Enter your country, region and city."); return; }
        const res = await authApi.onboardBroker({ country: form.country.trim(), region: form.region.trim(), city: form.city.trim() });
        refreshUser(res.user); toast.success(res.message); router.replace("/broker/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.message || "Unable to complete onboarding.");
    } finally { setBusy(false); }
  };

  if (!isAuthenticated) return null;
  const input = "h-12 w-full rounded-xl border border-gray-3 bg-white px-4 outline-none focus:border-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-white";

  return (
    <main className="min-h-[100dvh] bg-gray-1 px-4 py-8 dark:bg-darkTheme-bg sm:py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm dark:bg-darkTheme-card sm:p-8">
        <Link href="/choose-role" className="text-sm font-semibold text-orange">← Change role</Link>
        <h1 className="mt-4 text-2xl font-bold text-dark dark:text-white">{role === "seller" ? "Set up your Seller account" : "Set up your Winga account"}</h1>
        <p className="mt-2 text-sm text-dark-4 dark:text-darkTheme-secondary-muted">Your basic Xerin account is already verified. Complete only the information needed for this role.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          {role === "seller" ? <>
            <div><label className="mb-2 block text-sm font-semibold">Business name *</label><input className={input} value={form.business_name} onChange={(e)=>update("business_name",e.target.value)} /></div>
            <div><label className="mb-2 block text-sm font-semibold">Business description *</label><textarea className={`${input} min-h-28 py-3`} value={form.business_description} onChange={(e)=>update("business_description",e.target.value)} /></div>
            <div><label className="mb-2 block text-sm font-semibold">Business categories *</label><div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-gray-3 p-3 sm:grid-cols-2 dark:border-darkTheme-border-color">{categories.map(c=><label key={c.id} className="flex gap-2 text-sm"><input type="checkbox" checked={categoryIds.includes(c.id)} onChange={()=>toggleCategory(c.id)} className="accent-orange"/>{c.name}</label>)}</div></div>
            <div className="grid gap-4 sm:grid-cols-3"><input className={input} placeholder="Country *" value={form.business_country} onChange={(e)=>update("business_country",e.target.value)}/><input className={input} placeholder="Region" value={form.business_region} onChange={(e)=>update("business_region",e.target.value)}/><input className={input} placeholder="City *" value={form.business_city} onChange={(e)=>update("business_city",e.target.value)}/></div>
            <input className={input} placeholder="Business address" value={form.business_address} onChange={(e)=>update("business_address",e.target.value)}/>
            <textarea className={`${input} min-h-24 py-3`} placeholder="Products you plan to sell" value={form.product_description} onChange={(e)=>update("product_description",e.target.value)}/>
            <div className="grid gap-4 sm:grid-cols-2"><input className={input} placeholder="Years in business" value={form.years_in_business} onChange={(e)=>update("years_in_business",e.target.value)}/><input className={input} placeholder="Website URL" value={form.website_url} onChange={(e)=>update("website_url",e.target.value)}/></div>
            <div className="grid gap-4 sm:grid-cols-2"><input className={input} placeholder="Contact email" value={form.contact_email} onChange={(e)=>update("contact_email",e.target.value)}/><input className={input} placeholder="Contact phone" value={form.contact_phone} onChange={(e)=>update("contact_phone",e.target.value)}/></div>
            <label className="flex items-start gap-3 rounded-xl border border-orange/30 bg-orange/5 p-4"><input type="checkbox" checked={form.agreement_accepted} onChange={(e)=>update("agreement_accepted",e.target.checked)} className="mt-1 accent-orange"/><span className="text-sm">I agree to the Seller Agreement and Xerin Market seller policies. *</span></label>
          </> : <>
            <div className="grid gap-4 sm:grid-cols-3"><input className={input} placeholder="Country *" value={form.country} onChange={(e)=>update("country",e.target.value)}/><input className={input} placeholder="Region *" value={form.region} onChange={(e)=>update("region",e.target.value)}/><input className={input} placeholder="City *" value={form.city} onChange={(e)=>update("city",e.target.value)}/></div>
            <div className="rounded-xl border border-orange/20 bg-orange/5 p-4 text-sm text-dark-4 dark:text-darkTheme-secondary-muted">After this step, your Winga account starts in <strong>Pending KYC</strong>. Complete identity verification from the Winga dashboard before promotion and selling features unlock.</div>
          </>}
          <button disabled={busy} className="h-12 w-full rounded-xl bg-orange font-semibold text-white hover:bg-orange-dark disabled:opacity-60">{busy ? "Saving..." : role === "seller" ? "Continue to Seller Center" : "Continue to Winga Dashboard"}</button>
        </form>
      </div>
    </main>
  );
}
