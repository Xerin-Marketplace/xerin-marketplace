import HelpCenter from "@/components/HelpCenter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | Xerin Marketplace",
  description:
    "Find answers to common questions about buying, selling, payments, deliveries and account security on Xerin Marketplace.",
};

export default function HelpPage() {
  return (
    <main>
      <HelpCenter />
    </main>
  );
}
