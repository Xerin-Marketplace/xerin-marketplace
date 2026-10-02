"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { OtpPurpose } from "@/types/api/auth";
import { HugeiconsIcon } from "@hugeicons/react";
import { SecurityCheckIcon, Mail01Icon } from "@hugeicons/core-free-icons";

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

const VerifyOtp = () => {
 const {
 sendOtp,
 verifyOtp,
 resendVerification,
 verifyAccountOtp,
 isSendingOtp,
 isVerifyingOtp,
 isResendingVerification,
 isVerifyingAccountOtp,
 setSession,
 } = useAuth();

 const router = useRouter();
 const searchParams = useSearchParams();

 const phoneParam = searchParams.get("phone");
 const emailParam = searchParams.get("email");
 const identifierParam = searchParams.get("identifier");
 const purposeParam = searchParams.get("purpose");
 const recoveryMode = searchParams.get("recover") === "1";

 const phone =
 phoneParam && phoneParam !== "undefined" && phoneParam !== "null"
 ? phoneParam.trim()
 : "";

 const email =
 emailParam && emailParam !== "undefined" && emailParam !== "null"
 ? emailParam.trim()
 : "";

 const purpose = useMemo<OtpPurpose>(() => {
 if (
 purposeParam === "register" ||
 purposeParam === "register_seller" ||
 purposeParam === "register_broker" ||
 purposeParam === "password_reset"
 ) {
 return purposeParam;
 }
 return "generic";
 }, [purposeParam]);

 const nextPath = searchParams.get("next") || "/signin";

 const [identifier, setIdentifier] = useState(
 identifierParam && identifierParam !== "undefined" && identifierParam !== "null"
 ? identifierParam
 : email || phone,
 );
 const [otpCode, setOtpCode] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const [errorMessage, setErrorMessage] = useState("");
 const [resendCooldown, setResendCooldown] = useState(0);

 useEffect(() => {
 if (resendCooldown <= 0) return;
 const timer = window.setInterval(() => {
 setResendCooldown((current) => Math.max(0, current - 1));
 }, 1000);
 return () => window.clearInterval(timer);
 }, [resendCooldown]);

 const cleanOtp = otpCode.replace(/\D/g, "").slice(0, 6);
 const cleanIdentifier = identifier.trim();

 const registrationContext =
 !recoveryMode && Boolean(phone) && purpose !== "generic";

 const accountRecoveryContext =
 recoveryMode || (!registrationContext && Boolean(cleanIdentifier));

 const isBusy =
 isSendingOtp ||
 isVerifyingOtp ||
 isResendingVerification ||
 isVerifyingAccountOtp;

 const maskedPhone = phone
 ? phone.length > 7
 ? `${phone.slice(0, 4)}••••${phone.slice(-3)}`
 : phone
 : "";

 const title = recoveryMode
 ? "Verify your account"
 : purpose === "register_seller"
 ? "Verify your seller account"
 : purpose === "register_broker"
 ? "Verify your broker account"
 : purpose === "register"
 ? "Verify your account"
 : "Account verification";

 const subtitle = recoveryMode
 ? "Your account is registered but not verified. Enter your OTP below, or use your registered email or phone number to request a fresh code."
 : purpose === "register_seller"
 ? "Enter the verification code sent after seller registration."
 : purpose === "register_broker"
 ? "Enter the verification code sent after broker registration."
 : "Enter the verification code sent after registration.";

 const redirectAfterSuccess = () => {
 const target = nextPath.startsWith("/") ? nextPath : "/signin";
 const separator = target.includes("?") ? "&" : "?";
 const prefillEmail =
 email || (cleanIdentifier.includes("@") ? cleanIdentifier : "");
 const verifiedTarget =
 `${target}${separator}verified=1` +
 (prefillEmail ? `&email=${encodeURIComponent(prefillEmail)}` : "");

 window.setTimeout(() => router.push(verifiedTarget), 700);
 };

 const handleResend = async () => {
 setErrorMessage("");
 setSuccessMessage("");

 try {
 if (registrationContext && phone) {
 await sendOtp({ phone, purpose });
 } else {
 if (!cleanIdentifier) {
 setErrorMessage("Enter your registered email address or phone number.");
 return;
 }

 await resendVerification({ identifier: cleanIdentifier });
 }

 setSuccessMessage(
 "A fresh verification code has been sent to your registered contact details.",
 );
 setResendCooldown(30);
 } catch (error) {
 setErrorMessage(
 getApiErrorMessage(error, "Unable to resend the verification code."),
 );
 }
 };

 const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();
 setErrorMessage("");
 setSuccessMessage("");

 if (cleanOtp.length < 4) {
 setErrorMessage("Enter the verification code sent to you.");
 return;
 }

 try {
 if (registrationContext && phone) {
 const verification = await verifyOtp({
 phone,
 otp_code: cleanOtp,
 purpose,
 });
 if (
 purpose === "register" &&
 verification &&
 typeof verification === "object" &&
 "access_token" in verification
 ) {
 setSession(verification as import("@/types/api/auth").AuthTokenResponse);
 setSuccessMessage("Account verified. Choose how you would like to use Xerin Mart...");
 window.setTimeout(() => router.push("/choose-role"), 500);
 return;
 }
 } else {
 if (!cleanIdentifier) {
 setErrorMessage("Enter your registered email address or phone number.");
 return;
 }

 await verifyAccountOtp({
 identifier: cleanIdentifier,
 otp_code: cleanOtp,
 });
 }

 setSuccessMessage("Account verified successfully. Redirecting to sign in...");
 redirectAfterSuccess();
 } catch (error) {
 const message = getApiErrorMessage(error, "Unable to verify this code.");
 setErrorMessage(
 message.toLowerCase().includes("expired")
 ? "This OTP has expired. Enter your registered email or phone below and request a new OTP."
 : message,
 );
 }
 };

 return (
 <section className="min-h-[100dvh] bg-card lg:grid lg:grid-cols-2">
 <div className="flex min-h-[100dvh] flex-col px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-10 sm:py-8 xl:px-20">
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
 <span className="text-xl font-bold text-foreground sm:text-2xl">
 Xerin Mart
 </span>
 </Link>

 <Link
 href="/"
 className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary lg:hidden"
 >
 Shop
 </Link>
 </div>

 <div className="flex flex-1 items-center justify-center py-5 sm:py-10">
 <div className="w-full max-w-[430px]">
 <div className="mb-5 text-center sm:mb-8">
 <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mb-5 sm:h-14 sm:w-14">
 <HugeiconsIcon icon={SecurityCheckIcon} size={22} />
 </div>

 <h1 className="mb-1.5 text-2xl font-bold text-foreground sm:mb-2 sm:font-semibold">
 {title}
 </h1>

 <p className="mx-auto max-w-[390px] px-2 text-sm leading-5 text-muted-foreground sm:px-0 sm:leading-6">
 {subtitle}
 </p>
 </div>

 {registrationContext && (
 <div className="mb-4 rounded-xl border border-border bg-muted p-3 sm:mb-6 sm:p-4">
 <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
 Verification sent to
 </p>
 <p className="mt-1 font-semibold text-foreground">
 {maskedPhone}
 </p>
 {email && (
 <p className="mt-1 break-all text-sm text-muted-foreground">
 {email}
 </p>
 )}
 </div>
 )}

 {successMessage && (
 <div className="mb-4 rounded-xl border border-green/20 bg-green-light-6 px-3 py-3 text-sm text-green sm:mb-5 sm:px-4">
 {successMessage}
 </div>
 )}

 {errorMessage && (
 <div className="mb-4 rounded-xl border border-red/20 bg-red-light-6 px-3 py-3 text-sm text-red sm:mb-5 sm:px-4">
 {errorMessage}
 </div>
 )}

 <form onSubmit={handleVerify}>
 {accountRecoveryContext && !registrationContext && (
 <div className="mb-4 sm:mb-5">
 <label
 htmlFor="verification-identifier"
 className="mb-2 block text-sm font-medium text-foreground"
 >
 Registered Email or Phone Number
 </label>

 <div className="relative">
 <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
 <HugeiconsIcon icon={Mail01Icon} size={17} />
 </span>
 <input
 id="verification-identifier"
 type="text"
 value={identifier}
 onChange={(event) => setIdentifier(event.target.value)}
 placeholder="Email or phone number on your account"
 autoComplete="username"
 disabled={isBusy}
 className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70"
 />
 </div>

 <p className="mt-2 text-xs leading-5 text-muted-foreground">
 Use the same email address or phone number registered on your account.
 </p>
 </div>
 )}

 <div className="mb-5 sm:mb-6">
 <label className="mb-3 block text-center text-sm font-medium text-foreground">
 Verification Code
 </label>
 <OtpBoxes
 value={otpCode}
 onChange={setOtpCode}
 disabled={isBusy}
 />
 </div>

 <button
 type="submit"
 disabled={
 isBusy ||
 cleanOtp.length < 4 ||
 (!registrationContext && !cleanIdentifier)
 }
 className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {isVerifyingOtp || isVerifyingAccountOtp
 ? "Verifying..."
 : "Verify & Continue"}
 </button>

 <p className="mt-5 text-center text-sm text-muted-foreground">
 Didn&apos;t receive the code?{" "}
 {isSendingOtp || isResendingVerification ? (
 <span className="font-semibold text-muted-foreground">Sending…</span>
 ) : resendCooldown > 0 ? (
 <span className="font-semibold text-muted-foreground">
 Resend in {resendCooldown}s
 </span>
 ) : (
 <button
 type="button"
 onClick={handleResend}
 disabled={isBusy || (!registrationContext && !cleanIdentifier)}
 className="font-bold text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
 >
 Resend OTP
 </button>
 )}
 </p>
 </form>

 <div className="mt-5 text-center sm:mt-7">
 <Link
 href="/signin"
 className="text-sm font-medium text-muted-foreground hover:text-primary"
 >
 ← Back to Sign In
 </Link>
 </div>

 <p className="mt-4 text-center text-xs leading-5 text-muted-foreground sm:mt-6">
 Never share your verification code with anyone.
 </p>
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
 <Image
 src="/35124 (1).jpg"
 alt="Xerin Mart"
 fill
 priority
 sizes="50vw"
 className="object-cover object-center"
 />
 <div className="absolute inset-0 bg-black/55" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
 <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-transparent" />

 <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
 <div />

 <div className="max-w-md space-y-6">
 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card/10 text-white">
 <HugeiconsIcon icon={SecurityCheckIcon} size={22} />
 </div>
 <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
 Almost there.
 </h2>
 <p className="text-base leading-relaxed text-white/75 sm:text-lg">
 Enter the code we sent you. This quick check keeps your account, orders and payments safe.
 </p>

 <div className="space-y-3 border-l-2 border-primary/60 pl-4 pt-1">
 <p className="text-sm font-medium text-white/85">Codes expire quickly for your safety</p>
 <p className="text-sm font-medium text-white/85">We only send OTPs to your registered contact</p>
 <p className="text-sm font-medium text-white/85">Verified accounts shop with full protection</p>
 </div>
 </div>

 <div className="flex items-center justify-between text-xs text-white/60">
 <span>&copy; {new Date().getFullYear()} Xerin Mart. All rights reserved.</span>
 </div>
 </div>
 </div>
 </section>
 );
};

