"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ORDER_TABS = [
 { href: "/admin/orders", label: "All Orders", exact: true },
 { href: "/admin/orders/pending", label: "Pending" },
 { href: "/admin/orders/processing", label: "Processing" },
 { href: "/admin/orders/completed", label: "Completed" },
 { href: "/admin/orders/cancelled", label: "Cancelled" },
 { href: "/admin/orders/tracking", label: "Tracking" },
];

const OrdersLayout = ({ children }: { children: React.ReactNode }) => {
 const pathname = usePathname();

 const isActive = (href: string, exact?: boolean) => {
 if (exact) return pathname === href;
 return pathname === href || pathname.startsWith(`${href}/`);
 };

 return (
 <div className="min-h-screen bg-muted">
 <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
 <div className="mb-6">
 <h1 className="text-2xl font-semibold text-foreground">Order Management</h1>
 <p className="text-sm text-muted-foreground">Manage customer orders, track deliveries, and process refunds</p>
 </div>

 <nav className="mb-6 flex flex-wrap gap-2 border-b border-border pb-1">
 {ORDER_TABS.map((tab) => (
 <Link
 key={tab.href}
 href={tab.href}
 className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
 isActive(tab.href, tab.exact)
 ? "border-b-2 border-[var(--muted-foreground)] text-muted-foreground"
 : "text-muted-foreground hover:text-muted-foreground"
 }`}
 >
 {tab.label}
 </Link>
 ))}
 </nav>

 {children}
 </div>
 </div>
 );
};

export default OrdersLayout;
