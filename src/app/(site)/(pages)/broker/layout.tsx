"use client";

import { usePathname } from "next/navigation";
import BrokerLayout from "@/components/Broker/Layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/broker/register") {
    return <>{children}</>;
  }

  return <BrokerLayout>{children}</BrokerLayout>;
}
