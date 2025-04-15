import { v } from "@/styles/variables";
import { experienceDataEN } from "@/utils/en/dataExperienciaEN";
import { dataExperiencia } from "@/utils/es/dataExperiencia";
import { dataExperienceFR } from "@/utils/fr/dataExperienciaFR";

import type React from "react";
import { useMemo } from "react";

interface ModalWorkProps {
  currentLocale: string;
}

const langTraduceData = (currentLocale: string) => {
  if (currentLocale === "es") return dataExperiencia;
  if (currentLocale === "fr") return dataExperienceFR;
  return experienceDataEN;
};

export const ItemDataExperiencia: React.FC<ModalWorkProps> = ({
  currentLocale,
}) => {
  const memorization = useMemo(
    () => langTraduceData(currentLocale),
    [currentLocale],
  );

  return (
    <>
      <div className="grid lg:grid-cols-2 lg:grid-rows-2 grid-cols-1 gap-4 pt-4">
        {memorization.map(({ id, work, title, subtitle, time, location }) => (
          <div key={id} className="bg-base-100 shadow-lg p-8 rounded-xl">
            <div className="flex flex-col justify-start items-start gap-2">
              <h3 className="flex items-start mb-1 text-xl font-semibold">
                {title}
                {work && (
                  <span className="badge badge-primary rounded-full text-sm font-medium mr-2 px-2.5 py-0.5 ms-3">
                    {work}
                  </span>
                )}
              </h3>
              <span className="flex justify-center items-center gap-2 text-sm text-gray-300">
                <span>{v.iconoEmpresa && <v.iconoEmpresa />}</span>
                {subtitle}
              </span>

              <span className="flex justify-center items-center gap-2 text-sm text-gray-500">
                <span>{v.iconoReloj && <v.iconoReloj />}</span>
                {time}
              </span>
              <span className="flex justify-center items-center gap-2 text-sm text-gray-500">
                <span>{v.iconoUbicacion && <v.iconoUbicacion />}</span>
                {location}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
