import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/seller/",
        "/account/",
        "/broker/",
        "/logistics/",
        "/api/",
        "/cart",
        "/checkout",
        "/orders",
        "/my-account",
        "/wishlist",
        "/signin",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-otp",
        "/choose-role",
        "/onboarding/",
        "/order-success/",
        "/payment-success/",
        "/payment-failed/",
        "/search",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
