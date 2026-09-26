import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/lib/site-config";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./css/style.css";

const inter = localFont({
 src: [
 { path: "./fonts/EuclidCircularA-Regular.woff2", weight: "400", style: "normal" },
 { path: "./fonts/EuclidCircularA-Medium.woff2", weight: "500", style: "normal" },
 { path: "./fonts/EuclidCircularA-SemiBold.woff2", weight: "600", style: "normal" },
 { path: "./fonts/EuclidCircularA-Bold.woff2", weight: "700", style: "normal" },
 ],
 display: "swap",
 variable: "--font-inter",
});

export const metadata: Metadata = {
 metadataBase: new URL(siteConfig.url),
 title: {
 default: `${siteConfig.name} · ${siteConfig.tagline}`,
 template: `%s | ${siteConfig.name}`,
 },
 description: siteConfig.description,
 keywords: [...siteConfig.keywords],
 authors: [siteConfig.authors],
 creator: siteConfig.creator,
 publisher: siteConfig.publisher,
 applicationName: siteConfig.name,
 category: "eCommerce",
 alternates: {
 canonical: siteConfig.url,
 },
 openGraph: {
 type: "website",
 locale: siteConfig.locale,
 url: siteConfig.url,
 siteName: siteConfig.name,
 title: `${siteConfig.name} · ${siteConfig.tagline}`,
 description: siteConfig.description,
 images: [
 {
 url: "/og/home",
 width: 1200,
 height: 630,
 alt: `${siteConfig.name} · ${siteConfig.tagline}`,
 },
 ],
 },
 twitter: {
 card: "summary_large_image",
 title: `${siteConfig.name} · ${siteConfig.tagline}`,
 description: siteConfig.description,
 images: ["/og/home"],
 },
 robots: {
 index: true,
 follow: true,
 googleBot: {
 index: true,
 follow: true,
 "max-image-preview": "large",
 "max-snippet": -1,
 },
 },
 icons: {
 icon: "/icon.png",
 apple: "/apple-icon.png",
 shortcut: "/favicon.ico",
 },
 manifest: "/manifest.webmanifest",
 formatDetection: {
 email: false,
 address: false,
 telephone: false,
 },
};

export const viewport: Viewport = {
 themeColor: siteConfig.themeColor,
 width: "device-width",
 initialScale: 1,
 maximumScale: 5,
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="en" suppressHydrationWarning={true} data-scroll-behavior="smooth">
 <body className={`${inter.className} ${inter.variable} min-h-dvh overflow-x-hidden bg-body-bg font-sans`}>
 <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
 {children}
 </body>
 </html>
 );
}