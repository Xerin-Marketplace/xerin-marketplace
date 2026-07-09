"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import { ThemeProvider } from "../context/ThemeContext";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="bg-body-bg dark:bg-darkTheme-bg text-dark dark:text-darkTheme-text">
        <ThemeProvider>
          <ReduxProvider>
            <CartModalProvider>
              <ModalProvider>
                <PreviewSliderProvider>
                  {loading ? (
                    <PreLoader />
                  ) : (
                    <>
                      <Header />
                      {children}
                      <Footer />
                      <QuickViewModal />
                      <CartSidebarModal />
                      <PreviewSliderModal />
                    </>
                  )}
                </PreviewSliderProvider>
              </ModalProvider>
            </CartModalProvider>
          </ReduxProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
