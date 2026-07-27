import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import { ROUTES } from "@/constants/links";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-6 sm:pb-10 lg:pb-12.5 xl:pb-15 pt-32 sm:pt-40 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4] dark:bg-darkTheme-secondary-bg">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-5">
          {/* <!-- Hero Carousel --> */}
          <div className="lg:max-w-[757px] xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white dark:bg-darkTheme-card overflow-hidden shadow-sm">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1 hidden sm:block"
                width={534}
                height={520}
                priority
              />

              <HeroCarousel />
            </div>
          </div>

          {/* <!-- Hero Side Cards --> */}
          <div className="lg:max-w-[393px] xl:max-w-[393px] w-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 md:gap-5">
              <div className="relative rounded-[10px] bg-white dark:bg-darkTheme-card p-3 sm:p-5 lg:p-7.5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-dark dark:text-white text-sm sm:text-lg lg:text-xl mb-2 sm:mb-4 leading-tight">
                      Top-rated sellers
                    </h2>

                    <p className="font-medium text-dark-4 dark:text-darkTheme-secondary-muted text-2xs sm:text-custom-sm mb-1.5 hidden sm:block">
                      curated stores with buyer protection
                    </p>
                    <span className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                      <span className="font-medium text-sm sm:text-heading-5 text-blue">
                        Secure
                      </span>
                      <span className="font-medium text-base sm:text-2xl text-dark-4 dark:text-darkTheme-secondary-muted">
                        Checkout
                      </span>
                    </span>

                    <Link
                      href={ROUTES.shop}
                      className="inline-flex font-medium text-2xs sm:text-custom-sm py-1.5 sm:py-2 px-3 sm:px-5 rounded-md bg-blue text-white ease-out duration-200 hover:bg-blue-dark mt-2 sm:mt-4"
                    >
                      Shop Now
                    </Link>
                  </div>

                  <div className="flex-shrink-0 hidden sm:block">
                    <Image
                      src="/images/hero/hero-02.png"
                      alt="Xerin Market promotion"
                      width={123}
                      height={161}
                      className="object-contain"
                      style={{ width: "auto", height: "120px" }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative rounded-[10px] bg-white dark:bg-darkTheme-card p-3 sm:p-5 lg:p-7.5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-dark dark:text-white text-sm sm:text-lg lg:text-xl mb-2 sm:mb-4 leading-tight">
                      Xerin Logistics
                    </h2>

                    <p className="font-medium text-dark-4 dark:text-darkTheme-secondary-muted text-2xs sm:text-custom-sm mb-1.5 hidden sm:block">
                      track every order from dispatch to doorstep
                    </p>
                    <span className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                      <span className="font-medium text-sm sm:text-heading-5 text-green">
                        Live
                      </span>
                      <span className="font-medium text-base sm:text-2xl text-dark-4 dark:text-darkTheme-secondary-muted">
                        Updates
                      </span>
                    </span>

                    <Link
                      href="#"
                      className="inline-flex font-medium text-2xs sm:text-custom-sm py-1.5 sm:py-2 px-3 sm:px-5 rounded-md bg-dark dark:bg-darkTheme-tertiary-bg text-white ease-out duration-200 hover:bg-opacity-90 mt-2 sm:mt-4"
                    >
                      Track Order
                    </Link>
                  </div>

                  <div className="flex-shrink-0 hidden sm:block">
                    <Image
                      src="/images/hero/hero-01.png"
                      alt="Xerin Market promotion"
                      width={123}
                      height={161}
                      className="object-contain"
                      style={{ width: "auto", height: "120px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
