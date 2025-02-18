import { getI18N } from "@/i18n";
import { dataProyectosEN } from "@/utils/en/dataProyectosEN";
import { dataProyectos } from "@/utils/es/dataProyectos";
import { dataProyectosFR } from "@/utils/fr/dataProyectosFR";

import React, { memo, useMemo, useState } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/styles.css";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { IconModal } from "../atomos/IconModal";
import { ModalGalery } from "./ModalGalery";

interface PropsRepositorios {
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
  if (currentLocale === "es") return dataProyectos;
  if (currentLocale === "fr") return dataProyectosFR;
  return dataProyectosEN;
};

export const ItemsRepoRepositorios: React.FC<PropsRepositorios> = ({
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

  const i18n = getI18N({ currentLocale });
  return (
    <>
      <Swiper
        slidesPerView={2}
        spaceBetween={5}
        navigation={true}
        pagination={true}
        modules={[Navigation, Pagination]}
        className="mySwiper rounded-lg shadow-md"
        breakpoints={{
          300: {
            slidesPerView: 1,
          },
          460: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 1,
          },
          1024: {
            slidesPerView: 2,
          },
          1440: {
            slidesPerView: 2,
          },
          1920: {
            slidesPerView: 2,
          },
        }}
      >
        {memorization.map((repo) => (
          <SwiperSlide key={repo.id} className="flex flex-col pb-8">
            <div className="border border-neutral-700 rounded-lg  md:p-8 lg:p-9 shadow-md flex justify-between flex-col h-full">
              <div>
                <a target="_blank" rel="noopener noreferrer">
                  <img
                    className="rounded-t-lg w-full object-cover"
                    src={repo.img}
                    alt={repo.title}
                    aria-label={repo.title}
                  />
                </a>
                {/* Pasa los datos al IconModal */}
                <IconModal onClick={() => handleOpenModal(repo)} />
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  id="github"
                  width="54"
                  height="54"
                  className="fill-current"
                >
                  <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z" />
                </svg>
                <h2 className="font-semibold text-2xl pl-4">{repo.title}</h2>
              </div>
              <p className="text-base-content text-lg">
                {repo.description || "No description available."}
              </p>
              <div className="mt-4">
                {repo.topics ? (
                  <div className="flex flex-wrap gap-2">
                    {repo.fork && (
                      <span className="bg-base-content text-base-100 font-semibold px-3 py-1 rounded-full">
                        PR
                      </span>
                    )}
                    {repo.topics.map((topic) => (
                      <span
                        key={topic}
                        className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No topics available.</p>
                )}
              </div>
              <div className="mt-2">
                <a
                  className="btn btn-accent backdrop-blur-[100px] backdrop-saturate-[180%] flex justify-center items-center"
                  href={repo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18n.PROJECTS.PROJECTS_VIEW}
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {/* Modal único */}
        {isModalOpen && selectedItem && (
          <ModalGalery
            data={selectedItem}
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            currentLocale={currentLocale}
          />
        )}
      </Swiper>
    </>
  );
};
