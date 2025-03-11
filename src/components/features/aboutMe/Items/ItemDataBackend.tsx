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
      {memorization.map(({ title, images }, index) => (
        <div key={index} className="bg-base-100 p-8 rounded-xl">
          <div className="flex flex-col justify-start items-start gap-2">
            <span className="text-2xl font-semibold">{title}</span>
            {images.map((image, imgIndex) => {
              const techNames = image.split("?i=")[1].split(",");
              return (
                <div key={imgIndex} className="flex flex-wrap gap-2 mt-5">
                  {techNames.map((tech, techIndex) => (
                    <div key={techIndex} className="flex flex-col items-center">
                      <img
                        className="leading-6"
                        src={`https://go-skill-icons.vercel.app/api/icons?i=${tech}`}
                        alt={`Icon for ${tech}`}
                        width="50"
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
        </div>
      ))}
    </>
  );
};
