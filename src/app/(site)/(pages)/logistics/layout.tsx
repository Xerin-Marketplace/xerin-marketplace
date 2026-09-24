import LogisticsLayout from "@/components/Logistics/Layout/LogisticsLayout";
import { noindexMetadata } from "@/lib/seo";
export const metadata = { ...noindexMetadata };

export default function Layout({ children }: { children: React.ReactNode }) {
 return <LogisticsLayout>{children}</LogisticsLayout>;
}
