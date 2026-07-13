"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { inventoryService, type Warehouse } from "@/services/inventory.service";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const AdminInventoryWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    country: "",
    region: "",
    district: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    contact_person: "",
    phone_number: "",
    email: "",
    status: "active",
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.listWarehouses();
      setWarehouses(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWarehouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryService.createWarehouse({
        ...form,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });
      toast.success("Warehouse created.");
      setFormOpen(false);
      setForm({
        name: "",
        code: "",
        country: "",
        region: "",
        district: "",
        city: "",
        address: "",
        latitude: "",
        longitude: "",
        contact_person: "",
        phone_number: "",
        email: "",
        status: "active",
      });
      void fetchWarehouses();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#111827]">Warehouses</h2>
          <p className="text-sm text-gray-500">Manage storage locations and stock allocation</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(!formOpen)}
          className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white"
        >
          {formOpen ? "Close" : "Add Warehouse"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "name", label: "Warehouse Name", required: true },
              { key: "code", label: "Warehouse Code", required: true },
              { key: "country", label: "Country" },
              { key: "region", label: "Region" },
              { key: "district", label: "District" },
              { key: "city", label: "City" },
              { key: "address", label: "Physical Address" },
              { key: "latitude", label: "Latitude" },
              { key: "longitude", label: "Longitude" },
              { key: "contact_person", label: "Contact Person" },
              { key: "phone_number", label: "Phone Number" },
              { key: "email", label: "Email" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
                  required={field.required}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              Save Warehouse
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading warehouses...</div>
        ) : warehouses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No warehouses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Code</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Location</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{warehouse.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{warehouse.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {[warehouse.city, warehouse.region, warehouse.country].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{warehouse.contact_person ?? warehouse.phone_number ?? "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${warehouse.status === "active" ? "bg-[#d9f4e1] text-[#165c30]" : "bg-gray-100 text-gray-600"}`}>
                        {warehouse.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/admin/inventory/warehouses/${warehouse.id}`} className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                        View
                      </Link>
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

export default AdminInventoryWarehouses;
