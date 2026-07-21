"use client";
import Image from "next/image";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type AdminTab =
  | "overview"
  | "users"
  | "sellers"
  | "products"
  | "categories"
  | "brands"
  | "reviews"
  | "orders"
  | "inventory"
  | "finance"
  | "analytics";

export type SidebarGroup = {
  title: string;
  key: AdminTab | string;
  items: { label: string; href: string }[];
  icon: string;
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Catalog",
    key: "products",
    icon: "📦",
    items: [
      { label: "Products", href: "/admin/dashboard?tab=products&menu=catalog&item=products" },
      { label: "Categories", href: "/admin/dashboard?tab=categories&menu=catalog&item=categories" },
      { label: "Brands", href: "/admin/dashboard?tab=brands&menu=catalog&item=brands" },
      { label: "Product Reviews", href: "/admin/dashboard?tab=reviews&menu=catalog&item=product-reviews" },
    ],
  },
  {
    title: "Orders",
    key: "orders",
    icon: "🧾",
    items: [
      { label: "All Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=all-orders&orders_tab=all" },
      { label: "Pending Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=pending-orders&orders_tab=pending" },
      { label: "Processing Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=processing-orders&orders_tab=processing" },
      { label: "Completed Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=completed-orders&orders_tab=completed" },
      { label: "Cancelled Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=cancelled-orders&orders_tab=cancelled" },
      { label: "Order Tracking", href: "/admin/dashboard?tab=orders&menu=orders&item=order-tracking&orders_tab=tracking" },
    ],
  },
  {
    title: "Inventory",
    key: "inventory",
    icon: "📚",
    items: [
      { label: "Stock Overview", href: "/admin/dashboard?tab=inventory&menu=inventory&item=stock-overview&inventory_tab=stock-overview" },
      { label: "Warehouses", href: "/admin/dashboard?tab=inventory&menu=inventory&item=warehouses&inventory_tab=warehouses" },
      { label: "Stock Adjustments", href: "/admin/dashboard?tab=inventory&menu=inventory&item=stock-adjustments&inventory_tab=stock-adjustments" },
      { label: "Low Stock Products", href: "/admin/dashboard?tab=inventory&menu=inventory&item=low-stock-products&inventory_tab=low-stock-products" },
    ],
  },
  {
    title: "Customers",
    key: "users",
    icon: "👥",
    items: [
      { label: "All Customers", href: "/admin/customers" },
      { label: "Customer Addresses", href: "/admin/customers/addresses" },
      { label: "Customer Reviews", href: "/admin/customers/reviews" },
      { label: "Customer Support", href: "/admin/customers/support" },
    ],
  },
  {
    title: "Sellers",
    key: "sellers",
    icon: "🏪",
    items: [
      { label: "All Sellers", href: "/admin/dashboard?tab=sellers&menu=sellers&item=all-sellers" },
      { label: "Seller Applications", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-applications" },
      { label: "Seller Products", href: "/admin/dashboard?tab=products&menu=sellers&item=seller-products" },
      { label: "Seller Orders", href: "/admin/dashboard?tab=orders&menu=sellers&item=seller-orders&orders_tab=all" },
      { label: "Seller Performance", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-performance" },
    ],
  },
  {
    title: "Payments",
    key: "finance",
    icon: "💳",
    items: [
      { label: "Transactions", href: "/admin/finance" },
      { label: "Payment Methods", href: "/admin/finance?tab=methods" },
      { label: "Refunds", href: "/admin/finance?tab=refunds" },
      { label: "Failed Payments", href: "/admin/finance?tab=failed" },
    ],
  },
  {
    title: "Promotions",
    key: "products",
    icon: "🏷️",
    items: [
      { label: "Coupons", href: "/admin/dashboard?tab=products&menu=promotions&item=coupons" },
      { label: "Discounts", href: "/admin/dashboard?tab=products&menu=promotions&item=discounts" },
      { label: "Campaigns", href: "/admin/dashboard?tab=products&menu=promotions&item=campaigns" },
    ],
  },
  {
    title: "Disputes",
    key: "orders",
    icon: "⚖️",
    items: [
      { label: "All Disputes", href: "/admin/disputes" },
      { label: "Open Disputes", href: "/admin/disputes?status=open" },
      { label: "Resolved Disputes", href: "/admin/disputes?status=resolved" },
    ],
  },
  {
    title: "Analytics",
    key: "analytics",
    icon: "📊",
    items: [
      { label: "Sales Reports", href: "/admin/analytics?report=sales" },
      { label: "Order Reports", href: "/admin/analytics?report=orders" },
      { label: "Product Reports", href: "/admin/analytics?report=products" },
      { label: "Customer Reports", href: "/admin/analytics?report=customers" },
    ],
  },
  {
    title: "Communications",
    key: "overview",
    icon: "📣",
    items: [
      { label: "Notifications", href: "/admin/dashboard?tab=overview&menu=communications&item=notifications" },
      { label: "Email Messages", href: "/admin/dashboard?tab=overview&menu=communications&item=email-messages" },
      { label: "SMS Messages", href: "/admin/dashboard?tab=overview&menu=communications&item=sms-messages" },
    ],
  },
  {
    title: "System Management",
    key: "overview",
    icon: "⚙️",
    items: [
      { label: "Audit Logs", href: "/admin/dashboard?tab=overview&menu=system-management&item=audit-logs" },
      { label: "System Events", href: "/admin/dashboard?tab=overview&menu=system-management&item=system-events" },
      { label: "Background Jobs", href: "/admin/dashboard?tab=overview&menu=system-management&item=background-jobs" },
      { label: "Application Settings", href: "/admin/dashboard?tab=overview&menu=system-management&item=application-settings" },
    ],
  },
  {
    title: "Account",
    key: "overview",
    icon: "👤",
    items: [
      { label: "Profile", href: "/my-account" },
      { label: "Security", href: "/my-account?tab=security" },
      { label: "Logout", href: "/signout" },
    ],
  },
];

function DashboardIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M3 3h6v6H3V3Zm8 0h6v6h-6V3ZM3 11h6v6H3v-6Zm8 0h6v6h-6v-6Z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 0 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
    </svg>
  );
}

