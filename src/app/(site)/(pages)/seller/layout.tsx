import SellerLayout from "@/components/Seller/Layout/SellerLayout";
import { noindexMetadata } from "@/lib/seo";
export const metadata = { ...noindexMetadata };

export default function SellerRouteLayout({ children }: { children: React.ReactNode }) {
 return <SellerLayout>{children}</SellerLayout>;
}
