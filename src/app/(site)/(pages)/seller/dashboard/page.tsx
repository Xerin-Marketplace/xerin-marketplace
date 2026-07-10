import type { Metadata } from "next";
import SellerDashboard from "@/components/Seller/Dashboard";

export const metadata: Metadata = {
  title: "Seller Dashboard | Xerin Market",
  description: "Manage onboarding, KYC, and products from your seller dashboard.",
};

const SellerDashboardPage = () => {
  return (
    <main>
      <SellerDashboard />
    </main>
  );
};

export default SellerDashboardPage;
