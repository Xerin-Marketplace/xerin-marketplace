import type { Metadata } from "next";
import SellerProducts from "@/components/Seller/Products";

export const metadata: Metadata = {
 title: "Seller Products",
 description: "Manage your product listings on Xerin Mart.",
};

const SellerProductsPage = () => {
 return (
 <main>
 <SellerProducts />
 </main>
 );
};

export default SellerProductsPage;
