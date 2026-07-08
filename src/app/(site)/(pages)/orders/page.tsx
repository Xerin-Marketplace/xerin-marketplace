"use client";

import Orders from "@/components/Orders";
import RouteGuard from "@/guards/RouteGuard";

export default function OrdersPage() {
  return (
    <RouteGuard permission="view_orders">
      <Orders />
    </RouteGuard>
  );
}
