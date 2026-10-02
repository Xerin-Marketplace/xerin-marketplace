"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "@/lib/api/endpoints/users";
import { authStorage } from "@/lib/auth/storage";
import {
 PhoneInput,
 isValidInternationalPhone,
 buildInternationalPhone,
 DEFAULT_DIAL_CODE,
} from "../phone-input";
import toast from "react-hot-toast";

const getApiErrorMessage = (error: unknown, fallback: string) => {
 const apiError = error as {
 message?: string;
 response?: { data?: { detail?: unknown; message?: string } };
 };
 const detail = apiError.response?.data?.detail;
 if (typeof detail === "string") return detail;
 if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object") {
 const first = detail[0] as { msg?: string };
 if (first.msg) return first.msg;
 }
 return apiError.response?.data?.message || apiError.message || fallback;
};

export default function VerifyPhone() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { isAuthenticated, user, sendOtp, verifyOtp, setSession } = useAuth();

 const [phone, setPhone] = useState("");
 const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
 const [verifiedPhone, setVerifiedPhone] = useState("");
 const [otp, setOtp] = useState("");
 const [step, setStep] = useState<"phone" | "otp">("phone");
 const [busy, setBusy] = useState(false);

 const nextParam = searchParams.get("next");
 const next =
 nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
 ? nextParam
 : "/account";

 useEffect(() => {
 if (!isAuthenticated) {
 router.replace(`/signin?redirect=${encodeURIComponent("/verify-phone")}`);
 } else if (user?.phone) {
 // Already has a phone — nothing to do here.
 router.replace(next);
 }
 }, [isAuthenticated, user?.phone, next, router]);

 if (!isAuthenticated || user?.phone) return null;

 const submitPhone = async (e: FormEvent) => {
 e.preventDefault();
 if (!isValidInternationalPhone(phone, dialCode)) {
 toast.error("Enter a valid phone number.");
 return;
 }
 setBusy(true);
 try {
 const normalized = buildInternationalPhone(phone, dialCode);
 await sendOtp({ phone: normalized, purpose: "generic" });
 setVerifiedPhone(normalized);
 setStep("otp");
 toast.success("OTP sent to your phone.");
 } catch (error) {
 toast.error(getApiErrorMessage(error, "Could not send OTP. Try again."));
 } finally {
 setBusy(false);
 }
 };

 const submitOtp = async (e: FormEvent) => {
 e.preventDefault();
 const cleanOtp = otp.replace(/\D/g, "");
 if (cleanOtp.length < 4) {
 toast.error("Enter the OTP code we sent to your phone.");
 return;
 }
 setBusy(true);
 try {
 await verifyOtp({ phone: verifiedPhone, otp_code: cleanOtp, purpose: "generic" });
 const updated = await usersApi.updateMe({ phone: verifiedPhone });
 const current = authStorage.getSession();
 if (current) setSession({ ...current, user: updated });
 toast.success("Phone number verified.");
 router.push(next);
 } catch (error) {
 toast.error(getApiErrorMessage(error, "OTP verification failed. Check the code and try again."));
 } finally {
 setBusy(false);
 }
 };

 const inputClass =
 "h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

 return (
 <section className="min-h-[100dvh] bg-card lg:grid lg:grid-cols-2">
 {/* Left panel: form */}
 <div className="flex min-h-[100dvh] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-10 sm:py-8 xl:px-20">
 <div className="flex items-center justify-between">
 <Link href="/" className="inline-flex w-fit items-center gap-2">
 <Image
 src="/images/logo/xerin-logo-mark.png"
 alt="Xerin Mart"
 width={30}
 height={30}
 priority
 className="h-11 w-11 object-contain"
 />
 <span className="text-xl font-bold text-foreground sm:text-2xl">Xerin Mart</span>
 </Link>
 <Link
 href="/"
 className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary lg:hidden"
 >
 Shop
 </Link>
 </div>

 <div className="flex flex-1 items-center justify-center py-5 sm:py-10">
 <div className="w-full max-w-[420px]">
 <div className="mb-5 text-center sm:mb-7">
 <h1 className="mb-1.5 text-2xl font-bold text-foreground sm:font-semibold">
 Verify your phone
 </h1>
 <p className="text-sm text-muted-foreground">
 One last step — confirm your mobile number
 </p>
 </div>

 {step === "phone" ? (
 <form onSubmit={submitPhone} className="space-y-5">
 <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
 Your account is connected. Add your mobile number so we can send order
 and delivery updates — and verify it with a quick OTP.
 </p>
 <div>
 <label htmlFor="verify-phone-number" className="mb-1.5 block text-sm font-medium text-foreground">
 Mobile number
 </label>
 <PhoneInput
 id="verify-phone-number"
 value={phone}
 onChange={setPhone}
 dialCode={dialCode}
 onDialCodeChange={setDialCode}
 disabled={busy}
 invalid={Boolean(phone) && !isValidInternationalPhone(phone, dialCode)}
 placeholder="712 345 678"
 />
 {phone && !isValidInternationalPhone(phone, dialCode) && (
 <p className="mt-2 text-sm text-red">Enter a valid international phone number.</p>
 )}
 </div>
 <button
 type="submit"
 disabled={busy}
 className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {busy ? "Sending code..." : "Send verification code"}
 </button>
 </form>
 ) : (
 <form onSubmit={submitOtp} className="space-y-5">
 <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
 We sent a verification code to{" "}
 <span className="font-semibold text-foreground">{verifiedPhone}</span>
 </p>
 <label className="block text-sm font-medium text-foreground">
 OTP code
 <input
 type="text"
 inputMode="numeric"
 value={otp}
 onChange={(e) => setOtp(e.target.value)}
 placeholder="Enter code"
 autoComplete="one-time-code"
 autoFocus
 className={`mt-1.5 text-center text-lg font-bold tracking-[0.4em] placeholder:tracking-normal ${inputClass}`}
 />
 </label>
 <button
 type="submit"
 disabled={busy}
 className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {busy ? "Verifying..." : "Verify & continue"}
 </button>
 <div className="flex items-center justify-between text-sm">
 <button
 type="button"
 onClick={() => setStep("phone")}
 className="font-semibold text-muted-foreground transition hover:text-foreground"
 >
 Change number
 </button>
 <button
 type="button"
 disabled={busy}
 onClick={async () => {
 setBusy(true);
 try {
 await sendOtp({ phone: verifiedPhone, purpose: "generic" });
 toast.success("OTP resent.");
 } catch (error) {
 toast.error(getApiErrorMessage(error, "Could not resend OTP."));
 } finally {
 setBusy(false);
 }
 }}
 className="font-semibold text-primary transition hover:underline disabled:opacity-50"
 >
 Resend code
 </button>
 </div>
 </form>
 )}
 </div>
 </div>

 <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-1 text-[11px] text-muted-foreground sm:gap-4 sm:text-xs">
 <Link href="/help" className="hover:text-foreground dark:hover:text-white">Help Center</Link>
 <span>•</span>
 <Link href="/terms" className="hover:text-foreground dark:hover:text-white">Terms</Link>
 <span>•</span>
 <Link href="/privacy" className="hover:text-foreground dark:hover:text-white">Privacy</Link>
 <span>•</span>
 <span>© {new Date().getFullYear()} Xerin Mart</span>
 </div>
 </div>

 {/* Right panel: marketing / imagery — same as signin/signup */}
 <div className="relative hidden min-h-[100dvh] overflow-hidden bg-carbon lg:flex lg:flex-col">
 <Image src="/35124 (1).jpg" alt="Xerin Mart" fill priority sizes="50vw" className="object-cover object-center" />
 <div className="absolute inset-0 bg-black/55" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
 <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-transparent" />

 <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
 <div />

 <div className="max-w-md space-y-6">
 <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
 Secure your account.
 </h2>
 <p className="text-base leading-relaxed text-white/75 sm:text-lg">
 A verified phone keeps your orders, deliveries and account recovery tied to you — and lets sellers and riders reach you when it matters.
 </p>

 <div className="space-y-3 border-l-2 border-primary/60 pl-4 pt-1">
 <p className="text-sm font-medium text-white/85">Get order &amp; delivery updates by SMS</p>
 <p className="text-sm font-medium text-white/85">Recover your account easily</p>
 <p className="text-sm font-medium text-white/85">One number, verified once</p>
 </div>
 </div>

 <div className="flex items-center justify-between text-xs text-white/60">
 <span>&copy; {new Date().getFullYear()} Xerin Mart. All rights reserved.</span>
 </div>
 </div>
 </div>
 </section>
 );
}
