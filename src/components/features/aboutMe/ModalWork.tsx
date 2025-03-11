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
  work: string;
  title: string;
  subtitle: string;
  time: string;
  location: string;
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
      <div className="grid lg:grid-cols-2 lg:grid-rows-2 grid-cols-1 gap-4 pt-4">
        {dataChange.map(({ id, work, title, subtitle, time, location }) => (
          <div key={id} className="bg-base-100 shadow-lg p-8 rounded-xl">
            <div className="flex flex-col justify-start items-start gap-2">
              <h3 className="flex items-start mb-1 text-xl font-semibold">
                {title}
                {work && (
                  <span className="btn btn-primary btn-sm rounded-full text-sm font-medium mr-2 px-2.5 py-0.5 rounded ms-3">
                    {work}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-400">{subtitle}</p>
              <time className="text-sm text-primary">{time}</time>
              <p className="text-sm text-gray-500">{location}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
