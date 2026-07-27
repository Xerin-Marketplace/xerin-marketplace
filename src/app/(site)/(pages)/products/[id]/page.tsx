"use client";

import { useParams } from "next/navigation";
import ShopDetails from "@/components/ShopDetails";
import { useProduct } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: apiProduct, isLoading, error } = useProduct(id);

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

  return <ShopDetails product={mapApiProductToUiProduct(apiProduct)} />;
}
