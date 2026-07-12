import { Metadata } from "next";
import MyAccountClient from "./MyAccountClient";

export const metadata: Metadata = {
  title: "My Account | Xerin Market",
  description: "Manage your Xerin Market profile, orders, addresses, and account settings.",
};

const MyAccountPage = () => {
  return (
    <main>
      <MyAccountClient />
    </main>
  );
};

export default MyAccountPage;
