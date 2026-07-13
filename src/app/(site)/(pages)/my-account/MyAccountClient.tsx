"use client";

import MyAccount from "@/components/MyAccount";
import RouteGuard from "@/guards/RouteGuard";

export default function MyAccountClient() {
  return (
    <RouteGuard>
      <MyAccount />
    </RouteGuard>
  );
}