export default function AdminSidebar({
  children,
  title = "Dashboard Overview",
  breadcrumb,
}: {
  children: ReactNode;
  title?: string;
  breadcrumb?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const isDashboard = pathname === "/admin/dashboard";
  const isGroupActive = (group: SidebarGroup) =>
    group.items.some((item) => {
      const itemUrl = new URL(item.href, "http://localhost");
      return itemUrl.pathname === pathname;
    });

  return (
    <section className="min-h-screen bg-[#f3f7fb] py-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
          <aside className="xl:sticky xl:top-6 h-fit rounded-2xl bg-gradient-to-b from-[#4b5563] to-[#1f2937] p-4 text-white shadow-xl">
            <div className="px-3 py-2 border-b border-white/15">
              <Image
                src="/images/logo/logo.png"
                alt="Xerin Marketplace logo"
                width={150}
                height={46}
                className="h-10 w-auto object-contain"
                priority
              />
              <h2 className="text-xl font-semibold mt-1">Admin Panel</h2>
            </div>

            <div className="mt-4">
              <Link
                href="/admin/dashboard"
                className={`block w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                  isDashboard ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
                }`}
              >
                <span className="inline-flex items-center gap-2.5 text-sm font-semibold">
                  <span className="inline-flex h-5 w-5 items-center justify-center shrink-0">
                    <DashboardIcon />
                  </span>
                  Dashboard
                </span>
              </Link>
            </div>

            <nav className="mt-4 space-y-1.5">
              {sidebarGroups.map((group) => {
                const open = isGroupActive(group);

                return (
                  <div key={group.title} className="px-1">
                    <div className="w-full text-left rounded-lg px-2.5 py-2 text-[13px] font-semibold tracking-[0.08em] uppercase text-white/85">
                      <span className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="inline-flex h-5 w-5 items-center justify-center text-base leading-none shrink-0" aria-hidden="true">
                            {group.icon}
                          </span>
                          <span>{group.title}</span>
                        </span>
                        <ChevronIcon open={open} />
                      </span>
                    </div>

                    <div className="mt-1 border-l border-white/15 pl-3 space-y-1">
                      {group.items.map((item) => {
                        const itemUrl = new URL(item.href, "http://localhost");
                        const active = itemUrl.pathname === pathname;

                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                              active ? "text-white font-semibold" : "text-white/80 hover:text-white"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-white/60"}`} />
                              <span>{item.label}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </aside>

          <main className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#111827]">{title}</h1>
                  {breadcrumb ? <p className="text-sm text-gray-500 mt-1">{breadcrumb}</p> : null}
                </div>
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
