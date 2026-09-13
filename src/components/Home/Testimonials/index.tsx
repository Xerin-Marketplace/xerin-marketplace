"use client";

import { useEffect, useState } from "react";
import testimonialsData from "./testimonialsData";
import SingleItem from "./SingleItem";

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const total = testimonialsData.length;

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:py-16 lg:px-6">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonialsData.map((item, key) => (
              <div key={key} className="w-full flex-shrink-0">
                <SingleItem testimonial={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;