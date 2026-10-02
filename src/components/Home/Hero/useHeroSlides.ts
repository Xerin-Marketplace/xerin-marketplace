"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  advertisementsApi,
  type PublicAdvertisement,
} from "@/lib/api/endpoints/advertisements";
import { ROUTES } from "@/constants/links";
import { useAuthStore } from "@/store/useAuthStore";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.xerinmarket.com";

export type HeroPlatformSlide = {
  kind: "platform";
  id: string;
  eyebrow: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image: string;
  imageAlt: string;
};

export type HeroSlide =
  | { kind: "campaign"; ad: PublicAdvertisement }
  | HeroPlatformSlide;

/**
 * Builds the hero slide deck.
 *
 * Campaign slides come straight from the live advertisements API
 * (placement: homepage_banner) — admins control title, copy, imagery,
 * CTA, schedule and ordering from the backend. When no campaign is
 * live, the deck falls back to platform slides (brand, app promo,
 * account nudge, delivery) which contain no fabricated offers,
 * prices, discounts or product data.
 */
export const useHeroSlides = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const query = useQuery({
    queryKey: ["hero-campaigns"],
    queryFn: async ({ signal }) => {
      const slots = await advertisementsApi.slotsFor(signal, [
        "homepage_banner",
      ]);
      return slots
        .map((s) => s.advertisement)
        .filter((a): a is PublicAdvertisement => Boolean(a))
        .filter((a) => new Date(a.ends_at).getTime() > Date.now());
    },
    retry: 1,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const slides = useMemo<HeroSlide[]>(() => {
    const campaigns: HeroSlide[] = (query.data ?? []).map((ad) => ({
      kind: "campaign" as const,
      ad,
    }));

    const platform: HeroSlide[] = [
      {
        kind: "platform",
        id: "brand",
        eyebrow: "Xerin Mart",
        headline: "We're connecting you to everything you need",
        sub: "Thousands of products from sellers across Africa — electronics, fashion, home goods and more, all in one place.",
        ctaLabel: "Start Shopping",
        ctaHref: ROUTES.shop,
        secondaryLabel: "Browse Categories",
        secondaryHref: ROUTES.shop,
        image: "/images/hero/headphon.png",
        imageAlt: "Shop thousands of products on Xerin Mart",
      },
      {
        kind: "platform",
        id: "delivery",
        eyebrow: "Xerin Express",
        headline: "Connecting sellers to your doorstep",
        sub: "Every order comes with a real delivery quote and live tracking — from the seller's hands to yours.",
        ctaLabel: "Track Your Order",
        ctaHref: ROUTES.trackOrder,
        image: "/images/hero/hero-01.png",
        imageAlt: "Xerin Express delivery",
      },
      {
        kind: "platform",
        id: "app",
        eyebrow: "Xerin App",
        headline: "Your store, in your pocket",
        sub: "Shop faster, track orders instantly and never miss a deal — wherever you are.",
        ctaLabel: "Get it on Google Play",
        ctaHref: PLAY_STORE_URL,
        secondaryLabel: "Continue shopping",
        secondaryHref: ROUTES.shop,
        image: "/images/hero/phoneremove.png",
        imageAlt: "Xerin Mart mobile app",
      },
    ];

    if (hasHydrated && !isAuthenticated) {
      platform.splice(1, 0, {
        kind: "platform",
        id: "account",
        eyebrow: "Join Xerin",
        headline: "One account, everything connected",
        sub: "Save your favorites, track orders and shop across every category with a single account.",
        ctaLabel: "Create Account",
        ctaHref: ROUTES.signup,
        secondaryLabel: "Sign In",
        secondaryHref: ROUTES.signin,
        image: "/images/hero/Tshirtremove.png",
        imageAlt: "Create a Xerin Mart account",
      });
    }

    // Campaigns always lead — they are the live, scheduled content.
    return [...campaigns, ...platform];
  }, [query.data, hasHydrated, isAuthenticated]);

  return {
    slides,
    isLoading: query.isLoading,
    campaignCount: query.data?.length ?? 0,
  };
};
