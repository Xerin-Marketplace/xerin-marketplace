"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "@/lib/api/endpoints/users";
import { authStorage } from "@/lib/auth/storage";
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
 const clean = phone.replace(/[\s-]/g, "");
 if (!/^\+?\d{7,15}$/.test(clean)) {
 toast.error("Enter a valid phone number, e.g. +255712345678");
 return;
 }
 setBusy(true);
 try {
 await sendOtp({ phone: clean.startsWith("+") ? clean : `+${clean}`, purpose: "generic" });
 setPhone(clean.startsWith("+") ? clean : `+${clean}`);
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
 await verifyOtp({ phone, otp_code: cleanOtp, purpose: "generic" });
 const updated = await usersApi.updateMe({ phone });
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

 return (
 <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[var(--muted)] px-4 py-10">
 <div className="w-full max-w-md">
 <div className="mb-7 flex justify-center">
 <button type="button" onClick={() => router.push("/")} aria-label="Go to XerinMarket home">
 <Image
 src="/images/logo/logooriginal.png"
 alt="XerinMarket"
 width={170}
 height={54}
 className="h-auto w-[145px] object-contain sm:w-[160px]"
 priority
 />
 </button>
 </div>

 <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-8">
 <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
 One more step
 </p>
 <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
 Verify your phone number
 </h1>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 Your Google account is connected. Add and verify your mobile number so we can reach you about orders and deliveries.
 </p>

 {step === "phone" ? (
 <form onSubmit={submitPhone} className="mt-6 space-y-4">
 <label className="block text-sm font-medium text-foreground">
 Mobile number
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+255 712 345 678"
 autoComplete="tel"
 className="mt-1.5 h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-primary"
 />
 </label>
 <button
 type="submit"
 disabled={busy}
 className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
 >
 {busy ? "Sending..." : "Send verification code"}
 </button>
 </form>
 ) : (
 <form onSubmit={submitOtp} className="mt-6 space-y-4">
 <div>
 <p className="text-sm text-muted-foreground">
 Code sent to <span className="font-semibold text-foreground">{phone}</span>
 </p>
 <label className="mt-3 block text-sm font-medium text-foreground">
 OTP code
 <input
 type="text"
 inputMode="numeric"
 value={otp}
 onChange={(e) => setOtp(e.target.value)}
 placeholder="Enter code"
 autoComplete="one-time-code"
 className="mt-1.5 h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-center text-lg font-bold tracking-[0.4em] outline-none transition placeholder:text-muted-foreground placeholder:tracking-normal focus:border-primary"
 />
 </label>
 </div>
 <button
 type="submit"
 disabled={busy}
 className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
 >
 {busy ? "Verifying..." : "Verify & continue"}
 </button>
 <button
 type="button"
 onClick={() => setStep("phone")}
 className="w-full text-sm font-semibold text-primary hover:underline"
 >
 Use a different number
 </button>
 </form>
 )}
 </div>
 </div>
 </main>
 );
}
