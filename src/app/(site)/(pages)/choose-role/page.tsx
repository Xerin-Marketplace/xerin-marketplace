import RoleChoice from "@/components/Auth/RoleChoice";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose your role",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RoleChoice />;
}
