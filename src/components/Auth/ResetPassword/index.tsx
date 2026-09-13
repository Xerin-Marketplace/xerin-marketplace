"use client";

import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
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

const ResetPassword = () => {
  const { resetPassword, isSubmittingResetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    <section className="overflow-hidden py-20 bg-gray-2 dark:bg-dark">
      <div className="max-w-[560px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white dark:bg-darkTheme-card rounded-xl shadow-1 px-4 py-10 sm:px-10">
          <div className="text-center mb-8">
            <h1 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark dark:text-white">
              Reset Password
            </h1>

            <p className="mt-3 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
              Enter your email, OTP code, and new password.
            </p>
          </div>

          {successMessage && (
            <div className="mb-5 rounded-lg bg-green-light-6 px-4 py-3 text-custom-sm text-green">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 rounded-lg bg-red-light-6 px-4 py-3 text-custom-sm text-red">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3.5">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-dark dark:text-darkTheme-body-color"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full px-3.5 text-sm outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div className="mb-3.5">
              <label
                htmlFor="otpCode"
                className="block mb-2 text-sm font-medium text-dark dark:text-darkTheme-body-color"
              >
                OTP Code
              </label>

              <input
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                placeholder="Enter OTP code"
                required
                className="h-11 rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full px-3.5 text-sm outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div className="mb-3.5">
              <label
                htmlFor="newPassword"
                className="block mb-2 text-sm font-medium text-dark dark:text-darkTheme-body-color"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                required
                className="h-11 rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full px-3.5 text-sm outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-dark dark:text-darkTheme-body-color"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                required
                className="h-11 rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full px-3.5 text-sm outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingResetPassword}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-orange px-6 text-sm font-semibold text-white ease-out duration-200 hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmittingResetPassword ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <Link href="/forgot-password" className="text-orange hover:underline">
              Request reset again
            </Link>

            <Link href="/signin" className="text-orange hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
