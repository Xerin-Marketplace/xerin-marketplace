"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  advertisementsApi,
  type PublicAdvertisement,
  type PublicAdvertisementPlacement,
} from "@/lib/api/endpoints/advertisements";

const HERO_PLACEMENTS: PublicAdvertisementPlacement[] = [
  "hero_side_top",
  "hero_side_bottom",
];

export const useHomepageAdvertisementSlots = () => {
  const [now, setNow] = useState(() => Date.now());

  const query = useQuery({
    queryKey: ["advertisements", "homepage-slots"],
    queryFn: ({ signal }) => advertisementsApi.homepageSlots(signal),
    retry: 1,
    staleTime: 0,
    // Future campaigns are deliberately not returned by the public API, so a
    // small refresh cadence discovers newly-started campaigns without reload.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const rawByPlacement = useMemo(() => {
    const map = new Map<PublicAdvertisementPlacement, PublicAdvertisement>();
    for (const slot of query.data ?? []) {
      if (slot.advertisement) {
        map.set(slot.placement, slot.advertisement);
      }
    }
    return map;
  }, [query.data]);

  // At the exact nearest ends_at instant, force a render and refresh. The local
  // time filter below removes the expired creative immediately even if the
  // network request takes a moment to complete.
  useEffect(() => {
    const activeAds = HERO_PLACEMENTS.map((placement) =>
      rawByPlacement.get(placement),
    ).filter(Boolean) as PublicAdvertisement[];

    if (!activeAds.length) return;

    const futureEnds = activeAds
      .map((ad) => new Date(ad.ends_at).getTime())
      .filter((end) => Number.isFinite(end) && end > Date.now());

    if (!futureEnds.length) return;

    const nearestEnd = Math.min(...futureEnds);
    const delay = Math.min(Math.max(nearestEnd - Date.now() + 25, 25), 2_147_000_000);

    const timer = window.setTimeout(() => {
      setNow(Date.now());
      void query.refetch();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [rawByPlacement, query.refetch]);

  const getLiveAd = (placement: PublicAdvertisementPlacement) => {
    const ad = rawByPlacement.get(placement) ?? null;
    if (!ad) return null;

    const startsAt = new Date(ad.starts_at).getTime();
    const endsAt = new Date(ad.ends_at).getTime();

    if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) return null;
    return startsAt <= now && endsAt > now ? ad : null;
  };

  return {
    ...query,
    topAd: getLiveAd("hero_side_top"),
    bottomAd: getLiveAd("hero_side_bottom"),
  };
};
