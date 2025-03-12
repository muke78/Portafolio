import { ItemDataHabilidades } from "@/components/features/aboutMe/Items/ItemDataHabilidades";
import { getI18N } from "@/i18n";

import type React from "react";

interface Langprops {
  currentLocale: string;
}

export const Habilidades: React.FC<Langprops> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="w-full animate__animated animate__zoomIn">
      <span className="font-bold text-5xl"> {i18n.SKILLS.SKILLS_TITLE}</span>
      <div className="grid lg:grid-cols-2 lg:grid-rows-3 grid-cols-1 gap-4 pt-4">
        <ItemDataHabilidades currentLocale={currentLocale} />
      </div>
    </div>
  );
};
