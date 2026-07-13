"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { inventoryService, type InventoryItem, type Warehouse } from "@/services/inventory.service";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const severityBadge = (available: number, threshold: number) => {
  if (available <= 0) return "bg-[#fde2e2] text-[#8f2727]";
  if (available <= threshold * 0.25) return "bg-[#fecaca] text-[#8f2727]";
  return "bg-[#fef3c7] text-[#92400e]";
};

const AdminInventoryLowStock = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, whData] = await Promise.all([
        inventoryService.listLowStock({
          severity: severity || undefined,
          warehouse_id: warehouseFilter || undefined,
        }),
        inventoryService.listWarehouses(),
      ]);
      setItems(data);
      setWarehouses(whData);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [severity, warehouseFilter]);

  const clearFilters = () => {
    setSeverity("");
    setWarehouseFilter("");
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#111827]">Low Stock Products</h2>
        <p className="text-sm text-gray-500">Products that have reached or fallen below their reorder threshold</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
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
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
          >
            <option value="">All Severities</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl bg-[#f8fafc] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading low stock products...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600 font-medium">No low stock products found.</p>
            <p className="text-sm text-gray-500">All products are currently above their reorder thresholds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Warehouse</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Available</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Reorder Level</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Severity</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                      <Link href={`/admin/inventory/products/${item.product_id}`} className="hover:underline">
                        {item.product?.name ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.product?.sku ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.warehouse?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{item.available}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.low_stock_threshold}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${severityBadge(item.available, item.low_stock_threshold)}`}>
                        {item.available <= 0 ? "Out of Stock" : item.available <= item.low_stock_threshold * 0.25 ? "Critical" : "Warning"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        <Link href={`/admin/inventory/products/${item.product_id}`} className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                          View
                        </Link>
                        <button type="button" className="rounded-lg bg-[#dbeafe] px-2.5 py-1.5 text-xs font-medium text-[#1e40af] hover:bg-[#bfdbfe]">
                          Restock
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

export default AdminInventoryLowStock;
