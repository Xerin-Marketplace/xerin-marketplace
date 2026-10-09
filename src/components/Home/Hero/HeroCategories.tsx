"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/useProducts";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PackageIcon } from "@hugeicons/core-free-icons";

const HeroCategories = () => {
  const { data: categories = [] } = useCategories();
  const roots = categories.filter((c) => !c.parent_id).slice(0, 11);

  if (roots.length === 0) return null;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">Categories for you</h2>
      </div>
      <nav className="no-scrollbar flex-1 overflow-y-auto py-1.5">
        {roots.map((category) => {
          const image = category.thumbnail_url || category.image_url;
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex items-center gap-2.5 px-4 py-2 transition hover:bg-muted"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                {image ? (
                  <Image
                    src={image}
                    alt={category.name}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <HugeiconsIcon icon={PackageIcon} size={15} />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90 group-hover:text-primary">
                {category.name}
              </span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                className="shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default HeroCategories;
