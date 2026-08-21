import LogisticsCompanyApprovals from "@/components/Admin/LogisticsCompanyApprovals";
import AdminSidebar from "@/components/Admin/Layout/Sidebar";

export const metadata = { title: "Logistics Company Approvals | Xerin Admin" };

export default function Page() {
  return <AdminSidebar title="Logistics Company Approvals" breadcrumb="Admin / Logistics / Approvals"><LogisticsCompanyApprovals /></AdminSidebar>;
}
