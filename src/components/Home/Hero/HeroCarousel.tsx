"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import { ROUTES } from "@/constants/links";

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center flex-col-reverse sm:flex-row">
          <div className="max-w-[430px] py-5 sm:py-10 lg:py-24.5 px-4 sm:pl-7.5 lg:pl-12.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-4 sm:mb-7.5">
              <span className="block font-semibold text-2xl sm:text-heading-3 lg:text-heading-1 text-blue">
                Xerin
              </span>
              <span className="block text-dark text-xs sm:text-sm lg:text-custom-1 lg:leading-[24px]">
                Market
                <br />
                Africa
              </span>
            </div>

            <h1 className="font-semibold text-dark text-base sm:text-xl lg:text-3xl mb-2 sm:mb-3 leading-tight">
              Africa&apos;s Premier E-Commerce Marketplace
            </h1>

            <p className="text-2xs sm:text-sm lg:text-base text-dark-4 dark:text-darkTheme-secondary-muted">
              Connecting buyers, sellers, and Xerin Logistics across Africa
              through trusted digital commerce.
            </p>

            <a
              href={ROUTES.shop}
              className="inline-flex font-medium text-white text-2xs sm:text-custom-sm rounded-md bg-dark py-2 sm:py-3 px-5 sm:px-9 ease-out duration-200 hover:bg-blue mt-4 sm:mt-10"
            >
              Shop Now
            </a>
          </div>

          <div className="flex-shrink-0">
            <Image
              src="/images/hero/headphon.png"
              alt="Xerin Market shopping experience"
              width={351}
              height={358}
              className="object-contain"
              style={{ width: "auto", height: "180px" }}
              sizes="(max-width: 640px) 180px, 358px"
            />
          </div>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="flex items-center flex-col-reverse sm:flex-row">
          <div className="max-w-[430px] py-5 sm:py-10 lg:py-26 px-4 sm:pl-7.5 lg:pl-12.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-4 sm:mb-7.5">
              <span className="block font-semibold text-2xl sm:text-heading-3 lg:text-heading-1 text-blue">
                Sell
              </span>
              <span className="block text-dark text-xs sm:text-sm lg:text-custom-1 lg:leading-[24px]">
                Across
                <br />
                Africa
              </span>
            </div>

            <h1 className="font-semibold text-dark text-base sm:text-xl lg:text-3xl mb-2 sm:mb-3 leading-tight">
              Grow Your Business With Xerin Market
            </h1>

            <p className="text-2xs sm:text-sm lg:text-base text-dark-4 dark:text-darkTheme-secondary-muted">
              List products, manage orders, and reach customers across African
              markets with a modern seller experience.
            </p>

            <a
              href={ROUTES.sellerRegister}
              className="inline-flex font-medium text-white text-2xs sm:text-custom-sm rounded-md bg-dark py-2 sm:py-3 px-5 sm:px-9 ease-out duration-200 hover:bg-blue mt-4 sm:mt-10"
            >
              Start Selling
            </a>
          </div>

          <div className="flex-shrink-0">
            <Image
              src="/images/hero/Tshirtremove.png"
              alt="Sell on Xerin Market"
              width={351}
              height={358}
              className="object-contain"
              style={{ width: "auto", height: "180px" }}
              sizes="(max-width: 640px) 180px, 358px"
            />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
