import type { Metadata } from "next";
import BrokerProfile from "@/components/Broker/Profile";

export const metadata: Metadata = {
  title: "Profile | Broker Center",
};

export default function Page() {
  return <BrokerProfile />;
}
