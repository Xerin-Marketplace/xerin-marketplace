"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import RouteGuard from "@/guards/RouteGuard";
import {
 isAdminUser,
 isBrokerUser,
 isLogisticsUser,
 isSellerUser,
} from "@/guards/permissions";
import { useAuthStore } from "@/store/useAuthStore";

function DashboardRedirect() {
 const router = useRouter();
 const user = useAuthStore((state) => state.user);
 const hasHydrated = useAuthStore((state) => state.hasHydrated);

 useEffect(() => {
 if (!hasHydrated || !user) return;

 if (isAdminUser(user)) {
 router.replace("/admin/dashboard");
 return;
 }

 if (isLogisticsUser(user)) {
 router.replace("/logistics/dashboard");
 return;
 }

 if (isSellerUser(user)) {
 router.replace("/seller/dashboard");
 return;
 }

 if (isBrokerUser(user)) {
 router.replace("/broker/dashboard");
 return;
 }

 router.replace("/account");
 }, [hasHydrated, router, user]);

 return (
 <div className="flex min-h-[50vh] items-center justify-center px-6">
 <div className="text-center">
 <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-orange-500" />
 <p className="mt-4 text-sm text-muted-foreground">
 Opening your Xerin dashboard...
 </p>
 </div>
 </div>
 );
}

export default function DashboardClient() {
 return (
 <RouteGuard>
 <DashboardRedirect />
 </RouteGuard>
 );
}
