import { Metadata } from "next";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
 robots: { index: false, follow: false },
 title: "My Account",
 description: "Manage your Xerin Marketplace profile, orders, addresses, and account settings.",
};

const MyAccountPage = () => {
 redirect("/account");
};

export default MyAccountPage;
