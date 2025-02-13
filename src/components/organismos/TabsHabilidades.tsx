import { ItemDataBackend } from "@/components/moleculas/ItemDataBackend";
import { ItemDataFrontend } from "@/components/moleculas/ItemDataFrontend";
import { ItemDataOtros } from "@/components/moleculas/ItemDataOtros";
import { tabsEN } from "@/utils/en/dataTabsHabilidadesEN";
import { tabs } from "@/utils/es/dataTabsHabilidades";
import { tabsFR } from "@/utils/fr/dataTabsHabilidadesFR";

import { useState } from "react";

interface TabsHabilidadesProps {
  currentLocale: string;
}

export const TabsHabilidades: React.FC<TabsHabilidadesProps> = ({
  currentLocale,
}) => {
  const [activeTab, setActiveTab] = useState<string>("profile-styled-tab");

  let dataChange;

  if (currentLocale === "es") {
    dataChange = tabs;
  } else if (currentLocale === "fr") {
    dataChange = tabsFR;
  } else {
    dataChange = tabsEN;
  }
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
          {dataChange.map((tab) => (
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
                aria-controls={tab.ariaControls}
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
          <div
            className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2"
            id="styled-profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <ItemDataFrontend currentLocale={currentLocale} />
          </div>
          <div
            className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 hidden"
            id="styled-dashboard"
            role="tabpanel"
            aria-labelledby="dashboard-tab"
          >
            <ItemDataBackend currentLocale={currentLocale} />
          </div>
          <div
            className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 hidden"
            id="styled-settings"
            role="tabpanel"
            aria-labelledby="settings-tab"
          >
            <ItemDataOtros currentLocale={currentLocale} />
          </div>
        </div>
      </div>
    </>
  );
};