export default VerifyOtp;

function OtpBoxes({
 value,
 onChange,
 disabled,
}: {
 value: string;
 onChange: (v: string) => void;
 disabled?: boolean;
}) {
 const refs = React.useRef<Array<HTMLInputElement | null>>([]);
 const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

 const setAt = (i: number, d: string) => {
 const next = value.split("");
 next[i] = d;
 onChange(next.join("").slice(0, 6));
 };

 return (
 <div
 className="flex items-center justify-center gap-2 sm:gap-3"
 onPaste={(e) => {
 const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
 if (!pasted) return;
 e.preventDefault();
 onChange(pasted);
 refs.current[Math.min(pasted.length, 5)]?.focus();
 }}
 >
 {digits.map((digit, i) => (
 <input
 key={i}
 ref={(el) => { refs.current[i] = el; }}
 type="text"
 inputMode="numeric"
 autoComplete={i === 0 ? "one-time-code" : "off"}
 aria-label={`Digit ${i + 1}`}
 value={digit}
 maxLength={1}
 autoFocus={i === 0}
 disabled={disabled}
 onFocus={(e) => e.target.select()}
 onChange={(e) => {
 const d = e.target.value.replace(/\D/g, "");
 if (!d) return;
 if (d.length > 1) {
 // multi-digit input (autofill / quick typing)
 const merged = `${value.slice(0, i)}${d}`.slice(0, 6);
 onChange(merged);
 refs.current[Math.min(merged.length, 5)]?.focus();
 return;
 }
 setAt(i, d);
 if (i < 5) refs.current[i + 1]?.focus();
 }}
 onKeyDown={(e) => {
 if (e.key === "Backspace") {
 e.preventDefault();
 if (digits[i]) {
 setAt(i, "");
 } else if (i > 0) {
 setAt(i - 1, "");
 refs.current[i - 1]?.focus();
 }
 } else if (e.key === "ArrowLeft" && i > 0) {
 refs.current[i - 1]?.focus();
 } else if (e.key === "ArrowRight" && i < 5) {
 refs.current[i + 1]?.focus();
 }
 }}
 className={`h-12 w-11 rounded-xl border-2 bg-muted text-center text-xl font-bold text-foreground outline-none transition sm:h-14 sm:w-13 sm:text-2xl disabled:cursor-not-allowed disabled:opacity-60 ${
 digit
 ? "border-primary text-primary"
 : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
 }`}
 />
 ))}
 </div>
 );
}
