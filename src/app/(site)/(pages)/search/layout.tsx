import type { Metadata } from "next";
import type { ReactNode } from "react";
import { noindexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Search",
  description: "Search products, brands and categories on Xerin Marketplace.",
  robots: noindexMetadata.robots,
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
