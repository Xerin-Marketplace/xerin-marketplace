import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import FlashDeals from "./FlashDeals";
import FeaturedProducts from "./FeaturedProducts";
import BestSellers from "./BestSellers";
import WhyChooseXerin from "./WhyChooseXerin";
import DiscoveryRails from "./DiscoveryRails";
import MarketRails from "./MarketRails";

const Home = () => {
 return (
 <main>
 <Hero />
 <Categories />
 {/* Personalized rails render only when the backend has real data
 for the current user (recently viewed / recommendations). */}
 <DiscoveryRails />
 <FlashDeals />
 <MarketRails />
 <FeaturedProducts />
 <BestSellers />
 <WhyChooseXerin />
 </main>
 );
};

export default Home;
