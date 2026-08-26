import AdminBrokerPayouts from "@/components/Admin/BrokerPayouts";
import AdminSidebar from "@/components/Admin/Layout/Sidebar";

export default function Page() {
  return (
    <AdminSidebar
      title="Broker Wallet Payouts"
      breadcrumb="Admin / Brokers / Wallet Payouts"
    >
      <AdminBrokerPayouts />
    </AdminSidebar>
  );
}
