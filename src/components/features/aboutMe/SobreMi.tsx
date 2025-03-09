import { getI18N } from "@/i18n";

import React from "react";

export const SobreMi = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });

  return (
    <>
      <span className="font-bold text-5xl">Sobre Mí</span>
      <div className="py-5">
        <p className="font-medium text-base/8">
          {i18n.ABOUTME.ABOUT_ABOUT_DESCRIPTION}
        </p>
      </div>
    </>
  );
};
