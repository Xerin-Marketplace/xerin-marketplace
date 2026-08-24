import type { Metadata } from "next";
import RouteGuard from "@/guards/RouteGuard";
import SellerStoreSettings from "@/components/Seller/Store/StoreSettings";

export const metadata: Metadata = {
  title: "My Stores | Seller Center",
  description: "Manage your Xerin Market selling locations.",
};

export default function SellerStorePage() {
  return (
    <RouteGuard accountTypes={["seller"]} fallbackPath="/account">
      <SellerStoreSettings />
    </RouteGuard>
  );
}
