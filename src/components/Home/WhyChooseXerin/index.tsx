import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CreditCardIcon, PackageCheckIcon, ShieldCheckIcon, Store01Icon } from "@hugeicons/core-free-icons";

const FEATURES = [
 {
 title: "Secure payments",
 description:
 "Pay by mobile money or card. Your payment is held in escrow and only released to the seller after delivery is confirmed.",
 icon: CreditCardIcon,
 },
 {
 title: "Tracked delivery",
 description:
 "Xerin Logistics delivers across Tanzania. Follow your order from seller preparation to your doorstep.",
 icon: PackageCheckIcon,
 },
 {
 title: "Verified sellers",
 description:
 "Sellers complete KYC review before listing, so you buy from vetted marketplace partners.",
 icon: Store01Icon,
 },
 {
 title: "Buyer protection",
 description:
 "If something goes wrong, raise a protection claim from your order and our team reviews it.",
 icon: ShieldCheckIcon,
 },
];

const WhyChooseXerin = () => {
 return (
 <section className="overflow-hidden bg-card dark:bg-muted">
 <div className="mx-auto max-w-screen-xl px-4 py-12 lg:py-20 lg:px-6">
 {/* Section header */}
 <div className="mb-10 text-center">
 <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
 Why Xerin Market
 </span>
 <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
 A marketplace built on trust
 </h2>
 <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground dark:text-muted-foreground sm:text-base">
 We connect buyers and sellers with secure payments, tracked
 delivery and buyer protection · all in one platform.
 </p>
 </div>

 {/* Feature cards */}
 <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
 {FEATURES.map((feature) => (
 <div
 key={feature.title}
 className="rounded-2xl border border-border bg-card p-6 dark:border-border dark:bg-muted"
 >
 <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={feature.icon} size={20} />
 </div>
 <h3 className="mb-2 text-base font-bold text-foreground">
 {feature.title}
 </h3>
 <p className="text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground">
 {feature.description}
 </p>
 </div>
 ))}
 </div>

 {/* CTA */}
 <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Link
 href="/shop-with-sidebar"
 className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 Start shopping
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 <Link
 href="/seller/register"
 className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary dark:border-border"
 >
 Sell on Xerin
 </Link>
 </div>
 </div>
 </section>
 );
};

export default WhyChooseXerin;
