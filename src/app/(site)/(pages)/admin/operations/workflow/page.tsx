import AdminSidebar from "@/components/Admin/Layout/Sidebar";
import MarketplaceFinanceFlow from "@/components/Admin/MarketplaceFinanceFlow";
export const metadata = { title: "Marketplace Financial Flow | Xerin Admin" };
export default function Page() { return <AdminSidebar title="Marketplace Financial Flow" breadcrumb="Operations / Finance"><MarketplaceFinanceFlow /></AdminSidebar>; }
