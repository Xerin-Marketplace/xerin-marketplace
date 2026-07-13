import { Category } from "@/types/category";
import React from "react";
import { ROUTES } from "@/constants/links";
import Image from "next/image";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <a
      href={ROUTES.shop}
      className="group flex h-full flex-col items-center rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-4 flex h-[132px] w-full max-w-[132px] items-center justify-center rounded-full bg-[#F2F3F8] dark:bg-darkTheme-secondary-bg transition-all duration-300 group-hover:bg-blue/10">
        <Image
          src={item.img}
          alt={item.title}
          width={82}
          height={62}
          className="object-contain transition-transform duration-300 group-hover:scale-110"
          style={{ width: "auto", height: "62px" }}
        />
      </div>

      <div className="text-center">
        <h3 className="mb-2 inline-block text-base font-semibold text-dark dark:text-white transition-colors duration-300 group-hover:text-blue">
          {item.title}
        </h3>
        <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
          Explore products in this category
        </p>
      </div>

      <span className="mt-4 inline-flex items-center rounded-full bg-gray-1 dark:bg-darkTheme-secondary-bg px-3 py-1 text-xs font-medium text-dark-4 dark:text-darkTheme-secondary-muted transition-colors duration-300 group-hover:bg-blue/10 group-hover:text-blue">
        Shop now
      </span>
    </a>
  );
};

export default SingleItem;
