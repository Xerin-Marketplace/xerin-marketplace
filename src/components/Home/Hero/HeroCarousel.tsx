"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MegaphoneIcon,
} from "@hugeicons/core-free-icons";
import {
  advertisementsApi,
  type PublicAdvertisement,
} from "@/lib/api/endpoints/advertisements";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import HeroCountdown from "./HeroCountdown";
import { useHeroSlides, type HeroSlide, type HeroPlatformSlide } from "./useHeroSlides";

const isExternal = (url: string) => /^https?:\/\//i.test(url);

const impressionKey = (id: string) => `xerin_hero_impression:${id}`;

const trackImpressionOnce = (adId: string) => {
  if (typeof window === "undefined") return;
  if (window.sessionStorage.getItem(impressionKey(adId))) return;
  window.sessionStorage.setItem(impressionKey(adId), "1");

  let sessionId = window.sessionStorage.getItem("xerin_ad_session_id");
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem("xerin_ad_session_id", sessionId);
  }

  void advertisementsApi
    .trackImpression(adId, {
      session_id: sessionId,
      page_path: window.location.pathname,
    })
    .catch(() => {});
};

const trackAdClick = (adId: string) => {
  if (typeof window === "undefined") return;
  void advertisementsApi
    .trackClick(adId, {
      session_id: window.sessionStorage.getItem("xerin_ad_session_id") || "anon",
      page_path: window.location.pathname,
    })
    .catch(() => {});
};

function CampaignSlide({ ad, priority }: { ad: PublicAdvertisement; priority: boolean }) {
  const href = ad.target_url || "/search";
  const desktopImage = resolveProductImageUrl(ad.image_url);
  const mobileImage = ad.mobile_image_url
    ? resolveProductImageUrl(ad.mobile_image_url)
    : null;

  const cta = (
    <Link
      href={href}
      target={isExternal(href) ? "_blank" : undefined}
      rel={isExternal(href) ? "noopener noreferrer sponsored" : "sponsored"}
      onClick={() => trackAdClick(ad.id)}
      className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary sm:mt-6 sm:px-7 sm:py-3 sm:text-sm"
    >
      {ad.cta_label || "Shop Now"}
    </Link>
  );

  return (
    <div className="relative flex h-full min-h-[410px] flex-col justify-end overflow-hidden sm:min-h-[410px] lg:min-h-[470px] xl:min-h-[500px]">
      {mobileImage ? (
        <picture>
          <source media="(max-width: 640px)" srcSet={mobileImage} />
          <img
            src={desktopImage}
            alt={ad.alt_text || ad.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
          />
        </picture>
      ) : (
        <img
          src={desktopImage}
          alt={ad.alt_text || ad.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />

      <div className="relative z-10 p-5 pb-10 sm:p-9 sm:pb-12 lg:p-11 lg:pb-14">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-card/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          <HugeiconsIcon icon={MegaphoneIcon} size={12} />
          Sponsored
        </span>

        <h1 className="max-w-[560px] text-xl font-bold leading-[1.15] text-white sm:text-3xl lg:text-[34px] xl:text-[40px]">
          {ad.title}
        </h1>

        {ad.description && (
          <p className="mt-2 max-w-[520px] text-xs leading-5 text-white/75 sm:text-sm sm:leading-6 xl:text-base">
            {ad.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {cta}
          <HeroCountdown endsAt={ad.ends_at} />
        </div>
      </div>
    </div>
  );
}

function PlatformSlide({ slide, priority }: { slide: HeroPlatformSlide; priority: boolean }) {
  const external = isExternal(slide.ctaHref);

  return (
    <div className="grid h-full min-h-[410px] grid-cols-1 items-center sm:min-h-[410px] sm:grid-cols-[minmax(0,1.35fr)_minmax(200px,0.65fr)] lg:min-h-[470px] xl:min-h-[500px]">
      <div className="order-2 px-5 pb-8 pt-2 text-center sm:order-1 sm:px-8 sm:py-10 sm:text-left lg:px-10 xl:px-12">
        <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:mb-5">
          {slide.eyebrow}
        </span>

        <h1 className="mb-2 max-w-[650px] text-lg font-semibold leading-[1.15] text-foreground sm:mb-3 sm:text-3xl lg:text-[34px] xl:text-[38px]">
          {slide.headline}
        </h1>

        <p className="max-w-[650px] line-clamp-2 text-xs leading-5 text-muted-foreground sm:line-clamp-none sm:text-base sm:leading-6 xl:text-[17px]">
          {slide.sub}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:mt-7 sm:justify-start">
          <Link
            href={slide.ctaHref}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="inline-flex rounded-lg bg-orange px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary sm:px-7 sm:py-3 sm:text-sm"
          >
            {slide.ctaLabel}
          </Link>
          {slide.secondaryHref && slide.secondaryLabel && (
            <Link
              href={slide.secondaryHref}
              className="inline-flex rounded-lg border border-border px-5 py-2.5 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary sm:px-6 sm:py-3 sm:text-sm"
            >
              {slide.secondaryLabel}
            </Link>
          )}
        </div>
      </div>

      <div className="order-1 flex items-center justify-center px-3 pt-5 sm:order-2 sm:h-full sm:px-3 sm:py-0 lg:px-5">
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          width={351}
          height={358}
          className="h-[145px] w-auto object-contain sm:h-[235px] lg:h-[300px] xl:h-[340px]"
          sizes="(max-width: 640px) 125px, (max-width: 1024px) 250px, 340px"
          priority={priority}
        />
      </div>
    </div>
  );
}

const HeroCarousel = () => {
  const { slides } = useHeroSlides();
  const [activeIndex, setActiveIndex] = useState(0);
  const trackedRef = useRef<Set<string>>(new Set());

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const handleSlideChange = (swiper: SwiperType) => {
    const index = swiper.realIndex;
    setActiveIndex(index);
    const slide = slides[index];
    if (slide?.kind === "campaign" && !trackedRef.current.has(slide.ad.id)) {
      trackedRef.current.add(slide.ad.id);
      trackImpressionOnce(slide.ad.id);
    }
  };

  // Track the first campaign slide as soon as it is the active one.
  const firstSlide = slides[0];
  if (firstSlide?.kind === "campaign" && activeIndex === 0 && !trackedRef.current.has(firstSlide.ad.id)) {
    trackedRef.current.add(firstSlide.ad.id);
    trackImpressionOnce(firstSlide.ad.id);
  }

  return (
    <div className="group/hero relative h-full">
      <Swiper
        spaceBetween={30}
        centeredSlides
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={700}
        loop={slides.length > 1}
        autoplay={
          prefersReducedMotion || slides.length <= 1
            ? false
            : {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        navigation={{
          prevEl: ".hero-nav-prev",
          nextEl: ".hero-nav-next",
        }}
        pagination={{ clickable: true }}
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        onSlideChange={handleSlideChange}
        className="hero-carousel h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.kind === "campaign" ? `ad-${slide.ad.id}` : `p-${slide.id}`}
            className="h-auto"
          >
            {slide.kind === "campaign" ? (
              <CampaignSlide ad={slide.ad} priority={index === 0} />
            ) : (
              <PlatformSlide slide={slide} priority={index === 0} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="hero-nav-prev absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur-sm transition hover:border-primary hover:text-primary group-hover/hero:flex lg:flex"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="hero-nav-next absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur-sm transition hover:border-primary hover:text-primary group-hover/hero:flex lg:flex"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </button>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
