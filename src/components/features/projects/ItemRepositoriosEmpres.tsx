import { IconModal } from "@/components/atoms/IconModal";
import { dataProyectosEmpresarialesEN } from "@/utils/en/dataProyectosEmpresaEN";
import { dataProyectosEmpresariales } from "@/utils/es/dataProyectosEmpresa";
import { dataProyectosEmpresarialesFR } from "@/utils/fr/dataProyectosEmpresaFR";

import React, { memo, useMemo, useState } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

// import "../../../styles/styles.css";
import { ModalGalery } from "./ModalGalery";

interface PropsRepositoriosEmpresariales {
  currentLocale: string;
}

interface Repo {
  id: string;
  title: string;
  description?: string;
  img: string;
  topics?: string[];
  fork?: boolean;
  link: string;
}

const langTraduceData = (currentLocale: string) => {
  if (currentLocale === "es") return dataProyectosEmpresariales;
  if (currentLocale === "fr") return dataProyectosEmpresarialesFR;
  return dataProyectosEmpresarialesEN;
};

const ItemRepositoriosEmpres: React.FC<PropsRepositoriosEmpresariales> = ({
  currentLocale,
}) => {
  const [selectedItem, setSelectedItem] = useState<Repo | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const memorization = useMemo(
    () => langTraduceData(currentLocale),
    [currentLocale],
  );

  const handleOpenModal = (repo: Repo): void => {
    setSelectedItem(repo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const swiperComponent = useMemo(() => {
    return (
      <>
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          effect="coverflow"
          coverflowEffect={{
            rotate: 50,
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
              spaceBetween: 30,
            },
            992: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1200: {
              slidesPerView: 3,
              spaceBetween: 20,
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
        </Swiper>
      </>
    );
  }, [currentLocale, memorization]);

  return (
    <>
      {swiperComponent}
      {isModalOpen && selectedItem && (
        <ModalGalery
          data={selectedItem}
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          currentLocale={currentLocale}
        />
      )}
    </>
  );
};

export default memo(ItemRepositoriosEmpres);
