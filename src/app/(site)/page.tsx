import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "Xerin Marketplace | Shop Products Online in Africa",
 description:
 "Shop quality products from verified sellers on Xerin Marketplace. Protected checkout, delivery quotes, order tracking and seller stores across Africa.",
 alternates: { canonical: "/" },
};

export default function HomePage() {
 return (
 <>
 <Home />
 </>
 );
}
