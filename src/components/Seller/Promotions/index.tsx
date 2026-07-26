"use client";

import { Tag } from "lucide-react";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerPromotions() {
  return (
    <SellerUnavailableModule
      title="Promotions"
      description="Create and manage seller promotions, discounts and campaigns for your storefront."
      icon={Tag}
      action="Seller promotions are not available yet. A seller-scoped promotions API is required."
    />
  );
}
