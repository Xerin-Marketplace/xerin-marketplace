"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { adminService } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const formatMoney = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

const REPORTS = [
  { key: "sales", label: "Sales Reports" },
  { key: "orders", label: "Order Reports" },
  { key: "products", label: "Product Reports" },
  { key: "customers", label: "Customer Reports" },
];

export default function AdminAnalytics() {
  const searchParams = useSearchParams();
  const report = searchParams.get("report") || "sales";

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [] as any[],
    newCustomers: 0,
    returningCustomers: 0,
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAnalyticsOverview();
      setAnalytics(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const cards = useMemo(
    () => [
      { label: "Total Sales", value: formatMoney(analytics.totalSales) },
      { label: "Total Orders", value: analytics.totalOrders.toLocaleString() },
      { label: "Average Order Value", value: formatMoney(analytics.averageOrderValue) },
      { label: "New Customers", value: analytics.newCustomers.toLocaleString() },
    ],
    [analytics]
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-[#111827]">
              {loading ? "—" : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 sm:px-5">
          <nav className="flex gap-4 overflow-x-auto" aria-label="Analytics reports">
            {REPORTS.map((r) => (
              <a
                key={r.key}
                href={`/admin/analytics?report=${r.key}`}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  report === r.key
                    ? "border-[#4b5563] text-[#4b5563]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-5">
          {report === "sales" && (
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Sales Overview</h3>
              <p className="text-gray-500">Detailed sales charts will be available once analytics data is connected.</p>
            </div>
          )}
          {report === "orders" && (
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Order Trends</h3>
              <p className="text-gray-500">Order trend visualization will be available once analytics data is connected.</p>
            </div>
          )}
          {report === "products" && (
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Top Products</h3>
              {analytics.topProducts.length === 0 ? (
                <p className="text-gray-500">No product performance data available yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {analytics.topProducts.map((product) => (
                    <li key={product.id} className="py-3 flex items-center justify-between">
                      <span className="text-sm text-[#111827]">{product.name}</span>
                      <span className="text-sm text-gray-600">{product.sales} sales</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {report === "customers" && (
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Customer Insights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">New Customers</p>
                  <p className="text-2xl font-semibold text-[#111827]">{analytics.newCustomers}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Returning Customers</p>
                  <p className="text-2xl font-semibold text-[#111827]">{analytics.returningCustomers}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
