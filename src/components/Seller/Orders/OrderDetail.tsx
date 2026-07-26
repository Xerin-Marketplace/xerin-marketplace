"use client";

import { FileText } from "lucide-react";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerOrderDetail({ orderId }: { orderId: string }) {
  return (
    <SellerUnavailableModule
      title={`Order ${orderId}`}
      description="View order details, update fulfilment status and manage tracking from the seller order detail page."
      icon={FileText}
      action="Seller order details are not available yet. A seller-scoped order API is required."
      backHref="/seller/orders"
      backLabel="Back to orders"
    />
  );
}
