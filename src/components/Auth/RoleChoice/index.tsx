"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const cards = [
  {
    key: "customer",
    title: "Customer",
    subtitle: "Buy products",
    icon: "🛍️",
    href: "/account",
    benefits: ["Shop thousands of products", "Secure payments", "Reliable delivery", "Order tracking"],
    action: "Continue as Customer",
    tone: "bg-emerald-50",
  },
  {
    key: "seller",
    title: "Seller",
    subtitle: "Sell your products",
    icon: "🏪",
    href: "/onboarding/seller",
    benefits: ["Create and manage your store", "Reach more customers", "Manage orders easily", "Grow your business"],
    action: "Continue as Seller",
    tone: "bg-blue-50",
  },
  {
    key: "winga",
    title: "Winga (Broker)",
    subtitle: "Earn by promoting and selling products",
    icon: "🤝",
    href: "/onboarding/winga",
    benefits: ["Promote marketplace products", "Earn commissions", "No inventory required", "Flexible earning opportunity"],
    action: "Continue as Winga",
    tone: "bg-orange-50",
  },
] as const;

export default function RoleChoice() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/signin?redirect=/choose-role");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#f8fafc] px-4 py-8 dark:bg-darkTheme-bg sm:px-6 sm:py-10 lg:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-7 flex justify-center sm:mb-8">
          <button type="button" onClick={() => router.push("/")} aria-label="Go to Xerin Marketplace home">
            <Image
              src="/images/logo/logo.png"
              alt="Xerin Marketplace"
              width={170}
              height={58}
              className="h-auto w-[145px] object-contain sm:w-[165px]"
              priority
            />
          </button>
        </div>

        <section className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-orange sm:text-sm">
            Welcome to Xerin Marketplace
          </p>
          <h1 className="text-[30px] font-extrabold leading-[1.12] tracking-tight text-dark dark:text-white sm:text-4xl lg:text-5xl">
            How would you like to use{" "}
            <span className="text-orange">Xerin Marketplace?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-dark-4 dark:text-darkTheme-secondary-muted sm:text-base">
            {user?.first_name ? `Welcome, ${user.first_name}. ` : ""}
            Choose the option that best describes what you want to do. You can still use the same Xerin account across the marketplace.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {cards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => router.push(card.href)}
              className="group flex min-h-[390px] flex-col rounded-[24px] border border-[#e1e7ef] bg-white p-6 text-left shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-orange/50 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-orange/30 dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7"
            >
              <div className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full ${card.tone} text-4xl transition duration-300 group-hover:scale-105`}>
                {card.icon}
              </div>

              <h2 className="text-2xl font-extrabold text-dark dark:text-white">{card.title}</h2>
              <p className="mt-1.5 min-h-12 text-sm leading-6 text-dark-4 dark:text-darkTheme-secondary-muted">
                {card.subtitle}
              </p>

              <div className="my-5 h-px w-full bg-gray-3 dark:bg-darkTheme-border-color" />

              <ul className="mb-6 space-y-3">
                {card.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5 text-sm text-dark-3 dark:text-darkTheme-secondary">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/10 text-[11px] font-bold text-orange">
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <span className="mt-auto flex w-full items-center justify-center rounded-xl bg-orange px-4 py-3.5 text-sm font-bold text-white shadow-sm transition group-hover:bg-orange-dark">
                {card.action}
                <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
          ))}
        </section>

        <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 rounded-xl border border-gray-3 bg-white/80 px-4 py-3 text-center text-xs text-dark-4 shadow-sm backdrop-blur dark:border-darkTheme-border-color dark:bg-darkTheme-card/80 dark:text-darkTheme-secondary-muted sm:text-sm">
          <span className="text-base text-orange">✓</span>
          <span>Your Xerin account stays secure. Choose the role that fits how you want to start.</span>
        </div>

        <p className="mt-5 text-center text-xs text-dark-4 dark:text-darkTheme-secondary-muted">
          You can access other approved Xerin areas later from the same account.
        </p>
      </div>
    </main>
  );
}
