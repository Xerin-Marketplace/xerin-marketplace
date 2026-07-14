"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { customersService, type CustomerAddress } from "@/lib/api/endpoints/customers";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const AdminCustomerAddresses = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await customersService.listAllAddresses();
      setAddresses(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const filtered = addresses.filter((a) =>
    [a.country, a.region, a.city, a.street, a.label].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const total = addresses.length;
  const defaultShipping = addresses.filter((a) => a.is_default_shipping).length;
  const defaultBilling = addresses.filter((a) => a.is_default_billing).length;
  const countries = new Set(addresses.map((a) => a.country)).size;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Addresses" value={total} />
        <SummaryCard label="Default Shipping" value={defaultShipping} />
        <SummaryCard label="Default Billing" value={defaultBilling} />
        <SummaryCard label="Countries" value={countries} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search addresses..."
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading addresses...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No addresses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Label</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Country</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Region</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">City</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Default</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.label ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.country}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.region}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.city}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {a.is_default ? "Default" : a.is_default_shipping ? "Shipping" : a.is_default_billing ? "Billing" : "No"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        <button type="button" className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">View</button>
                        <button type="button" className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-2 text-xl font-semibold text-[#111827]">{value}</p>
  </div>
);

export default AdminCustomerAddresses;
