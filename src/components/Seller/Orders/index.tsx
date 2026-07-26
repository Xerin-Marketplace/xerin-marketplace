"use client";

import { ClipboardList } from "lucide-react";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerOrders() {
  return (
    <SellerUnavailableModule
      title="Seller Orders"
      description="Accept, process, pack and ship customer orders from a single seller-scoped view."
      icon={ClipboardList}
      action="Seller order management is not available yet. A seller-scoped orders API is required before order actions can be enabled."
    />
  );
}
