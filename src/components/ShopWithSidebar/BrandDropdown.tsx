"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, CheckIcon } from "@hugeicons/core-free-icons";
import { getBrands } from "@/lib/api/endpoints/products";
import type { Brand } from "@/types/api/product";

const BrandDropdown = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selected = searchParams.get("brand_id") || "";
  const [brands, setBrands] = useState<Brand[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let active = true;
    getBrands()
      .then((rows) => {
        if (active) setBrands(rows);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const select = (id: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id) next.set("brand_id", id);
    else next.delete("brand_id");
    next.delete("page");
    router.push(`/shop-with-sidebar?${next.toString()}`);
  };

  if (!brands.length) return null;

  return (
    <div className="bg-card shadow-1 rounded-lg py-4 px-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between font-medium text-foreground"
      >
        Brand
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto">
          {brands.map((brand) => {
            const active = selected === String(brand.id);
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => select(active ? null : String(brand.id))}
                className={`group flex items-center gap-2 text-left text-custom-sm hover:text-primary ${
                  active ? "text-primary" : "text-foreground"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    active ? "border-primary bg-blue text-white" : "border-border bg-card"
                  }`}
                >
                  {active && <HugeiconsIcon icon={CheckIcon} size={11} />}
                </span>
                {brand.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandDropdown;
