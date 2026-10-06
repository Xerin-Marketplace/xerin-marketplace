import { API_BASE_URL, API_DOCS_URL } from "@/lib/api/endpoints";

export const siteConfig = {
  name: "Xerin Mart",
  shortName: "Xerin",
  tagline: "Your Trusted Online Store",
  description:
    "Xerin Mart is a modern online marketplace connecting buyers and sellers across Africa. Shop quality products, manage your store, and grow your business.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://xerinmart.com",
  locale: "en_US",
  themeColor: "#c2410c",
  keywords: [
    "Xerin Mart",
    "online marketplace",
    "Africa marketplace",
    "ecommerce",
    "online shopping",
    "sell online",
    "buy online",
    "Xerin Mart",
  ],
  authors: {
    name: "Xerin Mart",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://xerinmart.com",
  },
  creator: "Xerin Mart",
  publisher: "Xerin Mart",
  contact: {
    email: "support@xerinmart.com",
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
