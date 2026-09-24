import { noindexMetadata } from "@/lib/seo";

export const metadata = { ...noindexMetadata };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
