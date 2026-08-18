import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";

const Home = () => {
  return (
    <main>
      <Hero />
      <Categories />
      <CounDown />
      <Testimonials />
      <Newsletter />
    </main>
  );
};

export default Home;
