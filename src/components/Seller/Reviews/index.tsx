"use client";

import { Star } from "lucide-react";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerReviews() {
  return (
    <SellerUnavailableModule
      title="Reviews"
      description="Read customer product reviews and publish seller responses to build trust."
      icon={Star}
      action="Seller review management is not available yet. A seller-scoped reviews API is required."
    />
  );
}
