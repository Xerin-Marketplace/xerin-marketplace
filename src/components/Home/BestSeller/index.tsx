import React from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import shopData from "@/components/Shop/shopData";
import { ROUTES } from "@/constants/links";

const BestSeller = () => {
  return (
    <section className="overflow-hidden pt-15 lg:pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-7 rounded-[28px] border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card px-5 sm:px-8 lg:px-10 py-6 sm:py-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange/10 px-4 py-2 text-sm font-medium text-orange mb-4">
                <Image
                  src="/images/icons/icon-07.svg"
                  alt="Trending now"
                  width={16}
                  height={16}
                />
                Trending now
              </span>
              <h2 className="font-semibold text-2xl sm:text-3xl xl:text-heading-4 text-dark dark:text-white mb-3">
                Best Sellers Across Africa
              </h2>
              <p className="max-w-[620px] text-dark-4 dark:text-darkTheme-secondary-muted">
                Popular items shoppers are actively choosing right now, with clear pricing and a faster path to checkout.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={ROUTES.shop}
                className="inline-flex font-medium text-custom-sm py-2.5 px-6 rounded-md bg-dark dark:bg-darkTheme-tertiary-bg text-white ease-out duration-200 hover:bg-opacity-90"
              >
                Shop trending items
              </Link>

              <Link
                href={ROUTES.shop}
                className="inline-flex font-medium text-custom-sm py-2.5 px-6 rounded-md border-gray-3 dark:border-darkTheme-border-color border bg-gray-1 dark:bg-darkTheme-secondary-bg text-dark dark:text-darkTheme-body-color ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent dark:hover:bg-darkTheme-tertiary-bg"
              >
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7.5">
          {shopData.slice(1, 7).map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        <div className="text-center mt-10 lg:mt-12.5">
          <Link
            href={ROUTES.shop}
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 dark:border-darkTheme-border-color border bg-gray-1 dark:bg-darkTheme-secondary-bg text-dark dark:text-darkTheme-body-color ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent dark:hover:bg-darkTheme-tertiary-bg"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
