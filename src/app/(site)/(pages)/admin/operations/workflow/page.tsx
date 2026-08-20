import AdminSidebar from "@/components/Admin/Layout/Sidebar";
import OperationsCommandCenter from "@/components/Admin/OperationsCommandCenter";
export const metadata = { title: "Operations Command Center | Xerin Admin" };
export default function Page() { return <AdminSidebar title="Operations Command Center" breadcrumb="Operations / Exceptions"><OperationsCommandCenter /></AdminSidebar>; }
