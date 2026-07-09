import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4] dark:bg-darkTheme-secondary-bg">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-4 md:gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white dark:bg-darkTheme-card overflow-hidden shadow-sm">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-4 md:gap-5">
              <div className="w-full relative rounded-[10px] bg-white dark:bg-darkTheme-card p-4 sm:p-7.5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="max-w-[153px] font-semibold text-dark dark:text-white text-xl mb-4">
                      Top-rated sellers
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 dark:text-darkTheme-secondary-muted text-custom-sm mb-1.5">
                        curated stores with buyer protection
                      </p>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-heading-5 text-blue">
                          Secure
                        </span>
                        <span className="font-medium text-2xl text-dark-4 dark:text-darkTheme-secondary-muted">
                          Checkout
                        </span>
                      </span>
                    </div>

                    <Link
                      href={ROUTES.shop}
                      className="inline-flex mt-4 font-medium text-custom-sm py-2 px-5 rounded-md bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
                    >
                      Shop Now
                    </Link>
                  </div>

                  <div className="flex-shrink-0">
                    <Image
                      src="/images/hero/hero-02.png"
                      alt="Xerin Market promotion"
                      width={123}
                      height={161}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full relative rounded-[10px] bg-white dark:bg-darkTheme-card p-4 sm:p-7.5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="max-w-[153px] font-semibold text-dark dark:text-white text-xl mb-4">
                      Xerin Logistics
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 dark:text-darkTheme-secondary-muted text-custom-sm mb-1.5">
                        track every order from dispatch to doorstep
                      </p>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-heading-5 text-green">
                          Live
                        </span>
                        <span className="font-medium text-2xl text-dark-4 dark:text-darkTheme-secondary-muted">
                          Updates
                        </span>
                      </span>
                    </div>

                    <Link
                      href={ROUTES.trackOrder}
                      className="inline-flex mt-4 font-medium text-custom-sm py-2 px-5 rounded-md bg-dark dark:bg-darkTheme-tertiary-bg text-white ease-out duration-200 hover:bg-opacity-90"
                    >
                      Track Order
                    </Link>
                  </div>

                  <div className="flex-shrink-0">
                    <Image
                      src="/images/hero/hero-01.png"
                      alt="Xerin Market promotion"
                      width={123}
                      height={161}
                      className="object-contain"
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
