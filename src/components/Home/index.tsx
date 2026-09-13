import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import CounDown from "./Countdown";
import FlashDeals from "./FlashDeals";
import FeaturedProducts from "./FeaturedProducts";
import BestSellers from "./BestSellers";
import Testimonials from "./Testimonials";
import WhyChooseXerin from "./WhyChooseXerin";

const Home = () => {
  return (
    <main>
      <Hero />
      <Categories />
      <CounDown />
      <FlashDeals />
      <FeaturedProducts />
      <BestSellers />
      <Testimonials />
      <WhyChooseXerin />
    </main>
  );
};

export default Home;
