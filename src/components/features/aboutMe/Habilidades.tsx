import { ItemDataHabilidades } from "@/components/features/aboutMe/Items/ItemDataHabilidades";
import { getI18N } from "@/i18n";

import type React from "react";

interface Langprops {
  currentLocale: string;
}

export const Habilidades: React.FC<Langprops> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="w-full animate__animated animate__zoomIn flex flex-col">
      <span className="font-bold text-5xl mb-4">
        {" "}
        {i18n.SKILLS.SKILLS_TITLE}
      </span>

      <div className="lg:max-h-[65vh] md:max-h-[70vh] sm:max-h-[70vh] sm:overflow-auto md:overflow-auto lg:overflow-y-auto pr-2 md:pr-4">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 pb-4">
          <ItemDataHabilidades currentLocale={currentLocale} />
        </div>
      </div>
    </div>
  );
};
