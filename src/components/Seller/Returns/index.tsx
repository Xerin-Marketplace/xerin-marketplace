"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { RotateLeft01Icon } from "@hugeicons/core-free-icons";
import SellerUnavailableModule from "@/components/Seller/shared/SellerUnavailableModule";

export default function SellerReturns() {
 return (
 <SellerUnavailableModule
 title="Returns"
 description="Review and process customer return requests, issue refunds and manage return logistics."
 icon={RotateLeft01Icon}
 action="Return management is not available yet. A seller returns workflow API is required."
 />
 );
}
