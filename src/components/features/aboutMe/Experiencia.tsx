import { ItemDataExperiencia } from "@/components/features/aboutMe/Items/ItemDataExperiencia";
import { getI18N } from "@/i18n";

import type React from "react";

interface PropsLang {
  currentLocale: string;
}

export const Experiencia: React.FC<PropsLang> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="w-full animate__animated animate__zoomIn flex flex-col">
      <span className="font-bold text-5xl mb-4">
        {" "}
        {i18n.ABOUTME.EXPERIENCE}
      </span>

      <div className="lg:max-h-[65vh] md:max-h-[70vh] sm:max-h-[70vh] sm:overflow-auto md:overflow-auto lg:overflow-y-auto pr-2 md:pr-4">
        <div className="flex flex-col gap-4 pb-4">
          <ItemDataExperiencia currentLocale={currentLocale} />
        </div>
      </div>
    </div>
  );
};
