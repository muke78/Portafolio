import { ItemDataBackend } from "@/components/moleculas/ItemDataBackend";
import { ItemDataFrontend } from "@/components/moleculas/ItemDataFrontend";
import { ItemDataOtros } from "@/components/moleculas/ItemDataOtros";
import { tabsEN } from "@/utils/en/dataTabsHabilidadesEN";
import { tabs } from "@/utils/es/dataTabsHabilidades";
import { tabsFR } from "@/utils/fr/dataTabsHabilidadesFR";

import { useMemo, useState } from "react";

interface TabsHabilidadesProps {
  currentLocale: string;
}

const langTraduceData = (currentLocale: string) => {
  if (currentLocale === "es") return tabs;
  if (currentLocale === "fr") return tabsFR;
  return tabsEN;
};

export const TabsHabilidades: React.FC<TabsHabilidadesProps> = ({
  currentLocale,
}) => {
  const [activeTab, setActiveTab] = useState<string>("profile-styled-tab");

  const memorization = useMemo(
    () => langTraduceData(currentLocale),
    [currentLocale],
  );

  return (
    <>
      {/* // Tabs para cambiar de cuadricula */}
      <div className="flex items-center justify-center mt-4">
        <ul
          className="flex flex-wrap -mb-px text-sm font-medium text-center"
          id="default-styled-tab"
          data-tabs-toggle="#default-styled-tab-content"
          data-tabs-active-classes="text-primary border-primary"
          data-tabs-inactive-classes="text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300"
          role="tablist"
        >
          {memorization.map((tab) => (
            <li key={tab.id} className="me-2" role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300"
                }`}
                id={tab.id}
                data-tabs-target={tab.target}
                type="button"
                role="tab"
                aria-label={tab.ariaControls}
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* // Tabs para la agrupacion de tecnologias */}
      <div className="bg-base-200 rounded-xl shadow-base-content py-5 card">
        <div
          className="mx-auto max-w-7xl px-6 lg:px-8"
          id="default-styled-tab-content"
        >
          {/* Sección Interfaz */}
          <div
            className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 animate__animated animate__fadeIn"
            id="styled-interfaz"
            role="tabpanel"
            aria-labelledby="interfaz-tab"
          >
            <ItemDataFrontend currentLocale={currentLocale} />
          </div>

          {/* Sección Logica */}
          <div
            className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 hidden animate__animated animate__fadeIn"
            id="styled-logica"
            role="tabpanel"
            aria-labelledby="logica-tab"
          >
            <ItemDataBackend currentLocale={currentLocale} />
          </div>

          {/* Sección Otros */}
          <div
            className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 hidden animate__animated animate__fadeIn"
            id="styled-otros"
            role="tabpanel"
            aria-labelledby="otros-tab"
          >
            <ItemDataOtros currentLocale={currentLocale} />
          </div>
        </div>
      </div>
    </>
  );
};
