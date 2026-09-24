import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";

export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Shopping Cart",
 description: "Review your selected products before checkout on Xerin Market.",
 // other metadata
};

const CartPage = () => {
 return (
 <>
 <Cart />
 </>
 );
};

export default CartPage;
