import React from "react";
import Image from "next/image";
import { Testimonial } from "@/types/testimonial";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <figure className="mx-auto max-w-screen-md text-center">
      <svg
        className="mx-auto mb-3 h-10 text-gray-400 dark:text-gray-600"
        viewBox="0 0 24 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"
          fill="currentColor"
        />
      </svg>
      <blockquote>
        <p className="text-lg font-medium text-gray-900 dark:text-white sm:text-xl">
          &ldquo;{testimonial.review}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-6 flex items-center justify-center space-x-3">
        <div className="h-6 w-6 overflow-hidden rounded-full">
          <Image
            src={testimonial.authorImg}
            alt={testimonial.authorName}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover"
          />
        </div>
        <div className="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
          <div className="pr-3 font-medium text-gray-900 dark:text-white">
            {testimonial.authorName}
          </div>
          <div className="pl-3 text-sm font-light text-gray-500 dark:text-gray-400">
            {testimonial.authorRole}
          </div>
        </div>
      </figcaption>
    </figure>
  );
};

export default SingleItem;
