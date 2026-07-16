import AdminFinance from "@/components/Admin/Finance";
import AdminSidebar from "@/components/Admin/Layout/Sidebar";

export default function AdminFinancePage() {
  return (
    <AdminSidebar title="Financial Management" breadcrumb="Admin / Payments / Transactions">
      <AdminFinance />
    </AdminSidebar>
  );
}
