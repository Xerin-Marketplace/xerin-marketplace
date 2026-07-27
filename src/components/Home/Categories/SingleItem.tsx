import { Category } from "@/types/category";
import React from "react";
import { ROUTES } from "@/constants/links";
import Image from "next/image";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <a
      href={ROUTES.shop}
      className="group flex h-full flex-col items-center rounded-xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-2.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-2 sm:mb-4 flex h-[70px] w-[70px] sm:h-[110px] sm:w-[110px] lg:h-[132px] lg:w-[132px] items-center justify-center rounded-full bg-[#F2F3F8] dark:bg-darkTheme-secondary-bg transition-all duration-300 group-hover:bg-blue/10">
        <Image
          src={item.img}
          alt={item.title}
          width={82}
          height={62}
          className="object-contain transition-transform duration-300 group-hover:scale-110"
          style={{ width: "auto", height: "40px" }}
          sizes="(max-width: 640px) 40px, 62px"
        />
      </div>

      <div className="text-center">
        <h3 className="mb-1 sm:mb-2 inline-block text-xs sm:text-sm lg:text-base font-semibold text-dark dark:text-white transition-colors duration-300 group-hover:text-blue leading-tight">
          {item.title}
        </h3>
        <p className="text-2xs sm:text-sm text-dark-4 dark:text-darkTheme-secondary-muted hidden sm:block">
          Explore products in this category
        </p>
      </div>

      <span className="mt-2 sm:mt-4 inline-flex items-center rounded-full bg-gray-1 dark:bg-darkTheme-secondary-bg px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium text-dark-4 dark:text-darkTheme-secondary-muted transition-colors duration-300 group-hover:bg-blue/10 group-hover:text-blue">
        Shop now
      </span>
    </a>
  );
};

export default SingleItem;
