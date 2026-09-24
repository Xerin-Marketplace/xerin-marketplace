import { noindexMetadata } from "@/lib/seo";

export const metadata = { ...noindexMetadata };

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
