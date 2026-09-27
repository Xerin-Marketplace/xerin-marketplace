import PolicyPage from "@/components/Policies/PolicyPage";
import { marketplacePolicies } from "@/content/marketplacePolicies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy",
  description: marketplacePolicies.returnsRefunds.summary,
};

export default function ReturnsRefundsPage() {
  return <PolicyPage policy={marketplacePolicies.returnsRefunds} />;
}
