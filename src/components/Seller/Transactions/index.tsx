"use client";

import { CreditCard } from "lucide-react";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerTransactions() {
  return (
    <SellerUnavailableModule
      title="Transactions"
      description="View order payments, refunds, commissions, payouts and settlement transactions."
      icon={CreditCard}
      action="Seller transactions are not available yet. A seller transaction and payout-history API is required."
    />
  );
}
