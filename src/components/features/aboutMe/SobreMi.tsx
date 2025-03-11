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
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="py-5">
          <p className="font-medium text-base/8">
            {i18n.ABOUTME.ABOUT_ABOUT_DESCRIPTION}
          </p>
        </div>
      </div>
    </>
  );
};
