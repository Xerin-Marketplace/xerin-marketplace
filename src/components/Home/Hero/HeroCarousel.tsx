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
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[430px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                Xerin
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Market
                <br />
                Africa
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              Africa&apos;s Premier E-Commerce Marketplace
            </h1>

            <p>
              Connecting buyers, sellers, and Xerin Logistics across Africa
              through trusted digital commerce.
            </p>

            <a
              href={ROUTES.shop}
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
            >
              Shop Now
            </a>
          </div>

          <div>
            <Image
              src="/images/hero/hero-01.png"
              alt="Xerin Market shopping experience"
              width={351}
              height={358}
              style={{ width: "auto", height: "358px" }}
            />
          </div>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[430px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                Sell
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Across
                <br />
                Africa
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              Grow Your Business With Xerin Market
            </h1>

            <p>
              List products, manage orders, and reach customers across African
              markets with a modern seller experience.
            </p>

            <a
              href={ROUTES.sellerRegister}
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
            >
              Start Selling
            </a>
          </div>

          <div>
            <Image
              src="/images/hero/hero-01.png"
              alt="Sell on Xerin Market"
              width={351}
              height={358}
              style={{ width: "auto", height: "358px" }}
            />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
