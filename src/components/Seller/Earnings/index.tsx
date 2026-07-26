"use client";

import { BarChart3 } from "lucide-react";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerEarnings() {
  return (
    <SellerUnavailableModule
      title="Earnings"
      description="Track gross sales, commissions, net earnings, pending and available balances, and settlement history."
      icon={BarChart3}
      action="Seller earnings are not available yet. A seller finance API is required before earnings data can be shown."
    />
  );
}
