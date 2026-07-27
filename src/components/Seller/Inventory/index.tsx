"use client";

import { sellerInventoryApi, type SellerInventory } from "@/lib/api/endpoints/seller-inventory";
import { productsApi } from "@/lib/api/endpoints/products";
import type { Product } from "@/types/api/product";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function SellerInventoryPage() {
  const [rows, setRows] = useState<SellerInventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const names = useMemo(() => new Map(products.map((product) => [String(product.id), product.name])), [products]);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [inventory, productRows] = await Promise.all([
        sellerInventoryApi.list(),
        productsApi.getMyProducts({ skip: 0, limit: 100 }),
      ]);
      setRows(inventory); setProducts(productRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load seller inventory.");
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const update = async (row: SellerInventory, quantity: number, threshold: number) => {
    setBusy(row.id);
    try {
      await sellerInventoryApi.update(row.id, { quantity, low_stock_threshold: threshold });
      toast.success("Inventory updated."); await load();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Inventory update failed."); }
    finally { setBusy(""); }
  };

  return <div className="mx-auto max-w-[1280px] space-y-6"><div><h2 className="text-2xl font-semibold">Inventory</h2><p className="mt-1 text-sm text-[#64748b]">Live seller-owned stock records from the inventory service.</p></div><section className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">{loading?<p className="p-12 text-center text-[#64748b]">Loading inventory...</p>:error?<div className="p-12 text-center text-red-600"><p>{error}</p><button onClick={()=>void load()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">Retry</button></div>:rows.length===0?<div className="p-12 text-center"><p className="font-semibold">No inventory records yet.</p><p className="mt-1 text-sm text-[#64748b]">Inventory appears after a stock record is created for one of your products.</p></div>:<div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-[#64748b] dark:bg-white/5"><tr>{["Product","Quantity","Reserved","Available","Low-stock threshold","Location","Updated",""].map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#e2e8f0] dark:divide-white/10">{rows.map(row=><InventoryRow key={row.id} row={row} name={names.get(String(row.product_id))??`Product ${String(row.product_id).slice(0,8)}`} busy={busy===row.id} save={update}/>)}</tbody></table></div>}</section></div>;
}

function InventoryRow({row,name,busy,save}:{row:SellerInventory;name:string;busy:boolean;save:(row:SellerInventory,quantity:number,threshold:number)=>void}) {
  const [quantity,setQuantity]=useState(row.quantity); const [threshold,setThreshold]=useState(row.low_stock_threshold);
  return <tr><td className="px-5 py-4 font-semibold">{name}</td><td className="px-5 py-4"><input type="number" min={0} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="w-24 rounded-lg border px-2 py-1.5 dark:bg-white/5"/></td><td className="px-5 py-4">{row.reserved_quantity}</td><td className="px-5 py-4">{row.available_quantity}</td><td className="px-5 py-4"><input type="number" min={0} value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="w-24 rounded-lg border px-2 py-1.5 dark:bg-white/5"/></td><td className="px-5 py-4">{row.warehouse_location??"—"}</td><td className="px-5 py-4">{row.updated_at?new Date(row.updated_at).toLocaleString():"—"}</td><td className="px-5 py-4"><button disabled={busy} onClick={()=>save(row,quantity,threshold)} className="font-semibold text-[#f7941d] disabled:opacity-50">{busy?"Saving...":"Save"}</button></td></tr>;
}
