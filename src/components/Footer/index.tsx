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

const marketplacePolicyLinks = [
 { label: "Product Listing Policy", href: "/policies/product-listing" },
 { label: "Intellectual Property Protection", href: "/policies/intellectual-property" },
 { label: "Privacy Policy", href: "/policies/privacy" },
 { label: "Terms of Use", href: "/policies/terms-of-use" },
 { label: "User Information Legal Enquiry Guide", href: "/policies/legal-enquiry" },
 { label: "Integrity Compliance", href: "/policies/integrity-compliance" },
];

const Footer = () => {
 const year = new Date().getFullYear();
 const { isAuthenticated, logout } = useAuth();

 return (
 <footer className="relative border-t border-border bg-muted">

 {/* CTA strip */}
 <div className="relative border-b border-border">
 <div className="mx-auto flex max-w-[1170px] flex-col items-center gap-6 px-4 py-12 text-center sm:px-8 lg:flex-row lg:justify-between lg:text-left xl:px-0">
 <div className="flex flex-col gap-2">
 <h3 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
 Ready to grow your business with Xerin?
 </h3>
 <p className="text-sm text-muted-foreground">
 Start selling, become a Winga, join our logistics network, or explore the marketplace — all in one place.
 </p>
 </div>
 <div className="flex flex-wrap items-center justify-center gap-3">
 <Link
 href="/signup?tab=seller"
 className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-md"
 >
 Become a Seller
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
 </Link>
 <Link
 href="/signup?tab=broker"
 className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary/10"
 >
 Become a Winga
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
 </Link>
 <Link
 href="/signup"
 className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:bg-foreground/90"
 >
 Join Logistics Network
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
 alt="Xerin Marketplace"
 width={150}
 height={48}
 className="h-11 w-auto object-contain"
 />
 </Link>
 <p className="max-w-xs text-sm text-muted-foreground text-pretty">
 Tanzania&apos;s trusted marketplace for buyers and sellers. Shop with confidence,
 sell with ease, and deliver with Xerin Express.
 </p>

 {/* Contact info */}
 <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
 <span className="flex items-center gap-2">
 <HugeiconsIcon icon={Location01Icon} size={16} />
 Dar es Salaam, Tanzania
 </span>
 <a href="mailto:support@xerinmarketplace.com" className="flex items-center gap-2 transition-colors hover:text-foreground">
 <HugeiconsIcon icon={Mail01Icon} size={16} className="shrink-0 text-primary" />
 support@xerinmarketplace.com
 </a>
 <a href={ROUTES.contact} className="flex items-center gap-2 transition-colors hover:text-foreground">
 <HugeiconsIcon icon={Mail01Icon} size={16} />
 Help & Order Support
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
 <span className="text-[10px] text-background/60">Coming soon on</span>
 <span className="text-sm font-semibold text-background">App Store</span>
 </div>
 </span>
 <a
 href="https://play.google.com/store/apps/details?id=com.xerinmarket.com&pcampaignid=web_share"
 target="_blank"
 rel="noopener noreferrer"
 aria-label="Download Xerin Marketplace on Google Play"
 className="flex items-center gap-2.5 rounded-lg bg-foreground px-4 py-2.5 text-background transition hover:opacity-90"
 >
 <HugeiconsIcon icon={PlayStoreIcon} size={28} />
 <div className="flex flex-col leading-tight">
 <span className="text-[10px] text-background/60">Get it on</span>
 <span className="text-sm font-semibold text-background">Google Play</span>
 </div>
 </a>
 </div>
 </div>

 {/* Links grid */}
 <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
 {/* Marketplace */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 Marketplace
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 <li>
 <Link href={ROUTES.shop} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Shop Products
 </Link>
 </li>
 <li>
 <Link href={ROUTES.cart} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Cart
 </Link>
 </li>
 <li>
 <Link href={ROUTES.wishlist} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Wishlist
 </Link>
 </li>
 <li>
 <Link href={ROUTES.contact} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Returns & Refunds
 </Link>
 </li>
 <li>
 <Link href={ROUTES.contact} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Help Center
 </Link>
 </li>
 </ul>
 </div>

 {/* Account */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 Account
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 {isAuthenticated ? (
 <>
 <li>
 <Link href="/account" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 My Account
 </Link>
 </li>
 <li>
 <Link href="/account/orders" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Orders
 </Link>
 </li>
 <li>
 <button onClick={() => void logout()} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Logout
 </button>
 </li>
 </>
 ) : (
 <li>
 <Link href={ROUTES.signin} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Sign In / Register
 </Link>
 </li>
 )}
 <li>
 <Link href={ROUTES.trackOrder} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Track Orders
 </Link>
 </li>
 </ul>
 </div>

 {/* Sell */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 Sell on Xerin
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 <li>
 <Link href={ROUTES.sellerRegister} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Become a Seller
 </Link>
 </li>
 <li>
 <Link href="/policies/product-listing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Seller Guidelines
 </Link>
 </li>
 <li>
 <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Seller Support
 </Link>
 </li>
 </ul>
 </div>

 {/* Logistics */}
 <div className="flex flex-col gap-3">
 <h4 className="text-sm font-semibold text-foreground">
 Logistics
 <span className="mt-1 block h-0.5 w-6 rounded-full bg-primary" />
 </h4>
 <ul className="flex flex-col gap-2.5">
 <li>
 <a href="https://xerinexpress.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
 Partner with Xerin Logistics
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} className="opacity-60" />
 </a>
 </li>
 <li>
 <Link href="/track" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
 Track Shipment
 </Link>
 </li>
 </ul>
 </div>
 </div>
 </div>

 {/* Policies bar */}
 <div className="relative mt-10 border-t border-border pt-6">
 <p className="mb-3 text-center text-sm font-medium text-foreground">
 Marketplace Policies & Legal
 </p>
 <ul
 aria-label="Marketplace policies and legal guides"
 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-muted-foreground"
 >
 {marketplacePolicyLinks.map((policy, index) => (
 <React.Fragment key={policy.href}>
 <li>
 <Link
 href={policy.href}
 className="transition-colors hover:text-primary hover:underline"
 >
 {policy.label}
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
 <p className="text-sm text-muted-foreground">
 &copy; {year}. All rights reserved by Xerin Group.
 </p>

 <div className="flex flex-wrap items-center gap-4">
 <p className="text-sm font-medium text-muted-foreground">We Accept:</p>
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
