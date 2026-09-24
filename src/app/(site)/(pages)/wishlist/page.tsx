import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";


export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "Wishlist",
 description: "Save products you like and view them later on Xerin Market.",
 // other metadata
};

const WishlistPage = () => {
 return (
 <main>
 <Wishlist />
 </main>
 );
};

export default WishlistPage;
