import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
 title: "Shop All Products | Xerin Marketplace",
 description:
 "Browse all products listed by sellers on Xerin Marketplace — filter by category, brand and price with protected checkout on every order.",
 alternates: { canonical: "/shop-with-sidebar" },
};

const ShopWithSidebarPage = () => {
 return (
 <main>
 <ShopWithSidebar />
 </main>
 );
};

export default ShopWithSidebarPage;
