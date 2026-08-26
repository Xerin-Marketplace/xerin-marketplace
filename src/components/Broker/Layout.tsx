"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BadgeDollarSign,
  Home,
  LogOut,
  Package,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/broker/dashboard", label: "Dashboard", icon: Home },
  { href: "/broker/kyc", label: "KYC Verification", icon: ShieldCheck },
  { href: "/broker/products", label: "Own Products", icon: Package },
  { href: "/broker/opportunities", label: "Opportunities", icon: BadgeDollarSign },
  { href: "/broker/earnings", label: "Earnings", icon: WalletCards },
  { href: "/broker/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/broker/wallet", label: "Wallet & Payouts", icon: WalletCards },
] as const;

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col border-r border-[#e7ebf0] bg-white shadow-[8px_0_30px_rgba(15,23,42,0.035)] lg:flex">
        <div className="flex h-[78px] items-center border-b border-[#e7ebf0] px-5">
          <Link href="/" className="group block" aria-label="Return to Xerin Marketplace home">
            <Image
              src="/images/logo/logo.png"
              alt="Xerin Marketplace"
              width={150}
              height={46}
              className="h-10 w-auto object-contain transition group-hover:opacity-80"
              priority
            />
            <p className="mt-1 text-xs font-semibold text-[#f97316]">Broker Center</p>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
            Broker workspace
          </p>
          {navItems.map((item) => {
            const active =
              item.href === "/broker/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-[#fff2e8] text-[#f97316]"
                    : "text-[#111827] hover:bg-[#f8fafc] hover:text-[#f97316]"
                }`}
              >
                <Icon size={19} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#e7ebf0] p-3">
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#111827] transition hover:bg-[#fff2e8] hover:text-[#f97316]"
          >
            <LogOut size={19} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <div className="border-b border-[#e7ebf0] bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" aria-label="Return to Xerin Marketplace home">
              <Image
                src="/images/logo/logo.png"
                alt="Xerin Marketplace"
                width={120}
                height={38}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <span className="rounded-full bg-[#fff2e8] px-3 py-1.5 text-xs font-bold text-[#f97316]">
              Broker Center
            </span>
          </div>
        </div>

        <main className="min-h-screen px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-7">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-[#e7ebf0] bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] lg:hidden">
        {navItems.slice(0, 4).map((item) => {
          const active =
            item.href === "/broker/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-bold ${
                active ? "text-[#f97316]" : "text-[#111827]"
              }`}
            >
              <Icon size={18} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
