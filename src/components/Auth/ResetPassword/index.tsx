"use client";

import Link from "next/link";
import Image from "next/image";
import React, { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, KeyIcon, LockIcon, SecurityCheckIcon, CheckmarkCircle02Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";

const getApiErrorMessage = (error: unknown, fallback: string) => {
 const apiError = error as {
 message?: string;
 response?: {
 data?: {
 detail?: unknown;
 message?: string;
 };
 };
 };

 const detail = apiError.response?.data?.detail;

 if (typeof detail === "string") {
 return detail;
 }

 if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object") {
 const first = detail[0] as { msg?: string };
 if (first.msg) {
 return first.msg;
 }
 }

 return apiError.response?.data?.message || apiError.message || fallback;
};

const Field = ({
 id,
 label,
 icon,
 ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
 id: string;
 label: string;
 icon: typeof Mail01Icon;
}) => (
 <div className="mb-3.5">
 <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
 {label}
 </label>
 <div className="relative">
 <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
 <HugeiconsIcon icon={icon} size={17} />
 </span>
 <input
 {...props}
 id={id}
 name={id}
 className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70"
 />
 </div>
 </div>
);

const ResetPassword = () => {
 const { resetPassword, isSubmittingResetPassword } = useAuth();

 const [email, setEmail] = useState("");
 const [otpCode, setOtpCode] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [successMessage, setSuccessMessage] = useState("");
 const [errorMessage, setErrorMessage] = useState("");

 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 const queryEmail = params.get("email");
 const queryOtp = params.get("otp_code");

 if (queryEmail) {
 setEmail(queryEmail);
 }

 if (queryOtp) {
 setOtpCode(queryOtp);
 }
 }, []);

 const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();

 setSuccessMessage("");
 setErrorMessage("");

 if (newPassword !== confirmPassword) {
 setErrorMessage("New password and confirm password do not match.");
 return;
 }

 try {
 await resetPassword({
 email: email.trim(),
 otp_code: otpCode.trim(),
 new_password: newPassword,
 });

 setSuccessMessage("Password has been reset successfully. You can now sign in.");
 setNewPassword("");
 setConfirmPassword("");
 } catch (error) {
 setErrorMessage(getApiErrorMessage(error, "Failed to reset password."));
 }
 };

 return (
 <section className="min-h-[100dvh] bg-card lg:grid lg:grid-cols-2">
 {/* Left panel: form */}
 <div className="flex min-h-[100dvh] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-10 sm:py-8 xl:px-20">
 <div className="flex items-center justify-between">
 <Link href="/" className="inline-flex w-fit items-center gap-2">
 <Image src="/images/logo/xerin-logo-mark.png" alt="Xerin Mart" width={44} height={44} priority className="h-11 w-11 object-contain" />
 <span className="text-xl font-bold text-foreground sm:text-2xl">Xerin Mart</span>
 </Link>
 <Link href="/" className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary lg:hidden">
 Shop
 </Link>
 </div>

 <div className="flex flex-1 items-center justify-center py-5 sm:py-10">
 <div className="w-full max-w-[420px]">
 <div className="mb-5 text-center sm:mb-7">
 <h1 className="mb-1.5 text-2xl font-bold text-foreground sm:font-semibold">
 Set a new password
 </h1>
 <p className="text-sm text-muted-foreground">
 Enter the code we sent you and choose a new password.
 </p>
 </div>

 {successMessage && (
 <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
 {successMessage}
 </div>
 )}

 {errorMessage && (
 <div role="alert" className="mb-5 rounded-lg border border-red-light-4 bg-red-light-6 px-4 py-3 text-sm text-destructive">
 {errorMessage}
 </div>
 )}

 <form onSubmit={handleSubmit}>
 <Field
 id="email"
 label="Email Address"
 type="email"
 icon={Mail01Icon}
 value={email}
 onChange={(event) => setEmail(event.target.value)}
 placeholder="Enter your registered email"
 autoComplete="email"
 required
 disabled={isSubmittingResetPassword}
 />

 <Field
 id="otpCode"
 label="Reset Code"
 type="text"
 inputMode="numeric"
 icon={KeyIcon}
 value={otpCode}
 onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
 placeholder="6-digit code from your email"
 maxLength={6}
 required
 disabled={isSubmittingResetPassword}
 />

 <div className="mb-3.5">
 <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-foreground">
 New Password
 </label>
 <div className="relative">
 <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
 <HugeiconsIcon icon={LockIcon} size={17} />
 </span>
 <input
 id="newPassword"
 name="newPassword"
 type={showPassword ? "text" : "password"}
 value={newPassword}
 onChange={(event) => setNewPassword(event.target.value)}
 placeholder="Create a new password"
 autoComplete="new-password"
 required
 disabled={isSubmittingResetPassword}
 className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-10 text-sm text-foreground outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70"
 />
 <button
 type="button"
 onClick={() => setShowPassword((prev) => !prev)}
 tabIndex={-1}
 aria-label={showPassword ? "Hide password" : "Show password"}
 className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
 >
 <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={17} />
 </button>
 </div>
 </div>

 <Field
 id="confirmPassword"
 label="Confirm Password"
 type={showPassword ? "text" : "password"}
 icon={LockIcon}
 value={confirmPassword}
 onChange={(event) => setConfirmPassword(event.target.value)}
 placeholder="Re-type your new password"
 autoComplete="new-password"
 required
 disabled={isSubmittingResetPassword}
 />

 <button
 type="submit"
 disabled={isSubmittingResetPassword}
 className="mt-1 flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
 >
 {isSubmittingResetPassword ? "Resetting..." : "Reset Password"}
 </button>
 </form>

 <p className="mt-5 text-center text-sm sm:mt-6">
 <Link href="/forgot-password" className="font-medium text-primary hover:underline">
 Request a new code
 </Link>
 <span className="mx-2 text-muted-foreground">·</span>
 <Link href="/signin" className="font-medium text-primary hover:underline">
 Back to Sign In
 </Link>
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-1 text-[11px] text-muted-foreground sm:gap-4 sm:text-xs">
 <Link href="/help" className="hover:text-foreground">Help Center</Link>
 <span>•</span>
 <Link href="/terms" className="hover:text-foreground">Terms</Link>
 <span>•</span>
 <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
 <span>•</span>
 <span>© {new Date().getFullYear()} Xerin Mart</span>
 </div>
 </div>

 {/* Right panel: marketing / imagery */}
 <div className="relative hidden min-h-[100dvh] overflow-hidden bg-carbon lg:flex lg:flex-col">
 <Image src="/35124 (1).jpg" alt="Xerin Mart" fill priority sizes="50vw" className="object-cover object-center" />
 <div className="absolute inset-0 bg-black/55" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
 <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-transparent" />

 <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
 <div />

 {/* Hero content */}
 <div className="max-w-md space-y-6">
 <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
 One step left.
 </h2>
 <p className="text-base leading-relaxed text-white/75 sm:text-lg">
 Pick a new password and you&apos;re back in. Everything on your account stays exactly where you left it.
 </p>

 <div className="space-y-3 border-l-2 border-primary/60 pl-4 pt-1">
 <p className="text-sm font-medium text-white/85">The code confirms it&apos;s really you</p>
 <p className="text-sm font-medium text-white/85">Only you can see your new password</p>
 <p className="text-sm font-medium text-white/85">Sign in again right after resetting</p>
 </div>
 </div>

 {/* Footer note */}
 <div className="flex items-center justify-between text-xs text-white/60">
 <span>&copy; {new Date().getFullYear()} Xerin Mart. All rights reserved.</span>
 </div>
 </div>
 </div>
 </section>
 );
};

export default ResetPassword;
