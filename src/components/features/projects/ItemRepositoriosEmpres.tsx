import { IconModal } from "@/components/atoms/IconModal";
import type { PropsLang, RepoEmpres } from "@/interfaces/currentLang.interface";
import { dataProyectosEmpresarialesEN } from "@/utils/en/dataProyectosEmpresaEN";
import { dataProyectosEmpresariales } from "@/utils/es/dataProyectosEmpresa";
import { dataProyectosEmpresarialesFR } from "@/utils/fr/dataProyectosEmpresaFR";

import { useMemo, useRef, useState } from "react";

// Import Swiper styles
import "swiper/css/pagination";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// import { ModalGalery } from "./ModalGalery";

const langTraduceData: Record<string, typeof dataProyectosEmpresariales> = {
  es: dataProyectosEmpresariales,
  en: dataProyectosEmpresarialesEN,
  fr: dataProyectosEmpresarialesFR,
};

export const ItemRepositoriosEmpres = ({ currentLocale }: PropsLang) => {
  const [selectedItem, setSelectedItem] = useState<RepoEmpres | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const swiperRef = useRef<any>(null);

  const memorization = useMemo(
    () => langTraduceData[currentLocale] || dataProyectosEmpresariales,
    [currentLocale],
  );

  const handleOpenModal = (repo: RepoEmpres): void => {
    setSelectedItem(repo);
    setModalOpen(true);
    swiperRef.current?.swiper.autoplay.stop();
  };

  const closeModal = () => {
    setModalOpen(false);
    swiperRef.current?.swiper.autoplay.start();
  };

  return (
    <>
      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        spaceBetween={30}
        loop={true}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        effect="coverflow"
        coverflowEffect={{
          rotate: 12,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        modules={[Pagination, EffectCoverflow, Autoplay]}
        className="mySwiper rounded-lg"
        breakpoints={{
          768: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          992: {
            slidesPerView: 2,
            spaceBetween: 0,
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 0,
          },
        }}
      >
        {memorization.map((repo) => (
          <SwiperSlide key={repo.id} className="pb-12">
            <div className="flex flex-col w-full bg-base-100 rounded-lg mt-4 shadow-lg animate__animated animate__fadeIn h-full">
              <img
                className="rounded-t-lg w-full"
                src={repo.img}
                alt={repo.title}
                aria-label={repo.title}
              />
              {/* Pasa los datos al IconModal */}
              <IconModal onClick={() => handleOpenModal(repo)} />
              <div className="flex flex-col gap-4 p-5 flex-1">
                <div className="flex">
                  <span className="font-semibold text-3xl">{repo.title}</span>
                </div>
                <p className="text-left text-md flex-1">
                  {repo.description || "No description available."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {repo.fork && (
                    <span className="px-4 rounded-lg bg-base-300 font-medium">
                      PR
                    </span>
                  )}
                  {repo.topics?.map((topic) => (
                    <span
                      key={topic}
                      className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {/* {isModalOpen && selectedItem && (
          <ModalGalery
            data={selectedItem}
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            currentLocale={currentLocale}
          />
        )} */}
      </Swiper>
    </>
  );
};
