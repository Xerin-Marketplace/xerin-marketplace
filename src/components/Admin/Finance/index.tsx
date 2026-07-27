"use client";

import AdminPayments from "@/components/Admin/Payments";
import UnavailableFeature from "@/components/Admin/Common/UnavailableFeature";

export default function AdminFinance() {
  return (
    <div className="space-y-5">
      <UnavailableFeature
        title="Finance summary is not available yet"
        description="Gross revenue, commission, seller earnings, reconciliation and payout totals require backend finance-summary and ledger endpoints. Payment transactions below are loaded from the existing payments API."
      />
      <AdminPayments view="transactions" />
    </div>
  );
}
