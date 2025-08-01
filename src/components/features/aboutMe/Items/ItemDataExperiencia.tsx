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
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        {memorization.map(
          ({ id, work, title, subtitle, img, alt, time, location }) => (
            <div key={id} className="bg-base-100 shadow-lg p-8 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={img}
                  alt={alt}
                  className="w-12 h-12 rounded-full bg-base-200 object-cover"
                />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-base-content">
                    {title}
                  </h3>
                  {work && (
                    <span className="badge badge-primary text-base-200 font-medium textarea-md my-2 rounded-full">
                      {work}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm space-y-2 text-base-content/80">
                <div className="flex items-center gap-2">
                  {v.iconoEmpresa && (
                    <v.iconoEmpresa className="text-base-content/60" />
                  )}
                  <span>{subtitle}</span>
                </div>

                <div className="flex items-center gap-2">
                  {v.iconoReloj && (
                    <v.iconoReloj className="text-base-content/60" />
                  )}
                  <span>{time}</span>
                </div>

                <div className="flex items-center gap-2">
                  {v.iconoUbicacion && (
                    <v.iconoUbicacion className="text-base-content/60" />
                  )}
                  <span>{location}</span>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
};
