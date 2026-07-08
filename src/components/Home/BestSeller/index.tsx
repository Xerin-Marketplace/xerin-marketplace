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
        {/* <!-- section title --> */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark dark:text-darkTheme-body-color mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Trending Now
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark dark:text-white">
              Best Sellers Across Africa
            </h2>
          </div>

          <Link
            href={ROUTES.shop}
            className="hidden sm:inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 dark:border-darkTheme-border-color border bg-gray-1 dark:bg-darkTheme-secondary-bg text-dark dark:text-darkTheme-body-color ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent dark:hover:bg-darkTheme-tertiary-bg"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7.5">
          {/* <!-- Best Sellers Across Africa item --> */}
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
