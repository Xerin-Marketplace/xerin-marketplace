import type { Metadata } from "next";
import SellerInventory from "@/components/Seller/Inventory";

export const metadata: Metadata = {
  title: "Inventory | Seller Center",
  description: "Manage seller inventory, stock levels and warehouses.",
};

export default function SellerInventoryPage() {
  return (
    <main>
      <SellerInventory />
    </main>
  );
}
