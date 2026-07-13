"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { inventoryService, type StockAdjustment, type Warehouse } from "@/services/inventory.service";
import { adminService, type AdminProduct } from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const ADJUSTMENT_TYPES = [
  { value: "stock_in", label: "Stock In" },
  { value: "stock_out", label: "Stock Out" },
  { value: "correction", label: "Correction" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "lost", label: "Lost" },
  { value: "returned", label: "Returned" },
  { value: "restock", label: "Restock" },
  { value: "physical_count", label: "Physical Count" },
];

const AdminInventoryAdjustments = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    variant_id: "",
    warehouse_id: "",
    adjustment_type: "stock_in",
    adjustment_quantity: 0,
    unit_cost: "",
    reason: "",
    reference_number: "",
  });

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const [adjData, whData, prodData] = await Promise.all([
        inventoryService.listAdjustments(),
        inventoryService.listWarehouses(),
        adminService.listAllProducts({ page_size: 100 }),
      ]);
      setAdjustments(adjData);
      setWarehouses(whData);
      setProducts(prodData.results);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAdjustments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryService.createAdjustment({
        ...form,
        unit_cost: form.unit_cost ? Number(form.unit_cost) : undefined,
      });
      toast.success("Stock adjustment created.");
      setFormOpen(false);
      setForm({
        product_id: "",
        variant_id: "",
        warehouse_id: "",
        adjustment_type: "stock_in",
        adjustment_quantity: 0,
        unit_cost: "",
        reason: "",
        reference_number: "",
      });
      void fetchAdjustments();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#111827]">Stock Adjustments</h2>
          <p className="text-sm text-gray-500">Adjust stock after counts, damage, returns, or restocking</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(!formOpen)}
          className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white"
        >
          {formOpen ? "Close" : "Create Adjustment"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Warehouse</label>
              <select
                value={form.warehouse_id}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouse_id: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
                required
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value, variant_id: "" }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
              <select
                value={form.adjustment_type}
                onChange={(e) => setForm((prev) => ({ ...prev, adjustment_type: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
                required
              >
                {ADJUSTMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adjustment Quantity</label>
              <input
                type="number"
                min={0}
                value={form.adjustment_quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, adjustment_quantity: Number(e.target.value) }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Cost</label>
              <input
                type="number"
                value={form.unit_cost}
                onChange={(e) => setForm((prev) => ({ ...prev, unit_cost: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference Number</label>
              <input
                type="text"
                value={form.reference_number}
                onChange={(e) => setForm((prev) => ({ ...prev, reference_number: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
                rows={3}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              Save Adjustment
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading adjustments...</div>
        ) : adjustments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No stock adjustments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Adjustment No.</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Previous</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Adjustment</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">New</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Reason</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{adj.adjustment_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(adj.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{adj.adjustment_type.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{adj.previous_quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{adj.adjustment_quantity}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{adj.new_quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{adj.reason}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${adj.status === "applied" ? "bg-[#d9f4e1] text-[#165c30]" : adj.status === "approved" ? "bg-[#dbeafe] text-[#1e40af]" : "bg-[#fef3c7] text-[#92400e]"}`}>
                        {adj.status}
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
  );
};

export default AdminInventoryAdjustments;
