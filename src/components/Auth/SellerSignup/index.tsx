"use client";

import { authApi } from "@/lib/api/endpoints/auth";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { ApiError } from "@/lib/api/client";
import type { SellerBusinessCategory } from "@/types/api/seller";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || firstName;

  return { first_name: firstName, last_name: lastName };
};

const SellerSignup = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [agree, setAgree] = useState(false);

  const [categories, setCategories] = useState<SellerBusinessCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordMismatch = useMemo(() => {
    return Boolean(confirmPassword) && confirmPassword !== password;
  }, [confirmPassword, password]);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await sellersApi.getBusinessCategories();
        setCategories(data);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load business categories.");
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword ||
      !businessName.trim() ||
      !selectedCategoryId
    ) {
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

    if (!agree) {
      toast.error("You must accept the seller agreement.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = splitFullName(fullName);

      await authApi.registerSeller({
        ...nameParts,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        business_name: businessName.trim(),
        business_category_ids: [selectedCategoryId],
        contact_email: email.trim().toLowerCase(),
        contact_phone: phone.trim(),
        agreement_accepted: true,
      });

      toast.success("Seller account created. Please sign in to continue onboarding.");
      router.push("/signin?redirect=/seller/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Unable to create seller account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden py-20 bg-gray-2 dark:bg-darkTheme-bg min-h-screen flex items-center">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[720px] w-full mx-auto rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-8">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark dark:text-white mb-1.5">
                Become a Seller on Xerin Market
              </h2>
              <p className="dark:text-darkTheme-body-color">
                Register your business, then complete KYC and wait for admin approval.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="full_name" className="block mb-2.5 dark:text-darkTheme-body-color">
                  Full Name <span className="text-red">*</span>
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Email <span className="text-red">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Phone <span className="text-red">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={isSubmitting}
                    placeholder="2557XXXXXXXX"
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Password <span className="text-red">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Confirm Password <span className="text-red">*</span>
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                  {isPasswordMismatch && <p className="text-sm text-red mt-2">Passwords do not match.</p>}
                </div>
              </div>

              <div>
                <label htmlFor="business_name" className="block mb-2.5 dark:text-darkTheme-body-color">
                  Business Name <span className="text-red">*</span>
                </label>
                <input
                  id="business_name"
                  type="text"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div>
                <label htmlFor="business_category" className="block mb-2.5 dark:text-darkTheme-body-color">
                  Business Category <span className="text-red">*</span>
                </label>
                <select
                  id="business_category"
                  value={selectedCategoryId}
                  onChange={(event) => setSelectedCategoryId(event.target.value)}
                  disabled={isSubmitting || isLoadingCategories}
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={String(category.id)} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-2 text-sm dark:text-darkTheme-body-color">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <span>I agree to the seller terms and onboarding verification process.</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingCategories}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Create Seller Account"}
              </button>

              <p className="text-center mt-4">
                <span className="dark:text-darkTheme-body-color">Already have an account?</span>
                <Link href="/signin?redirect=/seller/dashboard" className="pl-2 text-dark dark:text-darkTheme-body-color hover:text-blue">
                  Sign in as Seller
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
  );
};

export default SellerSignup;
