"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerCancellations() {
 return (
 <SellerUnavailableModule
 title="Cancellations"
 description="Review cancellation requests, approve seller-side cancellations and protect inventory."
 icon={Cancel01Icon}
 action="Cancellation management is not available yet. A seller cancellations API is required."
 />
 );
}
