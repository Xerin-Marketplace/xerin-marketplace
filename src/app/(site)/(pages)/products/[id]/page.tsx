"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ShopDetails from "@/components/ShopDetails";
import { useProduct } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import { discoveryApi } from "@/lib/api/endpoints/discovery";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import { useAuthStore } from "@/store/useAuthStore";
import RelatedProducts from "@/components/ProductDiscovery/RelatedProducts";

export default function ProductDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: apiProduct, isLoading, error } = useProduct(id);

  useEffect(() => {
    const ref = searchParams.get("ref")?.trim();
    if (id && ref && typeof window !== "undefined") {
      window.localStorage.setItem(`xerin_broker_ref_${id}`, ref);
      const visitorStorageKey = "xerin_broker_analytics_visitor";
      let visitorKey = window.localStorage.getItem(visitorStorageKey);
      if (!visitorKey) {
        visitorKey = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        window.localStorage.setItem(visitorStorageKey, visitorKey);
      }
      void brokersApi.trackReferralClick(ref, { product_id: id, visitor_key: visitorKey, source: "product_detail" }).catch(() => {
        // Referral analytics must never block product browsing.
      });
    }
  }, [id, searchParams]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;

    void discoveryApi.recordView(id, {
      source: searchParams.get("source") || "product_detail",
      search_query: searchParams.get("q"),
    }).catch(() => {
      // Product-view analytics must never block the shopping experience.
    });
  }, [id, isAuthenticated, searchParams]);

  if (isLoading) {
    return (
      <section className="py-20 text-center">
        <p className="text-dark dark:text-white">Loading product...</p>
      </section>
    );
  }

  if (error || !apiProduct) {
    return (
      <section className="py-20 text-center">
        <p className="text-dark dark:text-white">Product not found.</p>
      </section>
    );
  }

  return (
    <>
      <ShopDetails product={mapApiProductToUiProduct(apiProduct)} />
      <RelatedProducts productId={id} />
    </>
  );
}
