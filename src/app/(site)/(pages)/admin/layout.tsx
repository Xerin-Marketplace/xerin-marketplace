import { noindexMetadata } from "@/lib/seo";

export const metadata = { ...noindexMetadata };

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
