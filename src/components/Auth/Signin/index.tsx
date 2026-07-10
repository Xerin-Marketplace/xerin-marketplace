"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/links";
import React, { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";

type AuthUser = {
  account_type?: string;
  roles?: string[];
};

const resolvePostLoginPath = (requestedPath: string | null, user?: AuthUser): string => {
  if (requestedPath && requestedPath.startsWith("/")) {
    return requestedPath;
  }

  const roles = user?.roles ?? [];

  if (user?.account_type === "super_admin" || user?.account_type === "admin" || roles.includes("super_admin") || roles.includes("admin")) {
    return "/admin/dashboard";
  }

  if (user?.account_type === "seller" || roles.includes("seller")) {
    return "/seller/dashboard";
  }

  return "/my-account";
};

const Signin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await authApi.login({
        email: email.trim(),
        password,
      });

      authStorage.setSession(session);
      toast.success("Signed in successfully.");
      const requestedRedirect = searchParams.get("redirect");
      const redirectPath = resolvePostLoginPath(requestedRedirect, session.user as AuthUser | undefined);
      router.push(redirectPath);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Unable to sign in. Please try again.");
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
                Sign In to Your Account
              </h2>
              <p className="dark:text-darkTheme-body-color">Enter your detail below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Signing in..." : "Sign in to account"}
                </button>

                <a
                  href={ROUTES.contact}
                  className="block text-center text-dark-4 dark:text-darkTheme-secondary-muted mt-4.5 ease-out duration-200 hover:text-dark dark:hover:text-white"
                >
                  Forgot your password?
                </a>

                <p className="text-center mt-6">
                  <span className="dark:text-darkTheme-body-color">Don&apos;t have an account?</span>
                  <Link
                    href="/signup"
                    className="text-dark dark:text-darkTheme-body-color ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign Up Now!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
  );
};

export default Signin;
