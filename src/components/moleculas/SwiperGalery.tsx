import React from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "../../styles/styles.css";

interface PropSwiperModalGalery {
  data: string;
}

export const SwiperGalery: React.FC<PropSwiperModalGalery> = ({ data }) => {
  return (
    <Swiper
      navigation={true}
      pagination={true}
      modules={[Navigation, Pagination]}
      className="mySwiper rounded-lg shadow-md"
    >
      <SwiperSlide>{/* <img src={data.img} alt={data.title} /> */}</SwiperSlide>
    </Swiper>
  );
};
