import { ItemDataProjects } from "@/components/features/projects/items/ItemDataProjects";
import { getI18N } from "@/i18n";
import type { PropsLangWithData } from "@/interfaces/currentLang.interface";

export const DataAnalyst = ({
  currentLocale,
  data,
  loading,
}: PropsLangWithData) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="w-full flex flex-col animate__animated animate__zoomIn">
      <span className="font-bold text-5xl">
        {i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D}
      </span>

      <div>
        <div className="flex flex-col gap-4 pt-4">
          <ItemDataProjects
            currentLocale={currentLocale}
            data={data}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};
