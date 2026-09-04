"use client";

import React from "react";
import HeroCarousel from "./HeroCarousel";
import Image from "next/image";
import { ROUTES } from "@/constants/links";
import Link from "next/link";
import SponsoredHeroCard from "./SponsoredHeroCard";
import { useHomepageAdvertisementSlots } from "@/hooks/useAdvertisements";

const Hero = () => {
  const { topAd, bottomAd } = useHomepageAdvertisementSlots();

  return (
    <section className="overflow-hidden bg-[#eef2f7] pb-4 pt-[90px] dark:bg-darkTheme-secondary-bg sm:pb-6 sm:pt-[118px] lg:pb-9 lg:pt-[142px] xl:pt-[150px]">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8 xl:px-10 2xl:px-6">
        <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.82fr)] xl:gap-5">
          <div className="min-w-0">
            <div className="relative z-1 h-full min-h-[410px] overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-darkTheme-card sm:min-h-[410px] lg:min-h-[470px] xl:min-h-[500px]">
              <Image src="/images/hero/hero-bg.png" alt="hero background" className="absolute bottom-0 right-0 -z-1 hidden h-full w-auto object-cover sm:block" width={534} height={520} priority />
              <HeroCarousel />
            </div>
          </div>

          <div className="no-scrollbar hidden snap-x gap-3 overflow-x-auto pb-1 sm:flex lg:grid lg:grid-cols-1 lg:grid-rows-2 lg:overflow-visible lg:pb-0 xl:gap-5">
            {topAd ? (
              <div className="min-w-[82vw] snap-start sm:min-w-[48%] lg:min-w-0"><SponsoredHeroCard advertisement={topAd} /></div>
            ) : (
              <div className="relative flex min-h-[160px] min-w-[82vw] snap-start items-center overflow-hidden rounded-2xl bg-white p-4 shadow-sm dark:bg-darkTheme-card sm:min-w-[48%] sm:p-5 lg:min-h-0 lg:min-w-0 xl:p-7">
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="mb-2 inline-flex rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange">Shop confidently</span>
                    <h2 className="text-lg font-bold leading-tight text-dark dark:text-white xl:text-2xl">Trusted marketplace</h2>
                    <p className="mt-1.5 max-w-[230px] text-xs leading-5 text-dark-4 sm:text-sm">Seller listings, protected checkout and order tracking in one place.</p>
                    <Link href={ROUTES.shop} className="mt-3 inline-flex rounded-lg bg-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e95f23] sm:text-sm">Shop Now</Link>
                  </div>
                  <Image src="/images/hero/phoneremove.png" alt="Xerin Market promotion" width={145} height={190} className="h-[120px] w-auto shrink-0 object-contain sm:h-[135px] xl:h-[170px]" />
                </div>
              </div>
            )}

            {bottomAd ? (
              <div className="min-w-[82vw] snap-start sm:min-w-[48%] lg:min-w-0"><SponsoredHeroCard advertisement={bottomAd} /></div>
            ) : (
              <div className="relative flex min-h-[160px] min-w-[82vw] snap-start items-center overflow-hidden rounded-2xl bg-[#15191f] p-4 shadow-sm sm:min-w-[48%] sm:p-5 lg:min-h-0 lg:min-w-0 xl:p-7">
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="mb-2 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange">Delivery visibility</span>
                    <h2 className="text-lg font-bold leading-tight text-white xl:text-2xl">Xerin logistics</h2>
                    <p className="mt-1.5 max-w-[230px] text-xs leading-5 text-white/70 sm:text-sm">Follow your order from seller preparation to your doorstep.</p>
                    <Link href={ROUTES.trackOrder} className="mt-3 inline-flex rounded-lg border border-white/30 px-4 py-2 text-xs font-bold text-white transition hover:border-orange hover:text-orange sm:text-sm">Track Order</Link>
                  </div>
                  <Image src="/images/hero/headremove.png" alt="Xerin Logistics" width={145} height={190} className="h-[115px] w-auto shrink-0 object-contain sm:h-[130px] xl:h-[165px]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
