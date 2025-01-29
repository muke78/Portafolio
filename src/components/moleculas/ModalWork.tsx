import { getI18N } from "@/i18n";
import { experienceDataEN } from "@/utils/en/dataExperienciaEN";
import { dataExperiencia } from "@/utils/es/dataExperiencia";
import { dataExperienceFR } from "@/utils/fr/dataExperienciaFR";

import type React from "react";

interface ModalWorkProps {
  currentLocale: string;
}

interface Experience {
  id: string;
  img: string;
  experience: string[];
  location: string;
  subtitle: string;
  time: string;
  title: string;
  work?: string;
}

export const ModalWork: React.FC<ModalWorkProps> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });

  let dataChange: Experience[];

  if (currentLocale === "es") {
    dataChange = dataExperiencia;
  } else if (currentLocale === "fr") {
    dataChange = dataExperienceFR;
  } else {
    dataChange = experienceDataEN;
  }

  const handleOpenModal = () => {
    const modal = document.getElementById(
      "modalExperience",
    ) as HTMLDialogElement;
    modal.showModal();
  };

  return (
    <>
      <button
        className="btn btn-primary bg-gradient-to-l from-primary to-secondary border-none stat-value"
        onClick={handleOpenModal}
      >
        +4
      </button>

      {/* Modal */}
      <dialog
        id="modalExperience"
        className="modal z-50 fixed inset-0 flex items-center justify-center"
      >
        {/* <!-- Filtro tipo vidrio --> */}
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40"></div>

        <div className="modal-box max-w-2xl backdrop-blur-[30px] backdrop-saturate-[180%] rounded-b-lg p-0 bg-transparent bg-opacity-40 border border-neutral-700 z-50">
          {/* <!-- Modal header --> */}
          <div className="w-full flex sticky top-0 items-center justify-between bg-current z-10 p-4 md:p-5 border-b rounded-t">
            <h3 className="text-2xl font-semibold text-base-100">
              {i18n.ABOUTME.EXPERIENCE}
            </h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle rounded-lg text-sm ms-auto inline-flex justify-center items-center">
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </form>
          </div>
          {/* <!-- Modal body --> */}
          <div className="p-4 md:p-5 overflow-y-auto max-h-full">
            <ol className="relative border-s ms-3.5 mb-4 md:mb-5">
              {dataChange.map(
                ({
                  id,
                  img,
                  experience,
                  location,
                  subtitle,
                  time,
                  title,
                  work,
                }) => (
                  <li className="mb-10 ms-8" key={id}>
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -start-3.5 ring-8 ring-base-content">
                      <img
                        src={img}
                        alt={subtitle}
                        aria-label={subtitle}
                        loading="lazy"
                      />
                    </span>
                    <h3 className="flex items-start mb-1 text-lg font-semibold text-white dark:text-gray-800">
                      {title}
                      {work && (
                        <span className="bg-secondary text-sm font-medium mr-2 px-2.5 py-0.5 rounded ms-3">
                          {work}
                        </span>
                      )}
                    </h3>
                    <p className="flex items-start mb-3 text-sm font-normal leading-none text-gray-400 dark:text-gray-800">
                      {subtitle}
                    </p>
                    <time className="flex items-start mb-3 text-sm font-normal leading-none text-gray-400 dark:text-gray-800">
                      {time}
                    </time>
                    <p className="flex items-start mb-3 text-sm font-normal leading-none text-gray-400 dark:text-gray-800">
                      {location}
                    </p>
                    <ul className="list-disc text-left flex items-start flex-col">
                      {experience.map((exp, index) => (
                        <li
                          key={index}
                          className="text-sm text-white dark:text-gray-800"
                        >
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>
      </dialog>
    </>
  );
};
