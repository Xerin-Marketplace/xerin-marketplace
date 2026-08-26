import AdminBrokerSecurity from "@/components/Admin/BrokerSecurity";
import AdminSidebar from "@/components/Admin/Layout/Sidebar";

export default function Page() {
  return (
    <AdminSidebar
      title="Broker Security & Risk"
      breadcrumb="Admin / Brokers / Security & Risk"
    >
      <AdminBrokerSecurity />
    </AdminSidebar>
  );
}
