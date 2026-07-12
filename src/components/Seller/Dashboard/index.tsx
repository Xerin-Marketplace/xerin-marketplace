"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { productsApi } from "@/lib/api/products";
import { sellersApi } from "@/lib/api/sellers";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";
import type { Product } from "@/types/api/product";
import type { SellerKycDocument, SellerKycStatus } from "@/types/api/seller";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type CurrentUser = {
  account_type?: string;
  roles?: string[];
  seller_status?: string | null;
  first_name?: string | null;
};

const REQUIRED_DOCUMENTS = ["tin", "business_profile", "business_registration"];

const SellerDashboard = () => {
  const router = useRouter();
  const user = authStorage.getUser<CurrentUser>();
  const token = authStorage.getAccessToken();

  const isSeller = useMemo(() => {
    if (!user) return false;
    const roles = user.roles ?? [];
    return user.account_type === "seller" || roles.includes("seller");
  }, [user]);

  const [products, setProducts] = useState<Product[]>([]);
  const [kycStatus, setKycStatus] = useState<SellerKycStatus | null>(null);
  const [documents, setDocuments] = useState<SellerKycDocument[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/signin?redirect=/seller/dashboard");
      return;
    }

    if (!isSeller) {
      router.replace("/my-account");
      return;
    }

    void loadData();
  }, [isSeller, router, token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [productList, status, docs] = await Promise.all([
        productsApi.getMyProducts(token),
        sellersApi.getKycStatus(token),
        sellersApi.getKycDocuments(token),
      ]);
      setProducts(productList);
      setKycStatus(status);
      setDocuments(docs);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = products.length;
    const approved = products.filter((p) => p.status === "approved").length;
    const pending = products.filter((p) => p.status === "pending_review").length;
    const rejected = products.filter((p) => p.status === "rejected").length;
    return { total, approved, pending, rejected };
  }, [products]);

  const uploadedTypes = useMemo(
    () => new Set(documents.map((doc) => doc.document_type)),
    [documents]
  );

  const missingDocuments = REQUIRED_DOCUMENTS.filter((type) => !uploadedTypes.has(type));

  if (!token || !isSeller) return null;

  return (
    <>
      <Breadcrumb title="Seller Dashboard" pages={["Seller Dashboard"]} />
      <section className="py-14 bg-gray-2 dark:bg-darkTheme-bg min-h-screen">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 space-y-8">
          <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-dark dark:text-white mb-2">
              Karibu {user?.first_name || "Seller"}
            </h2>
            <p className="text-dark-4 dark:text-darkTheme-body-color">
              Manage your seller account, track KYC progress, and oversee your product catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
              <p className="text-dark-4 dark:text-darkTheme-body-color text-sm mb-1">Total products</p>
              <p className="text-3xl font-semibold text-dark dark:text-white">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
              <p className="text-dark-4 dark:text-darkTheme-body-color text-sm mb-1">Approved</p>
              <p className="text-3xl font-semibold text-success">{stats.approved}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
              <p className="text-dark-4 dark:text-darkTheme-body-color text-sm mb-1">Pending review</p>
              <p className="text-3xl font-semibold text-warning">{stats.pending}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
              <p className="text-dark-4 dark:text-darkTheme-body-color text-sm mb-1">Rejected</p>
              <p className="text-3xl font-semibold text-red">{stats.rejected}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-dark dark:text-white">KYC Status</h3>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    kycStatus?.can_submit_for_review
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {kycStatus?.seller_status ?? user?.seller_status ?? "pending"}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {REQUIRED_DOCUMENTS.map((type) => {
                  const uploaded = uploadedTypes.has(type);
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize text-dark dark:text-white">
                        {type.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          uploaded ? "bg-success/10 text-success" : "bg-gray-2 text-dark-2"
                        }`}
                      >
                        {uploaded ? "Uploaded" : "Missing"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {missingDocuments.length > 0 && (
                <div className="rounded-lg bg-warning/10 text-warning px-4 py-3 text-sm mb-6">
                  Missing: {missingDocuments.map((type) => type.replace(/_/g, " ")).join(", ")}
                </div>
              )}

              <Link
                href="/seller/kyc"
                className="inline-flex rounded-lg bg-blue text-white py-2.5 px-5 font-medium hover:bg-blue-dark transition"
              >
                Manage KYC
              </Link>
            </div>

            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-dark dark:text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/seller/products"
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-4 hover:border-blue transition"
                >
                  <p className="font-medium text-dark dark:text-white">Manage Products</p>
                  <p className="text-sm text-dark-4 dark:text-darkTheme-body-color">
                    View and edit your listings
                  </p>
                </Link>
                <Link
                  href="/seller/kyc"
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-4 hover:border-blue transition"
                >
                  <p className="font-medium text-dark dark:text-white">Upload Documents</p>
                  <p className="text-sm text-dark-4 dark:text-darkTheme-body-color">
                    Complete seller verification
                  </p>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-3 dark:border-darkTheme-border-color">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-dark dark:text-white">Recent Products</h3>
                <Link
                  href="/seller/products"
                  className="text-blue hover:text-blue-dark text-sm font-medium"
                >
                  View all products
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-dark-4 dark:text-darkTheme-body-color">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-dark-4 dark:text-darkTheme-body-color">
                No products yet.{" "}
                <Link href="/seller/products" className="text-blue hover:text-blue-dark">
                  Add your first product
                </Link>
                .
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-1 dark:bg-darkTheme-secondary-bg">
                    <tr>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">Product</th>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">Price</th>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-3 dark:divide-darkTheme-border-color">
                    {products.slice(0, 5).map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 font-medium text-dark dark:text-white">{product.name}</td>
                        <td className="px-6 py-4 text-dark dark:text-white">
                          {product.currency} {product.price}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                              product.status === "approved"
                                ? "bg-success/10 text-success"
                                : product.status === "rejected"
                                ? "bg-red/10 text-red"
                                : "bg-warning/10 text-warning"
                            }`}
                          >
                            {product.status ?? "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default SellerDashboard;
