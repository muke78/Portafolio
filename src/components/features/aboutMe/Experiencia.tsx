import { getI18N } from "@/i18n";

import { ModalWork } from "./Items/ItemDataExperiencia";

export const Experiencia = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="flex flex-col justify-center gap-4 animate__animated animate__zoomIn">
      <span className="font-bold text-5xl"> {i18n.ABOUTME.EXPERIENCE}</span>
      <ModalWork currentLocale={currentLocale} />
    </div>
  );
};
