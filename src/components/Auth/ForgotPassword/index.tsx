"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { HugeiconsIcon } from "@hugeicons/react";
import { SecurityCheckIcon, LockIcon, CheckmarkCircle02Icon, Mail01Icon } from "@hugeicons/core-free-icons";

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

const ForgotPassword = () => {
 const { forgotPassword, isSubmittingForgotPassword } = useAuth();

 const [email, setEmail] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const [errorMessage, setErrorMessage] = useState("");

 const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();

 setSuccessMessage("");
 setErrorMessage("");

 const cleanEmail = email.trim().toLowerCase();

 if (!cleanEmail) {
 setErrorMessage("Enter your registered email address.");
 return;
 }

 try {
 await forgotPassword({
 email: cleanEmail,
 });

 setSuccessMessage(
 "Password reset instructions have been sent. Check your email, then continue to reset your password."
 );
 } catch (error) {
 setErrorMessage(
 getApiErrorMessage(
 error,
 "Failed to submit password reset request. Please try again."
 )
 );
 }
 };

 return (
 <section className="min-h-[100dvh] bg-card lg:grid lg:grid-cols-2">
 {/* Left panel: form */}
 <div className="flex min-h-[100dvh] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-10 sm:py-8 xl:px-20">
 <div className="flex items-center justify-between">
 <Link href="/" className="inline-flex w-fit items-center gap-2">
 <Image src="/images/logo/xerin-logo-mark.png" alt="Xerin Marketplace" width={44} height={44} priority className="h-11 w-11 object-contain" />
 <span className="text-xl font-bold text-foreground sm:text-2xl">Xerin Marketplace</span>
 </Link>
 <Link href="/" className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary lg:hidden">
 Shop
 </Link>
 </div>

 <div className="flex flex-1 items-center justify-center py-5 sm:py-10">
 <div className="w-full max-w-[420px]">
 <div className="mb-5 text-center sm:mb-7">
 <h1 className="mb-1.5 text-2xl font-bold text-foreground sm:font-semibold">
 Forgot your password?
 </h1>
 <p className="text-sm text-muted-foreground">
 Enter your registered email to receive reset instructions.
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
 <div className="mb-3.5">
 <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-foreground">
 Email Address
 </label>

 <div className="relative">
 <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
 <HugeiconsIcon icon={Mail01Icon} size={17} />
 </span>
 <input
 id="forgot-email"
 name="email"
 type="email"
 autoComplete="email"
 value={email}
 onChange={(event) => setEmail(event.target.value)}
 placeholder="Enter your registered email"
 required
 disabled={isSubmittingForgotPassword}
 className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmittingForgotPassword || !email.trim()}
 className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
 >
 {isSubmittingForgotPassword
 ? "Sending instructions..."
 : "Send Reset Instructions"}
 </button>
 </form>

 <p className="mt-5 text-center text-sm sm:mt-6">
 <span className="text-muted-foreground">Remember your password? </span>
 <Link href="/signin" className="font-medium text-primary hover:underline">
 Back to Sign In
 </Link>
 </p>

 <p className="mt-3 text-center text-sm">
 <Link href="/reset-password" className="font-medium text-primary hover:underline">
 Already have OTP? Reset password
 </Link>
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
 <span>© {new Date().getFullYear()} XerinMarket</span>
 </div>
 </div>

 {/* Right panel: marketing / imagery */}
 <div className="relative hidden min-h-[100dvh] overflow-hidden bg-carbon lg:flex lg:flex-col">
 <Image src="/35124 (1).jpg" alt="XerinMarket" fill priority sizes="50vw" className="object-cover object-center" />
 <div className="absolute inset-0 bg-black/55" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
 <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-transparent" />

 <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
 <div />

 {/* Hero content */}
 <div className="max-w-md space-y-6">
 <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
 It happens to everyone.
 </h2>
 <p className="text-base leading-relaxed text-white/75 sm:text-lg">
 Forgot your password? No stress, we&apos;ll email you a reset link and you&apos;ll be back in your account in a minute.
 </p>

 {/* Feature highlights */}
 <div className="space-y-3 border-l-2 border-primary/60 pl-4 pt-1">
 <p className="text-sm font-medium text-white/85">Reset link sent straight to your inbox</p>
 <p className="text-sm font-medium text-white/85">Your account stays protected throughout</p>
 <p className="text-sm font-medium text-white/85">Back to shopping in minutes</p>
 </div>
 </div>

 {/* Footer note */}
 <div className="flex items-center justify-between text-xs text-white/60">
 <span>&copy; {new Date().getFullYear()} Xerin Marketplace. All rights reserved.</span>
 </div>
 </div>
 </div>
 </section>
 );
};

export default ForgotPassword;
