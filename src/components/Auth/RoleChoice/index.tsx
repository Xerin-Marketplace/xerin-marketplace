"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/endpoints/auth";
import { authStorage } from "@/lib/auth/storage";
import toast from "react-hot-toast";

const cards = [
 {
 key: "customer",
 title: "Customer",
 subtitle: "Buy products",
 icon: "🛍️",
 href: "/account",
 benefits: ["Shop thousands of products", "Secure payments", "Reliable delivery", "Order tracking"],
 action: "Continue as Customer",
 tone: "bg-green-light-6",
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
 tone: "bg-primary/10",
 },
] as const;

export default function RoleChoice() {
 const router = useRouter();
 const { isAuthenticated, user, setSession } = useAuth();
 const [busyRole, setBusyRole] = useState<string | null>(null);

 useEffect(() => {
 if (!isAuthenticated) router.replace("/signin?redirect=/choose-role");
 }, [isAuthenticated, router]);

 const chooseRole = async (role: "customer" | "seller" | "broker", href: string) => {
 if (busyRole) return;
 setBusyRole(role);
 try {
 const result = await authApi.selectInitialRole(role);
 // Keep the in-memory/local session user synchronized with the persisted state.
 const current = authStorage.getSession();
 if (current) {
 setSession({ ...current, user: result.user });
 }
 router.push(href);
 } catch (error: any) {
 toast.error(error?.message || "Unable to save your role choice. Please try again.");
 } finally {
 setBusyRole(null);
 }
 };

 if (!isAuthenticated) return null;

 return (
 <main className="relative min-h-[100dvh] overflow-hidden bg-[var(--muted)] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
 
 

 <div className="relative mx-auto max-w-6xl">
 <div className="mx-auto mb-7 flex justify-center sm:mb-8">
 <button type="button" onClick={() => router.push("/")} aria-label="Go to XerinMarket home">
 <Image
 src="/images/logo/logooriginal.png"
 alt="XerinMarket"
 width={170}
 height={54}
 className="h-auto w-[145px] object-contain sm:w-[165px]"
 priority
 />
 </button>
 </div>

 <section className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
 <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
 Welcome to XerinMarket
 </p>
 <h1 className="text-[30px] font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
 How would you like to use{" "}
 <span className="text-primary">XerinMarket?</span>
 </h1>
 <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
 {user?.first_name ? `Welcome, ${user.first_name}. ` : ""}
 Choose the option that best describes what you want to do. You can still use the same Xerin account across the marketplace.
 </p>
 </section>

 <section className="grid gap-5 md:grid-cols-3 lg:gap-6">
 {cards.map((card) => (
 <button
 key={card.key}
 type="button"
 onClick={() => void chooseRole(card.key === "winga" ? "broker" : card.key, card.href)}
 disabled={Boolean(busyRole)}
 className="group flex min-h-[390px] flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-ring/30 sm:p-7"
 >
 <div className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full ${card.tone} text-4xl transition duration-300 group-hover:scale-105`}>
 {card.icon}
 </div>

 <h2 className="text-2xl font-extrabold text-foreground">{card.title}</h2>
 <p className="mt-1.5 min-h-12 text-sm leading-6 text-muted-foreground">
 {card.subtitle}
 </p>

 <div className="my-5 h-px w-full bg-gray-3" />

 <ul className="mb-6 space-y-3">
 {card.benefits.map((benefit) => (
 <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground-3">
 <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
 ✓
 </span>
 <span>{benefit}</span>
 </li>
 ))}
 </ul>

 <span className="mt-auto flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition group-hover:bg-primary/90">
 {card.action}
 <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">→</span>
 </span>
 </button>
 ))}
 </section>

 <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-3 text-center text-xs text-muted-foreground shadow-sm backdrop-blur /80 sm:text-sm">
 <span className="text-base text-primary">✓</span>
 <span>Your Xerin account stays secure. Choose the role that fits how you want to start.</span>
 </div>

 <p className="mt-5 text-center text-xs text-muted-foreground">
 You can access other approved Xerin areas later from the same account.
 </p>
 </div>
 </main>
 );
}
