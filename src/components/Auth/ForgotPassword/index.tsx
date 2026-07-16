"use client";

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

    try {
      await forgotPassword({
        email: email.trim(),
      });

      setSuccessMessage(
        "Password reset instructions have been sent. Check your email, then continue to reset your password."
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to submit password reset request.")
      );
    }
  };

  return (
    <section className="overflow-hidden py-20 bg-gray-2 dark:bg-dark">
      <div className="max-w-[520px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white dark:bg-darkTheme-card rounded-xl shadow-1 px-4 py-10 sm:px-10">
          <div className="text-center mb-8">
            <h1 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark dark:text-white">
              Forgot Password
            </h1>

            <p className="mt-3 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
              Enter your registered email address. We will send reset instructions.
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
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2.5 text-custom-sm font-medium text-dark dark:text-white"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-secondary-bg w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingForgotPassword}
              className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmittingForgotPassword ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-custom-sm">
            <Link href="/signin" className="text-blue hover:underline">
              Back to Sign In
            </Link>

            <Link href="/reset-password" className="text-blue hover:underline">
              Already have OTP?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
