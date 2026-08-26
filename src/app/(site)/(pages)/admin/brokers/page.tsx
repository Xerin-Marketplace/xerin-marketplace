import AdminBrokers from "@/components/Admin/Brokers";
import AdminSidebar from "@/components/Admin/Layout/Sidebar";

export default function Page() {
  return (
    <AdminSidebar
      title="Brokers & KYC Review"
      breadcrumb="Admin / Brokers / KYC Review"
    >
      <AdminBrokers />
    </AdminSidebar>
  );
}
