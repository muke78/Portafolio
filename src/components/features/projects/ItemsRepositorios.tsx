import { IconModal } from "@/components/atoms/IconModal";
import type { PropsLang, Repo } from "@/interfaces/currentLang.interface";
import { v } from "@/styles/variables";
import { dataProyectosEN } from "@/utils/en/dataProyectosEN";
import { dataProyectos } from "@/utils/es/dataProyectos";
import { dataProyectosFR } from "@/utils/fr/dataProyectosFR";

import { useMemo, useRef, useState } from "react";

// Import Swiper styles
import "swiper/css/pagination";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// import { ModalGalery } from "./ModalGalery";

const langTraduceData: Record<string, typeof dataProyectos> = {
  es: dataProyectos,
  en: dataProyectosEN,
  fr: dataProyectosFR,
};

export const ItemsRepoRepositorios = ({ currentLocale }: PropsLang) => {
  const [selectedItem, setSelectedItem] = useState<Repo | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const swiperRef = useRef<any>(null);

  const memorization = useMemo(
    () => langTraduceData[currentLocale] || dataProyectos,
    [currentLocale],
  );

  const handleOpenModal = (repo: Repo): void => {
    setSelectedItem(repo);
    setModalOpen(true);
    swiperRef.current?.swiper.autoplay.stop();
  };

  const closeModal = () => {
    setModalOpen(false);
    swiperRef.current?.swiper.autoplay.start();
  };

  const handleImageLoad = (imgUrl: string) => {
    setLoadedImages((prev) => ({ ...prev, [imgUrl]: true }));
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
              {!loadedImages[repo.img] && (
                <div className="skeleton w-full"></div>
              )}
              <img
                className={`rounded-t-lg w-full ${loadedImages[repo.img] ? "opacity-100" : "opacity-0"}`}
                src={repo.img}
                alt={repo.title}
                aria-label={repo.title}
                onLoad={() => handleImageLoad(repo.img)}
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
                    <span className="badge badge-ghost badge-lg">PR</span>
                  )}
                  {repo.topics?.map((topic) => (
                    <span key={topic} className="badge badge-neutral badge-lg">
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="mt-auto">
                  <a
                    className="btn btn-primary w-full text-lg"
                    href={repo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.label}
                    {/* {i18n.PROJECTS.PROJECTS_VIEW} */}
                    <span className="text-xl">
                      {repo.type === "web" ? (
                        <> {v.iconoAbrir && <v.iconoAbrir />}</>
                      ) : (
                        <>{v.iconoGithub && <v.iconoGithub />}</>
                      )}
                    </span>
                  </a>
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
