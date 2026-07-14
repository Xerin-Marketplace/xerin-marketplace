"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
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

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();

  const hideStorefrontChrome =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/seller/register" ||
    pathname === "/admin/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="bg-body-bg dark:bg-darkTheme-bg">
        <ThemeProvider>
          <NotificationProvider>
            <QueryProvider>
              <AuthProvider>
                <CartModalProvider>
                  <ModalProvider>
                    <PreviewSliderProvider>
                      {loading ? (
                        <PreLoader />
                      ) : (
                        <>
                          {!hideStorefrontChrome ? <Header /> : null}
                          {children}
                          {!hideStorefrontChrome ? <Footer /> : null}
                          <QuickViewModal />
                          <CartSidebarModal />
                          <PreviewSliderModal />
                        </>
                      )}
                    </PreviewSliderProvider>
                  </ModalProvider>
                </CartModalProvider>
              </AuthProvider>
            </QueryProvider>
          </NotificationProvider>
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
