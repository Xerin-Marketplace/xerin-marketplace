"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { inventoryService, type InventorySummary, type InventoryItem, type Warehouse } from "@/lib/api/endpoints/inventory";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(value);
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    in_stock: "bg-[#d9f4e1] text-[#165c30]",
    low_stock: "bg-[#fef3c7] text-[#92400e]",
    out_of_stock: "bg-[#fde2e2] text-[#8f2727]",
    reserved: "bg-[#dbeafe] text-[#1e40af]",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
};

const AdminInventoryDashboard = ({ initialTab = "overview" }: { initialTab?: string }) => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryData, inventoryData, warehousesData] = await Promise.all([
        inventoryService.getSummary(),
        inventoryService.listInventory({ limit: 100 }),
        inventoryService.listWarehouses(),
      ]);
      setSummary(summaryData);
      setInventory(inventoryData);
      setWarehouses(warehousesData);
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

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const data = await inventoryService.listInventory({
          search: search || undefined,
          warehouse_id: warehouseFilter || undefined,
          stock_status: stockStatusFilter || undefined,
          limit: 100,
        });
        setInventory(data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    void fetchFiltered();
  }, [search, warehouseFilter, stockStatusFilter]);

  const clearFilters = () => {
    setSearch("");
    setWarehouseFilter("");
    setStockStatusFilter("");
  };

  const filtered = inventory;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#111827]">Inventory Overview</h2>
        <p className="text-sm text-gray-500">Monitor stock levels, warehouse availability, and inventory movements</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <SummaryCard label="Total Products" value={summary.total_products} color="bg-gray-100 text-gray-700" />
          <SummaryCard label="Units On Hand" value={summary.total_on_hand} color="bg-[#dbeafe] text-[#1e40af]" />
          <SummaryCard label="Available Units" value={summary.total_available} color="bg-[#d9f4e1] text-[#165c30]" />
          <SummaryCard label="Reserved Units" value={summary.total_reserved} color="bg-[#fef3c7] text-[#92400e]" />
          <SummaryCard label="Incoming Units" value={summary.total_incoming} color="bg-[#e0e7ff] text-[#3730a3]" />
          <SummaryCard label="Low Stock" value={summary.low_stock} color="bg-[#fef3c7] text-[#92400e]" />
          <SummaryCard label="Out of Stock" value={summary.out_of_stock} color="bg-[#fde2e2] text-[#8f2727]" />
          <SummaryCard label="Inventory Value" value={formatCurrency(summary.inventory_value)} color="bg-[#d9f4e1] text-[#165c30]" />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-[#111827]">Stock Levels</h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU, or barcode"
              className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
            />
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
            >
              <option value="">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="reserved">Reserved</option>
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-[#f8fafc] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600 font-medium">No inventory records found.</p>
            <p className="text-sm text-gray-500">Try changing the filters or add stock to a warehouse.</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl bg-[#f8fafc] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Clear Filters
              </button>
              <span className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white">Add Stock</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Variant</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Warehouse</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">On Hand</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Reserved</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Available</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Incoming</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Threshold</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                      <Link href={`/admin/inventory/products/${item.product_id}`} className="hover:underline">
                        {item.product?.name ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.product?.sku ?? item.variant?.sku ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.variant?.variant_name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.warehouse?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.on_hand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.reserved}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{item.available}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.incoming}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.low_stock_threshold}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(
                        item.available <= 0 ? "out_of_stock" : item.available <= item.low_stock_threshold ? "low_stock" : "in_stock"
                      )}`}>
                        {item.available <= 0 ? "Out of Stock" : item.available <= item.low_stock_threshold ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        <Link href={`/admin/inventory/products/${item.product_id}`} className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                          View
                        </Link>
                        <button type="button" className="rounded-lg bg-[#dbeafe] px-2.5 py-1.5 text-xs font-medium text-[#1e40af] hover:bg-[#bfdbfe]">
                          Adjust
                        </button>
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

const SummaryCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
    <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-semibold ${color}`}>{value}</p>
  </div>
);

export default AdminInventoryDashboard;
