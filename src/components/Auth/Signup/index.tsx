"use client";

import Link from "next/link";
import React, { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import type { AuthTokenResponse } from "@/types/api/auth";

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  return {
    first_name: firstName,
    last_name: lastName || firstName,
  };
};

const hasAuthToken = (response: unknown): response is AuthTokenResponse => {
  return (
    typeof response === "object" &&
    response !== null &&
    "access_token" in response &&
    typeof (response as { access_token?: unknown }).access_token === "string"
  );
};

const Signup = () => {
  const router = useRouter();
  const { setSession } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordMismatch = useMemo(() => {
    return Boolean(confirmPassword) && password !== confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = splitFullName(fullName);

      const response = await authApi.registerBuyer({
        ...nameParts,
        email: email.trim(),
        password,
      });

      if (hasAuthToken(response)) {
        setSession(response);
        toast.success("Account created successfully.");
        router.push("/my-account");
        return;
      }

      toast.success("Account created successfully. Please sign in.");
      router.push("/signin");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Unable to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden py-20 bg-gray-2 dark:bg-darkTheme-bg min-h-screen flex items-center">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark dark:text-white mb-1.5">
                Create an Account
              </h2>
              <p className="dark:text-darkTheme-body-color">Enter your detail below</p>
            </div>
            <div className="mt-5.5">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Full Name <span className="text-red">*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Email Address <span className="text-red">*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re-type-password" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Re-type Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    name="re-type-password"
                    id="re-type-password"
                    placeholder="Re-type your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    aria-invalid={isPasswordMismatch}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                  {isPasswordMismatch && (
                    <p className="mt-2 text-sm text-red">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </button>

                <p className="text-center mt-6">
                  <span className="dark:text-darkTheme-body-color">Already have an account?</span>
                  <Link
                    href="/signin"
                    className="text-dark dark:text-darkTheme-body-color ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign in Now
                  </Link>
                </p>

                <p className="text-center mt-3 text-sm">
                  <span className="dark:text-darkTheme-body-color">Want to sell on Xerin?</span>
                  <Link
                    href="/seller/register"
                    className="text-dark dark:text-darkTheme-body-color ease-out duration-200 hover:text-blue pl-2"
                  >
                    Register as Seller
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
  );
};

export default Signup;
