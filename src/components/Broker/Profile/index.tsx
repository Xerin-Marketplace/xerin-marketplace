"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 Camera01Icon,
 UserIcon,
 Delete02Icon,
 Mail01Icon,
 SmartPhone01Icon,
 Location01Icon,
 IdentityCardIcon,
 FloppyDiskIcon,
 ShieldCheckIcon,
 Loading03Icon,
} from "@hugeicons/core-free-icons";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import { usersApi } from "@/lib/api/endpoints/users";
import type { Broker } from "@/types/api/broker";

const avatarSrc = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return url.replace(/^\/uploads\//, "/backend-uploads/");
  return url;
};

const input =
  "h-11 w-full rounded-lg border border-border bg-muted px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary/30";

const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

const statusBadge: Record<string, { label: string; cls: string }> = {
  pending_kyc: { label: "KYC pending", cls: "bg-amber-100 text-amber-700" },
  kyc_submitted: { label: "KYC submitted", cls: "bg-blue-100 text-blue-700" },
  under_review: { label: "Under review", cls: "bg-blue-100 text-blue-700" },
  approved: { label: "Verified", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Action required", cls: "bg-red-100 text-red-700" },
  suspended: { label: "Suspended", cls: "bg-red-100 text-red-700" },
};

export default function BrokerProfile() {
  const [broker, setBroker] = useState<Broker | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    region: "",
    city: "",
    nida_number: "",
  });

  useEffect(() => {
    Promise.all([brokersApi.me(), usersApi.getMe()])
      .then(([b, me]) => {
        setBroker(b);
        setAvatarUrl(b.avatar_url ?? (me as any).avatar_url ?? null);
        setForm({
          first_name: b.first_name || me.first_name || "",
          last_name: b.last_name || me.last_name || "",
          phone: b.phone || me.phone || "",
          country: b.country || "",
          region: b.region || "",
          city: b.city || "",
          nida_number: b.nida_number || "",
        });
      })
      .catch(() => toast.error("Unable to load your profile"))
      .finally(() => setLoading(false));
  }, []);

  const initials = useMemo(() => {
    const n = `${form.first_name} ${form.last_name}`.trim();
    return (n[0] || "W").toUpperCase() + (n.split(" ")[1]?.[0] || "").toUpperCase();
  }, [form.first_name, form.last_name]);

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function pickAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Choose a JPEG, PNG or WEBP image.");
      return;
    }
    setUploading(true);
    try {
      const res = await usersApi.uploadAvatar(file);
      setAvatarUrl(res.avatar_url + "?v=" + Date.now());
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    setUploading(true);
    try {
      await usersApi.deleteAvatar();
      setAvatarUrl(null);
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to remove photo");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.updateMe({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || undefined,
      });
      const b = await brokersApi.updateMe({
        country: form.country.trim(),
        region: form.region.trim(),
        city: form.city.trim(),
        nida_number: form.nida_number.trim() || undefined,
      });
      setBroker(b);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  const badge = statusBadge[broker?.status || "pending_kyc"] || statusBadge.pending_kyc;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* Identity card */}
      <section className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary via-orange-500 to-primary/80" />
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="relative">
              {avatarSrc(avatarUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc(avatarUrl)!}
                  alt="Profile photo"
                  className="h-24 w-24 rounded-2xl border-4 border-card object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-2xl font-black text-primary">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
                aria-label="Change profile photo"
              >
                {uploading ? (
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                ) : (
                  <HugeiconsIcon icon={Camera01Icon} size={14} />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={pickAvatar}
              />
            </div>
            {avatarUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploading}
                className="mb-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} /> Remove photo
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {`${form.first_name} ${form.last_name}`.trim() || "Winga Partner"}
            </h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Winga Broker
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <HugeiconsIcon icon={IdentityCardIcon} size={16} className="text-primary" />
              Code: <span className="font-mono font-semibold text-foreground">{broker?.broker_code || "—"}</span>
            </p>
            <p className="flex items-center gap-2">
              <HugeiconsIcon icon={Mail01Icon} size={16} className="text-primary" />
              {broker?.email || "—"}
            </p>
            <p className="flex items-center gap-2">
              <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="text-primary" />
              {form.phone || "—"}
            </p>
            <p className="flex items-center gap-2">
              <HugeiconsIcon icon={Location01Icon} size={16} className="text-primary" />
              {[form.city, form.region, form.country].filter(Boolean).join(", ") || "—"}
            </p>
          </div>

          {broker?.status_reason && (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {broker.status_reason}
            </p>
          )}
        </div>
      </section>

      {/* Edit form */}
      <section className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <HugeiconsIcon icon={UserIcon} size={18} className="text-primary" />
          Profile details
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your name, contact and location — used on your Winga profile and payouts.
        </p>

        <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="fn">First name</label>
            <input id="fn" className={input} value={form.first_name} onChange={set("first_name")} placeholder="First name" />
          </div>
          <div>
            <label className={label} htmlFor="ln">Last name</label>
            <input id="ln" className={input} value={form.last_name} onChange={set("last_name")} placeholder="Last name" />
          </div>
          <div>
            <label className={label} htmlFor="ph">Phone</label>
            <input id="ph" className={input} value={form.phone} onChange={set("phone")} placeholder="+2557…" />
          </div>
          <div>
            <label className={label} htmlFor="nida">NIDA number</label>
            <input id="nida" className={input} value={form.nida_number} onChange={set("nida_number")} placeholder="National ID" />
          </div>
          <div>
            <label className={label} htmlFor="co">Country</label>
            <input id="co" className={input} value={form.country} onChange={set("country")} placeholder="Tanzania" />
          </div>
          <div>
            <label className={label} htmlFor="re">Region</label>
            <input id="re" className={input} value={form.region} onChange={set("region")} placeholder="Dar es Salaam" />
          </div>
          <div>
            <label className={label} htmlFor="ci">City</label>
            <input id="ci" className={input} value={form.city} onChange={set("city")} placeholder="City" />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
              ) : (
                <HugeiconsIcon icon={FloppyDiskIcon} size={16} />
              )}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Verification shortcut */}
      <section className="flex items-center justify-between rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <HugeiconsIcon icon={ShieldCheckIcon} size={22} className="text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Identity verification</p>
            <p className="text-xs text-muted-foreground">
              {broker?.status === "approved"
                ? "Your Winga account is verified."
                : "Complete KYC to unlock products, earnings and payouts."}
            </p>
          </div>
        </div>
        <a
          href="/broker/kyc"
          className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary/20"
        >
          {broker?.status === "approved" ? "View KYC" : "Finish KYC"}
        </a>
      </section>
    </div>
  );
}
