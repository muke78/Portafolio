import type { DataItemTabs } from "@/types/typesDataHabilidades";
import { dataBackendEN } from "@/utils/en/dataBackendEN";
import { dataBackend } from "@/utils/es/dataBackend";
import { dataBackendFR } from "@/utils/fr/dataBackendFR";

import React, { useMemo } from "react";

interface ItemDataFrontendProps {
  currentLocale: string;
}

const langTraduceData = (currentLocale: string) => {
  if (currentLocale === "es") return dataBackend;
  if (currentLocale === "fr") return dataBackendFR;
  return dataBackendEN;
};

export const ItemDataBackend: React.FC<ItemDataFrontendProps> = ({
  currentLocale,
}) => {
  const memorization = useMemo(
    () => langTraduceData(currentLocale),
    [currentLocale],
  );

  return (
    <>
      {memorization.map(({ time, area, title, images }, index) => (
        <article key={index} className="flex flex-col max-w-xl">
          <div className="flex justify-center items-center gap-x-4 text-xs">
            <time>{time}</time>
            <span className="relative z-10 rounded-full bg-primary px-3 py-1.5 font-medium text-base-100">
              {area}
            </span>
          </div>
          <div className="group relative flex flex-col items-center justify-center">
            <h3 className="mt-3 text-lg font-semibold leading-6">
              <span className="text-lg text-base-content">{title}</span>
            </h3>
            {images.map((image, imgIndex) => {
              const techNames = image.split("?i=")[1].split(",");
              return (
                <div
                  key={imgIndex}
                  className="flex flex-wrap gap-4 justify-center mt-5"
                >
                  {techNames.map((tech, techIndex) => (
                    <div key={techIndex} className="flex flex-col items-center">
                      <img
                        className="leading-6"
                        src={`https://go-skill-icons.vercel.app/api/icons?i=${tech}`}
                        alt={`Icon for ${tech}`}
                        loading="lazy"
                      />
                      <span className="text-xs mt-1 text-base-content">
                        {tech}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </>
  );
};
