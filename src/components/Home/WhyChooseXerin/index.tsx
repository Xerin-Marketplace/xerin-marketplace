import React from "react";
"use client";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CreditCardIcon, PackageCheckIcon, ShieldCheckIcon, Store01Icon } from "@hugeicons/core-free-icons";

const WhyChooseXerin = () => {
 const { t } = useLanguage();
 const FEATURES = [
 { title: t("feat_secure_title"), description: t("feat_secure_desc"), icon: CreditCardIcon },
 { title: t("feat_delivery_title"), description: t("feat_delivery_desc"), icon: PackageCheckIcon },
 { title: t("feat_sellers_title"), description: t("feat_sellers_desc"), icon: Store01Icon },
 { title: t("feat_protection_title"), description: t("feat_protection_desc"), icon: ShieldCheckIcon },
 ];

 return (
 <section className="overflow-hidden bg-card dark:bg-muted">
 <div className="mx-auto max-w-screen-xl px-4 py-12 lg:py-20 lg:px-6">
 {/* Section header */}
 <div className="mb-10 text-center">
 <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
 {t("home_why_xerin")}
 </span>
 <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
 {t("home_trust_title")}
 </h2>
 <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground dark:text-muted-foreground sm:text-base">
 {t("home_trust_body")}
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
 {t("home_start_shopping")}
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 <Link
 href="/seller/register"
 className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary dark:border-border"
 >
 {t("footer_sell_on_xerin")}
 </Link>
 </div>
 </div>
 </section>
 );
};

export default WhyChooseXerin;
