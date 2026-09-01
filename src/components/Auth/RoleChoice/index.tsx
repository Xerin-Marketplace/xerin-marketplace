"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const cards = [
  { key: "customer", title: "Customer", subtitle: "Buy products", icon: "🛍️", href: "/account" },
  { key: "seller", title: "Seller", subtitle: "Sell your products", icon: "🏪", href: "/onboarding/seller" },
  { key: "winga", title: "Winga (Broker)", subtitle: "Earn by promoting and selling products", icon: "🤝", href: "/onboarding/winga" },
] as const;

export default function RoleChoice() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/signin?redirect=/choose-role");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-[100dvh] bg-gray-1 px-4 py-10 dark:bg-darkTheme-bg sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-10">
          <Link href="/" className="text-sm font-semibold text-orange">Xerin Market</Link>
          <h1 className="mt-3 text-3xl font-bold text-dark dark:text-white sm:text-4xl">How would you like to use Xerin Market?</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-dark-4 dark:text-darkTheme-secondary-muted sm:text-base">
            Welcome{user?.first_name ? `, ${user.first_name}` : ""}. Choose what you want to do first. You can still shop with the same Xerin account.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => router.push(card.href)}
              className="group rounded-2xl border border-gray-3 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange hover:shadow-lg dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-8"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-3xl">{card.icon}</div>
              <h2 className="text-xl font-bold text-dark dark:text-white">{card.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-dark-4 dark:text-darkTheme-secondary-muted">{card.subtitle}</p>
              <span className="mt-6 inline-flex items-center font-semibold text-orange">Continue <span className="ml-2 transition group-hover:translate-x-1">→</span></span>
            </button>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-dark-4 dark:text-darkTheme-secondary-muted">
          Already know where you belong? You can change areas later according to your approved account roles.
        </p>
      </div>
    </main>
  );
}
