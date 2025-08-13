import type { PropsLang } from "@/interfaces/currentLang.interface";
import { experienceDataEN } from "@/utils/en/dataExperienciaEN";
import { dataExperiencia } from "@/utils/es/dataExperiencia";
import { dataExperienceFR } from "@/utils/fr/dataExperienciaFR";

import { useMemo } from "react";

import { Building, Clock, MapPin } from "lucide-react";

const langTraduceData: Record<string, typeof dataExperiencia> = {
  es: dataExperiencia,
  en: experienceDataEN,
  fr: dataExperienceFR,
};

export const ItemDataExperiencia = ({ currentLocale }: PropsLang) => {
  const memorization = useMemo(
    () => langTraduceData[currentLocale] || dataExperiencia,
    [currentLocale],
  );

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
      {memorization.map(
        ({ id, work, title, subtitle, img, alt, time, location }) => (
          <div
            key={id}
            className="card bg-base-100 shadow-md border border-transparent hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-xl hover:scale-[1.03] hover:brightness-105 transition-all duration-400 ease-in-out p-8 rounded-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={img}
                alt={alt}
                className="w-12 h-12 rounded-full bg-base-200 object-cover"
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-base-content">
                  {title}
                </h2>
                {work && (
                  <span className="badge badge-primary text-base-200 font-medium textarea-md my-2 rounded-full">
                    {work}
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm space-y-2 text-base-content/80">
              <div className="flex items-center gap-2">
                <Building className="text-base-content/60" />
                <span>{subtitle}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-base-content/60" />
                <span>{time}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="text-base-content/60" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
};
