import React from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { Navigation, Pagination } from "swiper/modules";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

import "../../styles/styles.css";

export const PruebaSwiper = () => {
  return (
    <>
      <Swiper
        slidesPerView={3}
        spaceBetween={5}
        navigation={true}
        pagination={true}
        modules={[Pagination, Navigation]}
        className="mySwiper rounded-lg shadow-md"
        breakpoints={{
          576: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 1,
          },
          992: {
            slidesPerView: 2,
          },
          1200: {
            slidesPerView: 3,
          },
        }}
      >
        <SwiperSlide>
          asdadadsdaaaaaaaaaaaaaaaaaaaaasdasLorem ipsum dolor sit amet
          consectetur adipisicing elit. Vero harum reprehenderit libero. Earum,
          deserunt, facere pariatur quas id porro ipsum modi provident
          reprehenderit consectetur, vero sunt perspiciatis ab! Expedita magnam
          eaque itaque ipsa velit harum deleniti eligendi, voluptates placeat
          quae aut odio error consectetur pariatur dolorem non exercitationem
          beatae accusamus? Illum quos veniam quidem modi! Eligendi consequatur
          numquam ducimus aperiam!
        </SwiperSlide>
        <SwiperSlide>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero harum
          reprehenderit libero. Earum, deserunt, facere pariatur quas id porro
          ipsum modi provident reprehenderit consectetur, vero sunt perspiciatis
          ab! Expedita magnam eaque itaque ipsa velit harum deleniti eligendi,
          voluptates placeat quae aut odio error consectetur pariatur dolorem
          non exercitationem beatae accusamus? Illum quos veniam quidem modi!
          Eligendi consequatur numquam ducimus aperiam!
        </SwiperSlide>
        <SwiperSlide>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero harum
          reprehenderit libero. Earum, deserunt, facere pariatur quas id porro
          ipsum modi provident reprehenderit consectetur, vero sunt perspiciatis
          ab! Expedita magnam eaque itaque ipsa velit harum deleniti eligendi,
          voluptates placeat quae aut odio error consectetur pariatur dolorem
          non exercitationem beatae accusamus? Illum quos veniam quidem modi!
          Eligendi consequatur numquam ducimus aperiam!
        </SwiperSlide>
        <SwiperSlide>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero harum
          reprehenderit libero. Earum, deserunt, facere pariatur quas id porro
          ipsum modi provident reprehenderit consectetur, vero sunt perspiciatis
          ab! Expedita magnam eaque itaque ipsa velit harum deleniti eligendi,
          voluptates placeat quae aut odio error consectetur pariatur dolorem
          non exercitationem beatae accusamus? Illum quos veniam quidem modi!
          Eligendi consequatur numquam ducimus aperiam!
        </SwiperSlide>
        <SwiperSlide>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero harum
          reprehenderit libero. Earum, deserunt, facere pariatur quas id porro
          ipsum modi provident reprehenderit consectetur, vero sunt perspiciatis
          ab! Expedita magnam eaque itaque ipsa velit harum deleniti eligendi,
          voluptates placeat quae aut odio error consectetur pariatur dolorem
          non exercitationem beatae accusamus? Illum quos veniam quidem modi!
          Eligendi consequatur numquam ducimus aperiam!
        </SwiperSlide>
        <SwiperSlide>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero harum
          reprehenderit libero. Earum, deserunt, facere pariatur quas id porro
          ipsum modi provident reprehenderit consectetur, vero sunt perspiciatis
          ab! Expedita magnam eaque itaque ipsa velit harum deleniti eligendi,
          voluptates placeat quae aut odio error consectetur pariatur dolorem
          non exercitationem beatae accusamus? Illum quos veniam quidem modi!
          Eligendi consequatur numquam ducimus aperiam!
        </SwiperSlide>
      </Swiper>
    </>
  );
};
