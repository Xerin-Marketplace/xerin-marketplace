"use client";

import { useParams } from "next/navigation";
import OrderDetail from "@/components/BuyerAccount/OrderDetail";

export default function Page() {
  const { orderId } = useParams<{ orderId: string }>();
  return <OrderDetail key={orderId} />;
}
