import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "Product Details",
 description: "View product details, seller information, pricing, and delivery options on Xerin Marketplace.",
 // other metadata
};

const ShopDetailsPage = () => {
 redirect("/shop-with-sidebar");
};

export default ShopDetailsPage;
