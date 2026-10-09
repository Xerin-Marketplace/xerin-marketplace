import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
 title: "Shop Products | Xerin Marketplace",
 description:
 "Browse seller-listed products on Xerin Marketplace — protected checkout, delivery quotes and order tracking.",
 alternates: { canonical: "/shop-without-sidebar" },
};

const ShopWithoutSidebarPage = () => {
 return (
 <main>
 <ShopWithoutSidebar />
 </main>
 );
};

export default ShopWithoutSidebarPage;
