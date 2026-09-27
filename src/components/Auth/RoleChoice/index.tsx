"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/endpoints/auth";
import { authStorage } from "@/lib/auth/storage";
import toast from "react-hot-toast";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
 ShoppingBag02Icon,
 Store01Icon,
 CheckmarkCircle02Icon,
 ArrowRight01Icon,
 ShieldCheckIcon,
} from "@hugeicons/core-free-icons";

const cards: {
 key: "customer" | "seller";
 title: string;
 subtitle: string;
 icon: IconSvgElement;
 href: string;
 benefits: string[];
 action: string;
 accent: string;
 tag: string;
}[] = [
 {
 key: "customer",
 title: "Customer",
 subtitle: "Shop and receive deliveries across the marketplace",
 icon: ShoppingBag02Icon,
 href: "/account",
 benefits: ["Shop thousands of products", "Secure payments", "Reliable delivery", "Order tracking"],
 action: "Continue as Customer",
 accent: "#176B65",
 tag: "Shop",
 },
 {
 key: "seller",
 title: "Seller",
 subtitle: "Open a store and sell your products on Xerin",
 icon: Store01Icon,
 href: "/onboarding/seller",
 benefits: ["Create and manage your store", "Reach more customers", "Manage orders easily", "Grow your business"],
 action: "Continue as Seller",
 accent: "#123B5D",
 tag: "Sell",
 },
];

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
 if (!result.user?.phone) {
 // Phone verification is mandatory before entering the workspace.
 router.push(`/verify-phone?next=${encodeURIComponent(href)}`);
 return;
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
 className="h-auto w-[165px] object-contain sm:w-[190px]"
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

 <section className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2 lg:gap-6">
 {cards.map((card) => (
 <button
 key={card.key}
 type="button"
 onClick={() => void chooseRole(card.key, card.href)}
 disabled={Boolean(busyRole)}
 className="group flex min-h-[390px] flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-ring/30 sm:p-7"
 >
 <div className="mb-5 flex items-center justify-between">
 <span
 className="flex h-14 w-14 items-center justify-center rounded-2xl text-white transition duration-300 group-hover:scale-105"
 style={{ backgroundColor: card.accent }}
 >
 <HugeiconsIcon icon={card.icon} size={26} />
 </span>
 <span
 className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/95"
 style={{ backgroundColor: `${card.accent}1A`, color: card.accent }}
 >
 {card.tag}
 </span>
 </div>

 <h2 className="text-2xl font-extrabold text-foreground">{card.title}</h2>
 <p className="mt-1.5 min-h-12 text-sm leading-6 text-muted-foreground">
 {card.subtitle}
 </p>

 <div className="my-5 h-px w-full bg-border" />

 <ul className="mb-6 space-y-3">
 {card.benefits.map((benefit) => (
 <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground-3">
 <HugeiconsIcon
 icon={CheckmarkCircle02Icon}
 size={18}
 className="mt-0.5 shrink-0"
 style={{ color: card.accent }}
 />
 <span>{benefit}</span>
 </li>
 ))}
 </ul>

 <span
 className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-sm transition"
 style={{ backgroundColor: card.accent }}
 >
 {busyRole === card.key ? "Saving..." : card.action}
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="transition-transform group-hover:translate-x-1" />
 </span>
 </button>
 ))}
 </section>

 <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-3 text-center text-xs text-muted-foreground shadow-sm backdrop-blur /80 sm:text-sm">
 <HugeiconsIcon icon={ShieldCheckIcon} size={16} className="shrink-0 text-primary" />
 <span>Your Xerin account stays secure. Choose the role that fits how you want to start.</span>
 </div>

 <p className="mt-5 text-center text-xs text-muted-foreground">
 You can access other approved Xerin areas later from the same account.
 </p>
 </div>
 </main>
 );
}
