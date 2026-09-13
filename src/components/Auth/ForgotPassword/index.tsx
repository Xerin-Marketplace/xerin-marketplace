"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

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
    <section className="min-h-[100dvh] bg-white dark:bg-darkTheme-bg lg:grid lg:grid-cols-2">
      {/* Left panel: form */}
      <div className="flex min-h-[100dvh] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-10 sm:py-8 xl:px-20">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex w-fit items-center gap-2">
            <Image src="/images/logo/logo.png" alt="XerinMarket" width={30} height={30} priority className="h-[30px] w-[30px] object-contain" />
            <span className="text-base font-bold text-dark dark:text-white sm:text-lg">XerinMarket</span>
          </Link>
          <Link href="/" className="rounded-full border border-gray-3 px-3 py-1.5 text-xs font-semibold text-dark-4 transition hover:text-orange dark:border-darkTheme-border-color dark:text-darkTheme-secondary-muted lg:hidden">
            Shop
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-5 sm:py-10">
          <div className="w-full max-w-[420px]">
            <div className="mb-5 text-center sm:mb-7">
              <h1 className="mb-1.5 text-2xl font-bold text-dark dark:text-white sm:font-semibold">
                Forgot your password?
              </h1>
              <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                Enter your registered email to receive reset instructions.
              </p>
            </div>

            {successMessage && (
              <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3.5">
                <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-dark dark:text-darkTheme-body-color">
                  Email Address
                </label>

                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmittingForgotPassword}
                  className="h-11 w-full rounded-lg border border-gray-3 bg-gray-1 px-3.5 text-sm text-dark outline-none transition focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingForgotPassword || !email.trim()}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-orange px-6 text-sm font-semibold text-white shadow-sm ease-out duration-200 hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingForgotPassword
                  ? "Sending instructions..."
                  : "Send Reset Instructions"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm sm:mt-6">
              <span className="text-dark-4 dark:text-darkTheme-secondary-muted">Remember your password? </span>
              <Link href="/signin" className="font-medium text-orange hover:underline">
                Back to Sign In
              </Link>
            </p>

            <p className="mt-3 text-center text-sm">
              <Link href="/reset-password" className="font-medium text-orange hover:underline">
                Already have OTP? Reset password
              </Link>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-1 text-[11px] text-dark-4 dark:text-darkTheme-secondary-muted sm:gap-4 sm:text-xs">
          <Link href="/help" className="hover:text-dark dark:hover:text-white">Help Center</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-dark dark:hover:text-white">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-dark dark:hover:text-white">Privacy</Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} XerinMarket</span>
        </div>
      </div>

      {/* Right panel: marketing / imagery */}
      <div className="relative hidden min-h-[100dvh] overflow-hidden bg-[#0b0f19] lg:flex lg:flex-col">
        <Image src="/35124 (1).jpg" alt="Xerin Marketplace" fill priority sizes="50vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a12]/95 via-[#0b0f19]/70 to-[#0b0f19]/40 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <div />

          {/* Hero content */}
          <div className="max-w-md space-y-6">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
              Secure access to your
              <br />
              XerinMarket account
            </h2>
            <p className="text-base leading-relaxed text-white/75 sm:text-lg">
              Recover your account safely and continue shopping, selling, and managing orders with confidence.
            </p>

            {/* Feature highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/80">Protected verification & password recovery</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/80">Your account and data remain safe</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/80">Fast & secure account recovery</span>
              </div>
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
