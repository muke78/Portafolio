import { ItemDataHabilidades } from "@/components/features/aboutMe/Items/ItemDataHabilidades";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const Habilidades = ({ currentLocale }: PropsLang) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="w-full animate__animated animate__zoomIn flex flex-col">
      <span className="font-bold text-5xl mb-4">
        {" "}
        {i18n.SKILLS.SKILLS_TITLE}
      </span>

      <div>
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 pb-4">
          <ItemDataHabilidades currentLocale={currentLocale} />
        </div>
      </div>
    </div>
  );
};
