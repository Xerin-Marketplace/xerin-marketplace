import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xerin Market | Africa's Premier E-Commerce Marketplace",
  description:
    "Shop from trusted sellers across Africa with secure payments, fast delivery, and Xerin Logistics order tracking.",
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
