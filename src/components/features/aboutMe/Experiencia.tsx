import { ItemDataExperiencia } from "@/components/features/aboutMe/Items/ItemDataExperiencia";
import { getI18N } from "@/i18n";

import type React from "react";

interface PropsLang {
  currentLocale: string;
}

export const Experiencia: React.FC<PropsLang> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="flex flex-col justify-center gap-4 animate__animated animate__zoomIn">
      <span className="font-bold text-5xl"> {i18n.ABOUTME.EXPERIENCE}</span>
      <ItemDataExperiencia currentLocale={currentLocale} />
    </div>
  );
};
