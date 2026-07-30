"use client";

import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SingleGridItem from "@/components/Shop/SingleGridItem";
import { useProducts } from "@/lib/products";

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const categoryId = params.get("category_id")?.trim() || undefined;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = 20;
  const result = useProducts({
    search: query || undefined,
    category_id: categoryId,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  });

  return (
    <>
      <Breadcrumb title="Search" pages={["Search"]} />
      <section className="bg-gray-2 py-16 dark:bg-darkTheme-bg">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8">
          <h1 className="mb-8 text-2xl font-semibold">
            {query ? `Search results for “${query}”` : "Search products"}
          </h1>
          {result.isLoading ? (
            <p className="rounded-xl bg-white p-12 text-center">Searching products…</p>
          ) : result.error ? (
            <p className="rounded-xl bg-white p-12 text-center text-red">Search could not be completed. Please retry.</p>
          ) : !result.products.length ? (
            <p className="rounded-xl bg-white p-12 text-center">No products matched your search.</p>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {result.products.map((product) => <SingleGridItem key={product.id} item={product} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
