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
    <section className="overflow-hidden bg-[#eef2f7] pb-3 pt-[112px] dark:bg-darkTheme-secondary-bg sm:pb-6 sm:pt-[130px] lg:pt-[145px] lg:pb-10 xl:pt-[154px]">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-6">
        <div className="grid items-stretch gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:gap-5">
          {/* Main hero card - left */}
          <div className="min-w-0">
            <div className="relative z-1 h-full min-h-[300px] overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-darkTheme-card sm:min-h-[390px] lg:min-h-[470px] xl:min-h-[500px]">
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute bottom-0 right-0 -z-1 hidden h-full w-auto object-cover sm:block"
                width={534}
                height={520}
                priority
              />
              <HeroCarousel />
            </div>
          </div>

          {/* Side cards - right. Paid ad when live; Xerin template otherwise. */}
          <div className="hidden lg:grid lg:grid-cols-1 lg:grid-rows-2 lg:gap-4 xl:gap-5">
            {topAd ? (
              <SponsoredHeroCard advertisement={topAd} />
            ) : (
              <div className="relative flex min-h-[132px] items-center overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-darkTheme-card sm:min-h-[190px] sm:p-6 lg:min-h-0 xl:p-7">
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-1.5 text-base font-semibold leading-tight text-dark dark:text-white sm:mb-3 sm:text-lg xl:text-2xl">
                      Top-rated sellers
                    </h2>
                    <p className="mb-1 max-w-[220px] text-xs font-medium leading-5 text-dark-4 dark:text-darkTheme-secondary-muted sm:mb-2 sm:text-sm">
                      Curated stores with buyer protection
                    </p>
                    <div className="mb-2 flex flex-wrap items-baseline gap-2 sm:mb-4">
                      <span className="text-base font-semibold text-blue sm:text-xl xl:text-2xl">Secure</span>
                      <span className="text-base font-medium text-dark-4 dark:text-darkTheme-secondary-muted sm:text-xl xl:text-2xl">
                        Checkout
                      </span>
                    </div>
                    <Link
                      href={ROUTES.shop}
                      className="inline-flex rounded-lg bg-blue px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-dark sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                      Shop Now
                    </Link>
                  </div>

                  <Image
                    src="/images/hero/phoneremove.png"
                    alt="Xerin Market promotion"
                    width={145}
                    height={190}
                    className="hidden h-[145px] w-auto flex-shrink-0 object-contain sm:block lg:h-[150px] xl:h-[175px]"
                  />
                </div>
              </div>
            )}

            {bottomAd ? (
              <SponsoredHeroCard advertisement={bottomAd} />
            ) : (
              <div className="relative flex min-h-[132px] items-center overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-darkTheme-card sm:min-h-[190px] sm:p-6 lg:min-h-0 xl:p-7">
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-1.5 text-base font-semibold leading-tight text-dark dark:text-white sm:mb-3 sm:text-lg xl:text-2xl">
                      Xerin Logistics
                    </h2>
                    <p className="mb-1 max-w-[220px] text-xs font-medium leading-5 text-dark-4 dark:text-darkTheme-secondary-muted sm:mb-2 sm:text-sm">
                      Track every order from dispatch to doorstep
                    </p>
                    <div className="mb-2 flex flex-wrap items-baseline gap-2 sm:mb-4">
                      <span className="text-base font-semibold text-green sm:text-xl xl:text-2xl">Live</span>
                      <span className="text-base font-medium text-dark-4 dark:text-darkTheme-secondary-muted sm:text-xl xl:text-2xl">
                        Updates
                      </span>
                    </div>
                    <Link
                      href="#"
                      className="inline-flex rounded-lg bg-dark px-4 py-2 text-xs font-semibold text-white transition hover:bg-opacity-90 dark:bg-darkTheme-tertiary-bg sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                      Track Order
                    </Link>
                  </div>

                  <Image
                    src="/images/hero/headremove.png"
                    alt="Xerin Logistics"
                    width={145}
                    height={190}
                    className="hidden h-[145px] w-auto flex-shrink-0 object-contain sm:block lg:h-[150px] xl:h-[175px]"
                  />
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
