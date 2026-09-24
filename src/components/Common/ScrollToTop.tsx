"use client";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";

export default function ScrollToTop() {
 const [isVisible, setIsVisible] = useState(false);

 // Top: 0 takes us all the way back to the top of the page
 // Behavior: smooth keeps it smooth!
 const scrollToTop = () => {
 window.scrollTo({
 top: 0,
 behavior: "smooth",
 });
 };

 useEffect(() => {
 // Button is displayed after scrolling for 500 pixels
 const toggleVisibility = () => {
 if (window.pageYOffset > 300) {
 setIsVisible(true);
 } else {
 setIsVisible(false);
 }
 };

 window.addEventListener("scroll", toggleVisibility);

 return () => window.removeEventListener("scroll", toggleVisibility);
 }, []);

 return (
 <>
 {isVisible && (
 <button
 onClick={scrollToTop}
 className={`items-center justify-center w-10 h-10 rounded-[4px] shadow-lg bg-blue ease-out duration-200 hover:bg-primary-dark fixed bottom-8 right-8 z-999 ${
 isVisible ? "flex" : "hidden"
 }`}
 >
 <HugeiconsIcon icon={ArrowUp01Icon} size={20} />
 </button>
 )}
 </>
 );
}
