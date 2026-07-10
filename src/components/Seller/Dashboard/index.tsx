"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { authStorage } from "@/lib/auth/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

type CurrentUser = {
  account_type?: string;
  roles?: string[];
  seller_status?: string | null;
  first_name?: string | null;
};

const SellerDashboard = () => {
  const router = useRouter();
  const user = authStorage.getUser<CurrentUser>();
  const token = authStorage.getAccessToken();

  const isSeller = useMemo(() => {
    if (!user) return false;
    const roles = user.roles ?? [];
    return user.account_type === "seller" || roles.includes("seller");
  }, [user]);

  useEffect(() => {
    if (!token) {
      router.replace("/signin?redirect=/seller/dashboard");
      return;
    }

    if (!isSeller) {
      router.replace("/my-account");
    }
  }, [isSeller, router, token]);

  if (!token || !isSeller) return null;

  return (
    <>
      <Breadcrumb title={"Seller Dashboard"} pages={["Seller Dashboard"]} />
      <section className="py-14 bg-gray-2 dark:bg-darkTheme-bg">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-dark dark:text-white mb-2">
              Karibu {user?.first_name || "Seller"}
            </h2>
            <p className="text-dark-4 dark:text-darkTheme-body-color mb-5">
              Seller status: <strong>{user?.seller_status || "pending"}</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/seller/kyc" className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-4 hover:border-blue">
                Complete KYC documents
              </Link>
              <Link href="/seller/products" className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-4 hover:border-blue">
                Manage products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SellerDashboard;
