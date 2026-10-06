"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
 ROUTES,
 SOCIAL_LINKS,
} from "@/constants/links";
import { useAuth } from "@/hooks/useAuth";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, Mail01Icon, FacebookIcon, NewTwitterIcon, InstagramIcon, Linkedin01Icon, AppStoreIcon, PlayStoreIcon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageSwitcher from "@/components/Common/LanguageSwitcher";

const marketplacePolicyLinks: { key: import("@/lib/i18n/dictionary").TranslationKey; href: string }[] = [
 { key: "footer_policy_listing", href: "/policies/product-listing" },
 { key: "footer_policy_ip", href: "/policies/intellectual-property" },
 { key: "footer_policy_returns", href: "/policies/returns-refunds" },
 { key: "footer_policy_privacy", href: "/policies/privacy" },
 { key: "footer_policy_terms", href: "/policies/terms-of-use" },
 { key: "footer_policy_enquiry", href: "/policies/legal-enquiry" },
 { key: "footer_policy_integrity", href: "/policies/integrity-compliance" },
];

const Footer = () => {
 const { t } = useLanguage();
 const year = new Date().getFullYear();
 const { isAuthenticated, logout } = useAuth();

 return (
 <footer className="relative border-t border-border bg-muted">

 {/* CTA strip */}
 <div className="relative border-b border-border">
 <div className="mx-auto flex max-w-[1170px] flex-col items-center gap-6 px-4 py-12 text-center sm:px-8 lg:flex-row lg:justify-between lg:text-left xl:px-0">
 <div className="flex flex-col gap-2">
 <h3 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
 {t("footer_cta_title")}
 </h3>
 <p className="text-sm text-muted-foreground">
 {t("footer_cta_body")}
 </p>
 </div>
 <div className="flex flex-wrap items-center justify-center gap-3">
 <Link
 href="/signup?tab=seller"
 className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#123B5D] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0F3049] hover:shadow-md"
 >
 {t("nav_become_seller")}
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
 </Link>
 <Link
 href="/signup?tab=broker"
 className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#C6922E] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#B08226] hover:shadow-md"
 >
 {t("auth_become_broker")}
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
 </Link>
 <Link
 href="/signup"
 className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#176B65] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#125853] hover:shadow-md"
 >
 {t("footer_join_logistics")}
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
 </Link>
 </div>
 </div>
 </div>

 {/* Main footer content */}
 <div className="relative mx-auto max-w-[1170px] px-4 py-14 sm:px-8 xl:px-0">
 <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
 {/* Brand */}
 <div className="flex flex-col gap-5">
 <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
 <Image
 src="/images/logo/logooriginal.png"
 alt="Xerin Mart"
 width={150}
 height={48}
 className="h-14 w-auto object-contain"
 />
 </Link>
 <p className="max-w-xs text-sm text-muted-foreground text-pretty">
 {t("footer_tagline")}
 </p>

 {/* Contact info */}
 <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
 <span className="flex items-center gap-2">
 <HugeiconsIcon icon={Location01Icon} size={16} />
 Dar es Salaam, Tanzania
 </span>
 <a href="mailto:support@xerinmart.com" className="flex items-center gap-2 transition-colors hover:text-foreground">
 <HugeiconsIcon icon={Mail01Icon} size={16} className="shrink-0 text-primary" />
 support@xerinmart.com
 </a>
 <a href={ROUTES.contact} className="flex items-center gap-2 transition-colors hover:text-foreground">
 <HugeiconsIcon icon={Mail01Icon} size={16} />
 {t("footer_help_orders")}
 </a>
 </div>

 {/* Social Links · only rendered when a real profile URL is configured */}
 <div className="flex items-center gap-3 pt-2">
 {SOCIAL_LINKS.facebook && (
 <a
 href={SOCIAL_LINKS.facebook}
 aria-label="Facebook Social Link"
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
 >
 <HugeiconsIcon icon={FacebookIcon} size={20} />
 </a>
 )}
 {SOCIAL_LINKS.twitter && (
 <a
 href={SOCIAL_LINKS.twitter}
 aria-label="Twitter Social Link"
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
 >
 <HugeiconsIcon icon={NewTwitterIcon} size={20} />
 </a>
 )}
 {SOCIAL_LINKS.instagram && (
 <a
 href={SOCIAL_LINKS.instagram}
 aria-label="Instagram Social Link"
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
 >
 <HugeiconsIcon icon={InstagramIcon} size={20} />
 </a>
 )}
 {SOCIAL_LINKS.linkedin && (
 <a
 href={SOCIAL_LINKS.linkedin}
 aria-label="Linkedin Social Link"
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
 >
 <HugeiconsIcon icon={Linkedin01Icon} size={20} />
 </a>
 )}
 </div>

 {/* App download buttons */}
 <div className="flex flex-wrap items-center gap-3 pt-2">
 <span className="flex cursor-not-allowed items-center gap-2.5 rounded-lg bg-foreground px-4 py-2.5 text-background opacity-80">
 <HugeiconsIcon icon={AppStoreIcon} size={28} />
 <div className="flex flex-col leading-tight">
 <span className="text-[10px] text-background/60">{t("footer_coming_soon")}</span>
 <span className="text-sm font-semibold text-background">App Store</span>
 </div>
 </span>
 <a
 href="https://play.google.com/store/apps/details?id=com.xerinmarket.com&pcampaignid=web_share"
 target="_blank"
 rel="noopener noreferrer"
 aria-label="Download Xerin Mart on Google Play"
 className="flex items-center gap-2.5 rounded-lg bg-foreground px-4 py-2.5 text-background transition hover:opacity-90"
 >
 <HugeiconsIcon icon={PlayStoreIcon} size={28} />
 <div className="flex flex-col leading-tight">
 <span className="text-[10px] text-background/60">{t("footer_get_it_on")}</span>
 <span className="text-sm font-semibold text-background">Google Play</span>
 </div>
 </a>
 </div>
 </div>

 {/* Links grid */}
 <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
 {/* Shop */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 {t("footer_shop")}
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 <li>
 <Link href={ROUTES.shop} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_shop_products")}
 </Link>
 </li>
 <li>
 <Link href={ROUTES.cart} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("header_cart")}
 </Link>
 </li>
 <li>
 <Link href={ROUTES.wishlist} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("header_wishlist")}
 </Link>
 </li>
 <li>
 <Link href={ROUTES.contact} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_policy_returns")}
 </Link>
 </li>
 <li>
 <Link href={ROUTES.contact} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_help")}
 </Link>
 </li>
 </ul>
 </div>

 {/* Account */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 {t("header_account")}
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 {isAuthenticated ? (
 <>
 <li>
 <Link href="/account" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_my_account")}
 </Link>
 </li>
 <li>
 <Link href="/account/orders" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("header_orders")}
 </Link>
 </li>
 <li>
 <button onClick={() => void logout()} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_logout")}
 </button>
 </li>
 </>
 ) : (
 <li>
 <Link href={ROUTES.signin} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_signin_register")}
 </Link>
 </li>
 )}
 <li>
 <Link href={ROUTES.trackOrder} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_track_orders")}
 </Link>
 </li>
 </ul>
 </div>

 {/* Sell */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 {t("footer_sell_on_xerin")}
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 <li>
 <Link href={ROUTES.sellerRegister} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("nav_become_seller")}
 </Link>
 </li>
 <li>
 <Link href="/policies/product-listing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_seller_guidelines")}
 </Link>
 </li>
 <li>
 <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_seller_support")}
 </Link>
 </li>
 </ul>
 </div>

 {/* Logistics */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 {t("nav_logistics")}
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 <li>
 <a href="https://xerinexpress.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_partner_logistics")}
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} className="opacity-60" />
 </a>
 </li>
 <li>
 <Link href="/track" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 {t("footer_track_shipment")}
 </Link>
 </li>
 </ul>
 </div>
 </div>
 </div>

 {/* Policies bar */}
 <div className="relative mt-10 border-t border-border pt-6">
 <p className="mb-3 text-center text-sm font-medium text-foreground">
 {t("footer_policies_legal")}
 </p>
 <ul
 aria-label="policies and legal guides"
 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-muted-foreground"
 >
 {marketplacePolicyLinks.map((policy, index) => (
 <React.Fragment key={policy.href}>
 <li>
 <Link
 href={policy.href}
 className="transition-colors hover:text-primary hover:underline"
 >
 {t(policy.key)}
 </Link>
 </li>
 {index < marketplacePolicyLinks.length - 1 && (
 <li aria-hidden="true" className="text-border">-</li>
 )}
 </React.Fragment>
 ))}
 </ul>
 </div>

 {/* Bottom bar */}
 <div className="relative mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
 <div className="flex flex-wrap items-center gap-4">
 <p className="text-sm text-muted-foreground">
 &copy; {year} Xerin Mart. {t("footer_rights")}
 </p>
 <LanguageSwitcher compact />
 </div>

 <div className="flex flex-wrap items-center gap-4">
 <p className="text-sm font-medium text-muted-foreground">{t("footer_we_accept")}</p>
 <div className="flex flex-wrap items-center gap-4">
 <span aria-label="We accept Visa card payments">
 <Image src="/images/payment/payment-01.svg" alt="visa card" width={66} height={22} />
 </span>
 <span aria-label="We accept Mastercard payments">
 <Image src="/images/payment/payment-03.svg" alt="master card" width={33} height={24} />
 </span>
 </div>
 </div>

 <p className="text-sm text-muted-foreground">Dar es Salaam, Tanzania</p>
 </div>
 </div>
 </footer>
 );
};

export default Footer;
