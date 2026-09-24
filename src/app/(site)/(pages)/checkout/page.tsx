import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";

export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Checkout",
 description: "Complete your order securely with delivery and payment options on Xerin Market.",
 // other metadata
};

const CheckoutPage = () => {
 return (
 <main>
 <Checkout />
 </main>
 );
};

export default CheckoutPage;
