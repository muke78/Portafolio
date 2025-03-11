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
  let dataChange: Experience[];

  if (currentLocale === "es") {
    dataChange = dataExperiencia;
  } else if (currentLocale === "fr") {
    dataChange = dataExperienceFR;
  } else {
    dataChange = experienceDataEN;
  }

  return (
    <>
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
                {/* <span > */}
                <img
                  src={img}
                  alt={subtitle}
                  aria-label={subtitle}
                  className="absolute flex items-center justify-center w-6 h-6 rounded-full -start-3.5 ring-8 ring-base-content"
                />
                {/* </span> */}
                <h3 className="flex items-start mb-1 text-xl font-semibold">
                  {title}
                  {work && (
                    <span className="btn btn-primary btn-sm rounded-full text-sm font-medium mr-2 px-2.5 py-0.5 rounded ms-3">
                      {work}
                    </span>
                  )}
                </h3>
                <p className="flex items-start mb-3 text-sm font-normal leading-none">
                  {subtitle}
                </p>
                <time className="flex items-start mb-3 text-sm font-normal leading-none">
                  {time}
                </time>
                <p className="flex items-start mb-3 text-sm font-normal leading-none">
                  {location}
                </p>
                <ul className="list-disc text-left flex items-start flex-col">
                  {experience.map((exp, index) => (
                    <li key={index} className="text-sm font-semibold">
                      {exp}
                    </li>
                  ))}
                </ul>
              </li>
            ),
          )}
        </ol>
      </div>
    </>
  );
};
