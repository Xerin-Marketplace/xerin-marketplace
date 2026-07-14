"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { inventoryService, type InventoryItem, type StockMovement } from "@/lib/api/endpoints/inventory";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const AdminProductInventoryDetails = ({ productId }: { productId: string }) => {
  const [product, setProduct] = useState<unknown>(null);
  const [totals, setTotals] = useState<Record<string, number> | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getProductInventory(productId);
      setProduct(data.product);
      setTotals(data.totals as Record<string, number>);
      setInventory(data.inventory);
      setMovements(data.movements);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [productId]);

  const productName = (product as { name?: string })?.name ?? "Product Inventory";

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#111827]">{productName}</h2>
        <p className="text-sm text-gray-500">Inventory details by warehouse and recent movements</p>
      </div>

      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryCard label="On Hand" value={totals.on_hand} />
          <SummaryCard label="Reserved" value={totals.reserved} />
          <SummaryCard label="Available" value={totals.available} />
          <SummaryCard label="Incoming" value={totals.incoming} />
          <SummaryCard label="Damaged" value={totals.damaged} />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Stock by Warehouse</h3>
        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : inventory.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No stock records for this product.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Warehouse</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">On Hand</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Reserved</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Available</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Incoming</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{item.warehouse?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.on_hand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.reserved}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{item.available}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.incoming}</td>
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
        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : movements.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No movements recorded.</div>
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
        <Link href="/admin/inventory" className="text-sm font-medium text-[#1e40af] hover:underline">
          ← Back to Stock Overview
        </Link>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
  </div>
);

export default AdminProductInventoryDetails;
