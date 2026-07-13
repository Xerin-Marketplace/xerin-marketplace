"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { inventoryService, type Warehouse, type InventoryItem, type StockMovement } from "@/services/inventory.service";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const AdminWarehouseDetails = ({ warehouseId }: { warehouseId: string }) => {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getWarehouse(warehouseId);
      setWarehouse(data.warehouse as Warehouse);
      setInventory(data.inventory as InventoryItem[]);
      setLowStock(data.low_stock as InventoryItem[]);
      setMovements(data.movements as StockMovement[]);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [warehouseId]);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#111827]">{warehouse?.name ?? "Warehouse"}</h2>
        <p className="text-sm text-gray-500">{warehouse?.code ?? ""} — {warehouse ? [warehouse.city, warehouse.region, warehouse.country].filter(Boolean).join(", ") : "-"}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Stock by Product</h3>
        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : inventory.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No stock in this warehouse.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">On Hand</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Reserved</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Available</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                      <Link href={`/admin/inventory/products/${item.product_id}`} className="hover:underline">
                        {item.product?.name ?? "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.product?.sku ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.on_hand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.reserved}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{item.available}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Low Stock Items</h3>
        {lowStock.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No low stock items.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Available</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStock.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{item.product?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.available}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Recent Movements</h3>
        {movements.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No movements.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Reference</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">In</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Out</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(m.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.movement_type.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.reference ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.quantity_in ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.quantity_out ?? "-"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.balance_after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link href="/admin/inventory/warehouses" className="text-sm font-medium text-[#1e40af] hover:underline">
          ← Back to Warehouses
        </Link>
      </div>
    </div>
  );
};

export default AdminWarehouseDetails;
