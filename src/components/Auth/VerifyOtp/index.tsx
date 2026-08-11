"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { OtpPurpose } from "@/types/api/auth";

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

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const VerifyOtp = () => {
  const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const phoneParam = searchParams.get("phone");
  const emailParam = searchParams.get("email");
  const purposeParam = searchParams.get("purpose");

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
      purposeParam === "password_reset"
    ) {
      return purposeParam;
    }
    return "generic";
  }, [purposeParam]);

  const nextPath = searchParams.get("next") || "/signin";

  const [otpCode, setOtpCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cleanOtp = otpCode.replace(/\D/g, "").slice(0, 6);
  const hasVerificationContext = Boolean(phone) && purpose !== "generic";

  const maskedPhone = phone
    ? phone.length > 7
      ? `${phone.slice(0, 4)}••••${phone.slice(-3)}`
      : phone
    : "";

  const title =
    purpose === "register_seller"
      ? "Verify your seller account"
      : purpose === "register"
        ? "Verify your account"
        : purpose === "password_reset"
          ? "Verify reset request"
          : "Verification required";

  const subtitle =
    purpose === "register_seller"
      ? "We sent a 6-digit verification code to the phone number and email used during seller registration."
      : purpose === "register"
        ? "We sent a 6-digit verification code to the phone number and email used during registration."
        : "Enter the verification code sent to your registered phone number.";

  const handleResend = async () => {
    if (!hasVerificationContext) {
      setErrorMessage("Your verification session is incomplete. Please register again.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await sendOtp({ phone, purpose });
      setSuccessMessage("A fresh verification code has been sent.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to resend the code."));
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasVerificationContext) {
      setErrorMessage("Your verification session is incomplete. Please register again.");
      return;
    }

    if (cleanOtp.length < 4) {
      setErrorMessage("Enter the verification code sent to you.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await verifyOtp({ phone, otp_code: cleanOtp, purpose });

      setSuccessMessage("Verification successful. Redirecting to sign in...");

      const target = nextPath.startsWith("/") ? nextPath : "/signin";
      const separator = target.includes("?") ? "&" : "?";
      const verifiedTarget =
        `${target}${separator}verified=1` +
        (email ? `&email=${encodeURIComponent(email)}` : "");

      window.setTimeout(() => router.push(verifiedTarget), 700);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to verify this code."));
    }
  };

  return (
    <section className="min-h-screen grid bg-white dark:bg-darkTheme-bg lg:grid-cols-2">
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10 xl:px-20">
        <Link href="/" className="inline-flex w-fit items-center gap-2.5">
          <Image src="/images/logo/logo.png" alt="XerinMarket" width={32} height={32} priority className="object-contain" />
          <span className="text-lg font-semibold text-dark dark:text-white">XerinMarket</span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                <ShieldIcon />
              </div>

              <h1 className="mb-2 text-2xl font-semibold text-dark dark:text-white">
                {title}
              </h1>

              <p className="mx-auto max-w-[380px] text-sm leading-6 text-dark-4 dark:text-darkTheme-secondary-muted">
                {subtitle}
              </p>
            </div>

            {!hasVerificationContext ? (
              <div className="rounded-xl border border-red/20 bg-red-light-6 p-5 text-center">
                <p className="mb-2 font-semibold text-red">Verification session is missing</p>
                <p className="mb-5 text-sm leading-6 text-dark-4">
                  We did not receive the registration phone number or verification purpose.
                  Please return to registration and submit the form again.
                </p>
                <Link
                  href="/signin"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-orange px-6 text-sm font-semibold text-white hover:bg-orange-dark"
                >
                  Back to Registration
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-xl border border-gray-3 bg-gray-1 p-4 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg">
                  <p className="text-xs font-medium uppercase tracking-wider text-dark-4 dark:text-darkTheme-secondary-muted">
                    Code sent to
                  </p>
                  <p className="mt-1 font-semibold text-dark dark:text-white">{maskedPhone}</p>
                  {email && (
                    <p className="mt-1 break-all text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                      {email}
                    </p>
                  )}
                </div>

                {successMessage && (
                  <div className="mb-5 rounded-lg border border-green/20 bg-green-light-6 px-4 py-3 text-sm text-green">
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-5 rounded-lg border border-red/20 bg-red-light-6 px-4 py-3 text-sm text-red">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleVerify}>
                  <label htmlFor="otpCode" className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Verification Code
                  </label>

                  <input
                    id="otpCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                    className="h-16 w-full rounded-xl border border-gray-3 bg-gray-1 px-5 text-center text-2xl font-semibold tracking-[0.45em] text-dark outline-none transition placeholder:text-dark-4 placeholder:opacity-40 focus:border-orange focus:bg-white focus:ring-4 focus:ring-orange/10 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-white"
                  />

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || cleanOtp.length < 4}
                    className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-orange px-6 text-sm font-semibold text-white transition hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <div className="mt-5 text-center text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSendingOtp}
                      className="font-semibold text-orange hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSendingOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </form>

                <p className="mt-7 text-center text-xs leading-5 text-dark-4 dark:text-darkTheme-secondary-muted">
                  For your security, never share this verification code with anyone.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-dark-4 dark:text-darkTheme-secondary-muted">
          <Link href="/help" className="hover:text-dark dark:hover:text-white">Help Center</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-dark dark:hover:text-white">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-dark dark:hover:text-white">Privacy</Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} XerinMarket</span>
        </div>
      </div>

      <div className="relative hidden min-h-screen overflow-hidden bg-dark lg:block">
        <Image src="/images/bg6-dark.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="inline-flex w-fit items-center gap-2.5">
            <Image src="/images/logo/logo.png" alt="XerinMarket" width={32} height={32} className="object-contain" />
            <span className="text-lg font-semibold text-white">XerinMarket</span>
          </Link>

          <div className="max-w-md">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
              <ShieldIcon />
            </div>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-white xl:text-4xl">
              One final step to secure your account
            </h2>
            <p className="leading-relaxed text-white/75">
              Account verification helps protect buyers, sellers, payments and marketplace activity from unauthorized access.
            </p>
          </div>

          <div className="text-sm text-white/65">
            Secure verification • XerinMarket
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyOtp;
