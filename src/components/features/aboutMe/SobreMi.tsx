import { getI18N } from "@/i18n";

import type React from "react";

interface Langprops {
  currentLocale: string;
}

export const SobreMi: React.FC<Langprops> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });

  return (
    <>
      <span className="font-bold text-5xl"> {i18n.ABOUTME.ABOUT_TITLE}</span>
      <div className="grid grid-cols-1 w-full bg-base-100 rounded-lg mt-4 shadow-lg animate__animated animate__zoomIn">
        <img
          className="rounded-t-lg bg-cover bg-no-repeat w-full"
          src="/Aboutme.webp"
          alt="Acerca de mí"
        />
        <div className="p-5">
          <div className="flex justify-between">
            <span className="text-2xl">{i18n.ABOUTME.ABOUT_TITLE_CARD}</span>
          </div>
          <p className="text-lg font-medium text-primary">
            {" "}
            {i18n.ABOUTME.ABOUT_SUBTITLE}
          </p>
          <div className="pt-4">
            <p className="font-normal text-base/8">
              {i18n.ABOUTME.ABOUT_ABOUT_DESCRIPTION}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
