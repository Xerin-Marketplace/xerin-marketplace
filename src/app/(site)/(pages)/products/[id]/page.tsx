"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import ShopDetails from "@/components/ShopDetails";
import { useProduct } from "@/hooks/useProducts";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: apiProduct, isLoading, error } = useProduct(id);
  const updateproductDetails = useProductDetailsStore((state) => state.updateproductDetails);

  useEffect(() => {
    if (apiProduct) {
      updateproductDetails(mapApiProductToUiProduct(apiProduct));
    }
  }, [apiProduct, updateproductDetails]);

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

  return <ShopDetails />;
}
