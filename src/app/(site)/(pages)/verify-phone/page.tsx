import VerifyPhone from "@/components/Auth/VerifyPhone";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your phone",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <VerifyPhone />;
}
