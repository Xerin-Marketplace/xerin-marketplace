"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockIcon } from "@hugeicons/core-free-icons";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import AuthProvider from "@/app/providers/AuthProvider";
import QueryProvider from "@/app/providers/QueryProvider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import NotificationProvider from "@/app/providers/NotificationProvider";
// import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import MobileBottomNav from "@/components/Header/MobileBottomNav";
import RuntimeStatus from "@/components/Common/RuntimeStatus";
import { CurrencyProvider } from "@/app/context/CurrencyContext";
import { LanguageProvider } from "@/app/context/LanguageContext";
import { useClearCart } from "@/hooks/useCartActions";
import { Suspense } from "react";
import GoogleOneTap from "@/components/Auth/GoogleOneTap";
import AuthPrompt from "@/components/Auth/AuthPrompt";
import AppBanner from "@/components/Engagement/AppBanner";
import IntentChatWidget from "@/components/Engagement/IntentChatWidget";
import { useLanguage } from "@/app/context/LanguageContext";

function CheckoutHeader() {
 const clearCart = useClearCart();
 const { t } = useLanguage();

 return (
 <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
 <div className="mx-auto flex h-16 max-w-[1220px] items-center justify-between px-4 sm:px-6 lg:px-8">
 <Link href="/" className="flex items-center" aria-label="Xerin Mart home">
 <Image
 src="/images/logo/logooriginal.png"
 alt="Xerin Mart"
 width={120}
 height={38}
 className="h-9 w-auto object-contain"
 />
 </Link>
 <div className="flex items-center gap-4">
 <span className="hidden items-center gap-1.5 rounded-full bg-green-light-6 px-3 py-1.5 text-xs font-semibold text-green-dark sm:inline-flex">
 <HugeiconsIcon icon={LockIcon} size={13} /> {t("checkout_secure")}
 </span>
 <button
 type="button"
 onClick={() => clearCart.mutate()}
 disabled={clearCart.isPending}
 className="hidden items-center rounded-lg px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-red-light-6 disabled:opacity-50 sm:inline-flex"
 >
 {clearCart.isPending ? t("common_loading") : t("cart_clear")}
 </button>
 <Link
 href="/cart"
 className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
 >
 {t("checkout_back_to_cart")}
 </Link>
 </div>
 </div>
 </header>
 );
}

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const [loading, setLoading] = useState<boolean>(true);
 const pathname = usePathname();

 const isWorkspaceRoute =
 pathname === "/seller" ||
 pathname.startsWith("/seller/") ||
 pathname === "/admin" ||
 pathname.startsWith("/admin/") ||
 pathname === "/logistics" ||
 pathname.startsWith("/logistics/") ||
 pathname === "/broker" ||
 pathname.startsWith("/broker/") ||
 pathname === "/account" ||
 pathname.startsWith("/account/");

 const isCheckoutRoute = pathname === "/checkout";

 const hideStorefrontChrome =
 isCheckoutRoute ||
 pathname === "/signin" ||
 pathname === "/signup" ||
 pathname === "/forgot-password" ||
 pathname === "/reset-password" ||
 pathname === "/verify-otp" ||
 pathname === "/choose-role" ||
 pathname === "/verify-phone" ||
 pathname.startsWith("/onboarding/") ||
 pathname.startsWith("/order-success/") ||
 pathname.startsWith("/payment-success/") ||
 pathname.startsWith("/payment-failed/") ||
 isWorkspaceRoute;

 useEffect(() => {
 setTimeout(() => setLoading(false), 1000);
 }, []);

 return (
 <ThemeProvider>
 <NotificationProvider>
 <RuntimeStatus />
 <QueryProvider>
 <AuthProvider>
 <CurrencyProvider>
 <LanguageProvider>
 <CartModalProvider>
 <ModalProvider>
 <PreviewSliderProvider>
 {loading ? (
 <PreLoader />
 ) : (
 <>
 {isCheckoutRoute ? (
 <CheckoutHeader />
 ) : !hideStorefrontChrome ? (
 <Header />
 ) : null}
 {children}
 {!hideStorefrontChrome ? <Footer /> : null}
 {!hideStorefrontChrome ? <QuickViewModal /> : null}
 {!hideStorefrontChrome ? <CartSidebarModal /> : null}
 {!hideStorefrontChrome ? <PreviewSliderModal /> : null}
 {!hideStorefrontChrome ? <MobileBottomNav /> : null}
 <Suspense fallback={null}>
 <GoogleOneTap />
 <AuthPrompt />
 <AppBanner />
 {!hideStorefrontChrome ? <IntentChatWidget /> : null}
 </Suspense>
 </>
 )}
 </PreviewSliderProvider>
 </ModalProvider>
 </CartModalProvider>
 </LanguageProvider>
 </CurrencyProvider>
 </AuthProvider>
 </QueryProvider>
 </NotificationProvider>
 {/* <ScrollToTop /> */}
 </ThemeProvider>
 );
}
