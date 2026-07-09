"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";
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
        authStorage.setSession(response);
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
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2 dark:bg-darkTheme-bg">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark dark:text-white mb-1.5">
                Create an Account
              </h2>
              <p className="dark:text-darkTheme-body-color">Enter your detail below</p>
            </div>

            <div className="flex flex-col gap-4.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => toast("Google sign-up is not enabled yet.")}
                className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color p-3 ease-out duration-200 hover:bg-gray-2 dark:hover:bg-darkTheme-tertiary-bg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_98_7461_signup)">
                    <mask
                      id="mask0_98_7461_signup"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                    >
                      <path d="M20 0H0V20H20V0Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_98_7461_signup)">
                      <path
                        d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z"
                        fill="#34A853"
                      />
                      <path
                        d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z"
                        fill="#EB4335"
                      />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="clip0_98_7461_signup">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Sign Up with Google
              </button>
            </div>

            <span className="relative z-1 block font-medium text-center mt-4.5">
              <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3 dark:bg-darkTheme-border-color"></span>
              <span className="inline-block px-3 bg-white dark:bg-darkTheme-card dark:text-darkTheme-body-color">Or</span>
            </span>

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
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
