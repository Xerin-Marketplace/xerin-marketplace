import AdminSidebar from "@/components/Admin/Layout/Sidebar";
import EndToEndQa from "@/components/Admin/EndToEndQa";
import ReliabilityReadiness from "@/components/Admin/ReliabilityReadiness";
export const metadata = { title: "End-to-End QA | Xerin Admin" };
export default function Page() { return <AdminSidebar title="End-to-End QA" breadcrumb="Production Readiness / QA"><><EndToEndQa /><ReliabilityReadiness /></></AdminSidebar>; }
