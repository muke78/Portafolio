import { ItemDataAlojamiento } from "@/components/features/aboutMe/Items/ItemDataAlojamiento";
import { ItemDataBackend } from "@/components/features/aboutMe/Items/ItemDataBackend";
import { ItemDataComponents } from "@/components/features/aboutMe/Items/ItemDataComponents";
import { ItemDataFrontend } from "@/components/features/aboutMe/Items/ItemDataFrontend";
import { ItemDataOtros } from "@/components/features/aboutMe/Items/ItemDataOtros";
import { getI18N } from "@/i18n";

import type React from "react";

interface Langprops {
  currentLocale: string;
}

export const Habilidades: React.FC<Langprops> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="w-full animate__animated animate__zoomIn">
      <span className="font-bold text-4xl md:text-5xl">
        {" "}
        {i18n.SKILLS.SKILLS_TITLE}
      </span>
      <div className="grid lg:grid-cols-2 lg:grid-rows-3 grid-cols-1 gap-4 pt-4">
        <ItemDataFrontend currentLocale={currentLocale} />
        <ItemDataBackend currentLocale={currentLocale} />
        <ItemDataComponents currentLocale={currentLocale} />
        <ItemDataAlojamiento currentLocale={currentLocale} />
        <ItemDataOtros currentLocale={currentLocale} />
      </div>
    </div>
  );
};
