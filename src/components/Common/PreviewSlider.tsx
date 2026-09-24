"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef } from "react";
import "swiper/css/navigation";
import "swiper/css";
import Image from "next/image";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ArrowLeft01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

const PreviewSliderModal = () => {
 const { closePreviewModal, isModalPreviewOpen } = usePreviewSlider();

 const data = useProductDetailsStore((state) => state.value);
 const images: string[] = [
 ...(Array.isArray(data?.imgs?.previews) ? data.imgs.previews : []),
 ...(Array.isArray(data?.images) ? data.images : []),
 ].filter((image, index, list) => typeof image === "string" && image.length > 0 && list.indexOf(image) === index);

 const sliderRef = useRef(null);

 const handlePrev = useCallback(() => {
 if (!sliderRef.current) return;
 sliderRef.current.swiper.slidePrev();
 }, []);

 const handleNext = useCallback(() => {
 if (!sliderRef.current) return;
 sliderRef.current.swiper.slideNext();
 }, []);

 return (
 <div
 className={`preview-slider w-full h-screen z-999999 inset-0 flex justify-center items-center bg-[#000000F2] bg-opacity-70 ${isModalPreviewOpen ? "fixed" : "hidden"
 }`}
 >
 <button
 onClick={() => closePreviewModal()}
 aria-label="button for close modal"
 className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 text-white hover:text-meta-5 z-10"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={36} />
 </button>

 <div>
 <button
 className="rotate-180 absolute left-100 p-5 cursor-pointer z-10"
 onClick={handlePrev}
 >
 <HugeiconsIcon icon={ArrowRight01Icon} size={36} />
 </button>

 <button
 className="absolute right-100 p-5 cursor-pointer z-10"
 onClick={handleNext}
 >
 <HugeiconsIcon icon={ArrowRight01Icon} size={36} />
 </button>
 </div>

 {images.length ? (
 <Swiper ref={sliderRef} slidesPerView={1} spaceBetween={20}>
 {images.map((image) => (
 <SwiperSlide key={image}>
 <div className="flex items-center justify-center">
 <Image src={image} alt={data?.title || "Product image"} width={450} height={450} />
 </div>
 </SwiperSlide>
 ))}
 </Swiper>
 ) : (
 <div className="flex h-[450px] w-[min(90vw,450px)] items-center justify-center rounded-2xl border border-white/20 text-sm text-white/70">
 No product image available
 </div>
 )}
 </div>
 );
};

export default PreviewSliderModal;
