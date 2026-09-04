"use client";

import RouteGuard from "@/guards/RouteGuard";
import Image from "next/image";
import { authCookies } from "@/lib/auth/cookies";
import { authStorage } from "@/lib/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Bell,
  Boxes,
  BadgeCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  MapPin,
  PackageCheck,
  Settings,
  Truck,
  Users,
  WalletCards,
  Webhook,
  ListChecks,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LogisticsNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
};

const nav: LogisticsNavItem[] = [
  {
    label: "Setup checklist",
    href: "/logistics/onboarding",
    icon: ListChecks,
  },
  {
    label: "Dashboard",
    href: "/logistics/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Shipments",
    href: "/logistics/shipments",
    icon: Truck,
  },
  {
    label: "Pickup jobs",
    href: "/logistics/pickups",
    icon: PackageCheck,
  },
  {
    label: "Delivery verification",
    href: "/logistics/delivery-verification",
    icon: BadgeCheck,
  },
  {
    label: "Notifications",
    href: "/logistics/notifications",
    icon: Bell,
  },
  {
    label: "Delivery addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Zones & rates",
    href: "/logistics/pricing",
    icon: Boxes,
  },
  {
    label: "Team",
    href: "/logistics/team",
    icon: Users,
  },
  {
    label: "Wallet",
    href: "/logistics/wallet",
    icon: WalletCards,
  },
  {
    label: "Integration",
    href: "/logistics/integration",
    icon: Webhook,
  },
  {
    label: "Company settings",
    href: "/logistics/settings",
    icon: Settings,
  },
];

function Workspace({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const title =
    nav.find((item) => pathname.startsWith(item.href))?.label ??
    "Logistics workspace";

  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Team member";

  const signOut = () => {
    authStorage.clearSession();
    authCookies.clearAll();
    useAuthStore.getState().clearSession();

    router.replace("/signin");
  };

  const sidebar = (
    <div
      className="
        flex h-full flex-col
        border-r border-slate-200/80
        bg-white/90
        text-[#111111]
        shadow-[4px_0_22px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
        dark:border-white/10
        dark:bg-[#161616]/90
        dark:text-white
      "
    >
      {/* LOGO */}
      <div
        className="
          flex h-[74px] items-center justify-between
          border-b border-slate-200/80
          px-4
          dark:border-white/10
        "
      >
        <Link
          href="/"
          className="
            flex min-w-0 items-center
            rounded-xl
            px-2 py-1.5
            transition
            hover:bg-[#ff8a00]/10
          "
          aria-label="Go to Xerin Marketplace home"
          title="Go to Xerin Marketplace home"
        >
          <Image
            src="/images/logo/logo.png"
            alt="Xerin Marketplace"
            width={126}
            height={38}
            className="h-auto w-[126px] object-contain"
            priority
          />
        </Link>

        <button
          className="
            rounded-lg p-2
            text-[#111111]
            transition-colors
            hover:bg-[#ff8a00]
            hover:text-black
            lg:hidden
            dark:text-white
          "
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Logistics navigation"
      >
        {nav.map(({ label, href, icon: Icon, soon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          if (soon) {
            return (
              <div
                key={href}
                aria-disabled="true"
                className="
                  flex min-h-11 items-center gap-3
                  rounded-xl
                  px-3 py-2.5
                  text-sm
                  text-slate-400
                  dark:text-slate-600
                "
              >
                <Icon size={19} />

                <span className="flex-1">{label}</span>

                <span className="text-[10px] uppercase">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`
                group
                flex min-h-11 items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm font-medium
                transition-all duration-200

                ${
                  active
                    ? `
                      bg-[#ff8a00]
                      font-semibold
                      text-[#111111]
                      shadow-sm
                    `
                    : `
                      text-slate-700
                      hover:bg-[#ff8a00]/15
                      hover:text-[#111111]
                      dark:text-slate-200
                      dark:hover:bg-[#ff8a00]
                      dark:hover:text-[#111111]
                    `
                }
              `}
            >
              <Icon
                size={19}
                className={`
                  shrink-0 transition-colors

                  ${
                    active
                      ? "text-[#111111]"
                      : `
                        text-[#ff8a00]
                        group-hover:text-[#111111]
                      `
                  }
                `}
              />

              <span className="truncate">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* SIGN OUT */}
      <div
        className="
          border-t border-slate-200/80
          p-3
          dark:border-white/10
        "
      >
        <button
          onClick={signOut}
          className="
            group
            flex min-h-11 w-full items-center gap-3
            rounded-xl
            px-3 py-2.5
            text-sm font-medium
            text-slate-700
            transition-colors
            hover:bg-[#ff8a00]
            hover:text-[#111111]
            dark:text-slate-200
            dark:hover:text-[#111111]
          "
        >
          <LogOut
            size={19}
            className="
              text-[#ff8a00]
              transition-colors
              group-hover:text-[#111111]
            "
          />

          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="
        min-h-dvh
        bg-[#f7f7f5]
        text-[#111111]
        dark:bg-[#111111]
        dark:text-white
      "
    >
      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          fixed inset-y-0 left-0 z-40
          hidden w-64
          lg:block
        "
      >
        {sidebar}
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />

          <aside
            className="
              relative
              h-full
              w-[min(85vw,20rem)]
              shadow-2xl
            "
          >
            {sidebar}
          </aside>
        </div>
      )}

      {/* CONTENT */}
      <div className="min-h-dvh lg:pl-64">
        {/* HEADER */}
        <header
          className="
            sticky top-0 z-30
            flex min-h-[74px] items-center gap-3
            border-b border-slate-200/80
            bg-white/90
            px-3
            backdrop-blur-xl
            sm:px-5
            dark:border-white/10
            dark:bg-[#111111]/90
          "
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="
              rounded-lg
              border border-slate-200
              p-2.5
              text-[#111111]
              transition
              hover:border-[#ff8a00]
              hover:bg-[#ff8a00]
              lg:hidden
              dark:border-white/15
              dark:text-white
              dark:hover:text-black
            "
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <h1
              className="
                truncate
                text-base font-bold
                text-[#111111]
                sm:text-lg
                dark:text-white
              "
            >
              {title}
            </h1>
          </div>

          <div className="hidden min-w-0 text-right sm:block">
            <p
              className="
                max-w-48 truncate
                text-sm font-semibold
                text-[#111111]
                dark:text-white
              "
            >
              {name}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logistics team
            </p>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100dvh-4rem)] p-3 sm:p-5 xl:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LogisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard logisticsOnly fallbackPath="/account">
      <Workspace>{children}</Workspace>
    </RouteGuard>
  );
}