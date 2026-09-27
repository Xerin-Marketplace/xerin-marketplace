"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge02Icon,
  Store01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { getPublicSeller } from "@/lib/api/endpoints/store";
import StarRating from "@/components/Common/StarRating";

const resolveImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `/backend-uploads${url.startsWith("/") ? url : `/${url}`}`;
};

const SellerCard = ({ sellerId }: { sellerId: string | number }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-seller", sellerId],
    queryFn: () => getPublicSeller(sellerId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="mt-4 animate-pulse rounded-2xl border border-border bg-card p-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="mt-3 h-10 w-10 rounded-full bg-muted" />
      </div>
    );
  }
  if (isError || !data) return null;

  const logo = resolveImageUrl(data.store?.logo_url);
  const name = data.store?.name || data.business_name;
  const location = [data.store?.district, data.store?.region]
    .filter(Boolean)
    .join(", ");
  const memberYear = data.member_since
    ? new Date(data.member_since).getFullYear()
    : null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        Sold by
      </p>

      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {logo ? (
            <Image
              src={logo}
              alt={name}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <HugeiconsIcon
              icon={Store01Icon}
              size={20}
              className="text-muted-foreground"
            />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-foreground">
              {name}
            </span>
            {data.verified && (
              <span
                title="Verified seller — identity and business documents reviewed by Xerin"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-light-6 px-1.5 py-0.5 text-[10px] font-bold text-green-dark"
              >
                <HugeiconsIcon icon={CheckmarkBadge02Icon} size={11} />
                Verified
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            {data.rating != null && data.review_count > 0 ? (
              <StarRating rating={data.rating} reviewCount={data.review_count} size={12} />
            ) : (
              <span>New seller</span>
            )}
            {location && <span>· {location}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{data.products_count} product{data.products_count === 1 ? "" : "s"}</span>
        {memberYear && <span>On Xerin since {memberYear}</span>}
      </div>

      {data.store?.slug && (
        <Link
          href={`/stores/${data.store.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Visit store
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </Link>
      )}
    </div>
  );
};

export default SellerCard;
