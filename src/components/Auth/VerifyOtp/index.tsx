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

const VerifyOtp = () => {
  const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp } = useAuth();

  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await sendOtp({
        phone: phone.trim(),
      });

      setSuccessMessage("OTP has been sent. Check your phone.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to send OTP."));
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    try {
      await verifyOtp({
        phone: phone.trim(),
        otp_code: otpCode.trim(),
      });

      setSuccessMessage("OTP verified successfully.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to verify OTP."));
    }
  };

  return (
    <section className="overflow-hidden py-20 bg-gray-2 dark:bg-dark">
      <div className="max-w-[560px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white dark:bg-darkTheme-card rounded-xl shadow-1 px-4 py-10 sm:px-10">
          <div className="text-center mb-8">
            <h1 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark dark:text-white">
              Verify OTP
            </h1>

            <p className="mt-3 text-custom-sm text-dark-4 dark:text-darkTheme-secondary-muted">
              Verify your phone number using the OTP sent by Xerin Market.
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

          <form onSubmit={handleVerify}>
            <div className="mb-5">
              <label
                htmlFor="phone"
                className="block mb-2.5 text-custom-sm font-medium text-dark dark:text-white"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="255700000000"
                required
                className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-secondary-bg w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="otpCode"
                className="block mb-2.5 text-custom-sm font-medium text-dark dark:text-white"
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
                className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-secondary-bg w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || !phone.trim()}
                className="w-full flex justify-center font-medium text-dark dark:text-white bg-gray-1 dark:bg-darkTheme-secondary-bg py-3 px-6 rounded-md ease-out duration-200 hover:text-blue disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSendingOtp ? "Sending..." : "Send / Resend OTP"}
              </button>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-custom-sm">
            <Link href="/signin" className="text-blue hover:underline">
              Back to Sign In
            </Link>

            <Link href="/reset-password" className="text-blue hover:underline">
              Reset password with OTP
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyOtp;
