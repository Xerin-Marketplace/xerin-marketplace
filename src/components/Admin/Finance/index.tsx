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

const TABS = [
  { key: "transactions", label: "Transactions" },
  { key: "methods", label: "Payment Methods" },
  { key: "refunds", label: "Refunds" },
  { key: "failed", label: "Failed Payments" },
];

export default function AdminFinance() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "transactions";

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalCommissions: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    failedPayments: 0,
  });

  const loadFinanceSummary = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFinanceSummary();
      setSummary(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFinanceSummary();
  }, []);

  const cards = useMemo(
    () => [
      { label: "Total Revenue", value: formatMoney(summary.totalRevenue) },
      { label: "Commissions Earned", value: formatMoney(summary.totalCommissions) },
      { label: "Payouts Processed", value: formatMoney(summary.totalPayouts) },
      { label: "Pending Payouts", value: formatMoney(summary.pendingPayouts) },
    ],
    [summary]
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
          <nav className="flex gap-4 overflow-x-auto" aria-label="Finance tabs">
            {TABS.map((tab) => (
              <a
                key={tab.key}
                href={`/admin/finance?tab=${tab.key}`}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-[#4b5563] text-[#4b5563]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-5">
          {activeTab === "transactions" && <TransactionsTab loading={loading} />}
          {activeTab === "methods" && <PaymentMethodsTab />}
          {activeTab === "refunds" && <RefundsTab />}
          {activeTab === "failed" && <FailedPaymentsTab count={summary.failedPayments} />}
        </div>
      </div>
    </div>
  );
}

function TransactionsTab({ loading }: { loading: boolean }) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    adminService
      .listTransactions()
      .then(setTransactions)
      .catch((error) => toast.error(getErrorMessage(error)));
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Recent Transactions</h3>
      {loading && transactions.length === 0 ? (
        <p className="text-gray-500">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Reference</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Method</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Amount</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-sm text-[#111827]">{tx.reference}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{tx.method}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatMoney(tx.amount, tx.currency)}</td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">{tx.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentMethodsTab() {
  const methods = [
    { name: "Mobile Money", status: "Active", provider: "M-Pesa / Tigo Pesa" },
    { name: "Card Payments", status: "Active", provider: "Stripe" },
    { name: "Bank Transfer", status: "Pending", provider: "Local banks" },
    { name: "USSD", status: "Active", provider: "Telco partners" },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Payment Methods</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-700">Method</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-700">Provider</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {methods.map((method) => (
              <tr key={method.name}>
                <td className="px-4 py-3 text-sm text-[#111827]">{method.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{method.provider}</td>
                <td className="px-4 py-3 text-sm capitalize text-gray-600">{method.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RefundsTab() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Refunds</h3>
      <p className="text-gray-500">Refund management will be available once the payments backend is connected.</p>
    </div>
  );
}

function FailedPaymentsTab({ count }: { count: number }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Failed Payments</h3>
      <p className="text-gray-500">
        Failed payments requiring attention: <span className="font-semibold text-[#111827]">{count}</span>
      </p>
    </div>
  );
}
