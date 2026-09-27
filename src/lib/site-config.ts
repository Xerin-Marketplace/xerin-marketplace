import { API_BASE_URL, API_DOCS_URL } from "@/lib/api/endpoints";

export const siteConfig = {
  name: "Xerin Marketplace",
  shortName: "Xerin",
  tagline: "Your Trusted Marketplace",
  description:
    "Xerin Marketplace is a modern online marketplace connecting buyers and sellers across Africa. Shop quality products, manage your store, and grow your business.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://xerinmarketplace.com",
  locale: "en_US",
  themeColor: "#c2410c",
  keywords: [
    "Xerin Marketplace",
    "online marketplace",
    "Africa marketplace",
    "ecommerce",
    "online shopping",
    "sell online",
    "buy online",
    "XerinMarket",
  ],
  authors: {
    name: "Xerin Marketplace",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://xerinmarketplace.com",
  },
  creator: "Xerin Marketplace",
  publisher: "Xerin Marketplace",
  contact: {
    email: "support@xerinmarketplace.com",
    phone: "",
  },
  social: {
    facebook: "https://facebook.com/xerinmarket",
    twitter: "https://twitter.com/xerinmarket",
    instagram: "https://instagram.com/xerinmarket",
    linkedin: "https://linkedin.com/company/xerinmarket",
  },
  api: {
    baseUrl: API_BASE_URL,
    docsUrl: API_DOCS_URL,
  },
  navigation: {
    primary: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop-with-sidebar" },
      { label: "Sell on Xerin", href: "/seller/register" },
      { label: "Contact", href: "/contact" },
    ],
  },
  footer: {
    copyrightYear: new Date().getFullYear(),
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
