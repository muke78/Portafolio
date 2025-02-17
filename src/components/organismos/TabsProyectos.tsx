import { ItemsRepoRepositorios } from "@/components/moleculas/ItemsRepositorios";
import { tabsProyectosEN } from "@/utils/en/dataTabsproyectosEN";
import { tabsProyectos } from "@/utils/es/dataTabsProyectos";
import { tabsProyectosFR } from "@/utils/fr/dataTabsProyectosFR";

import React, { useState } from "react";

interface TabsproyectosProps {
  currentLocale: string;
}

export const TabsProyectos: React.FC<TabsproyectosProps> = ({
  currentLocale,
}) => {
  const [activeTab, setActiveTab] = useState<string>("profile-styled-tab");

  let dataChange;
  if (currentLocale === "es") {
    dataChange = tabsProyectos;
  } else if (currentLocale === "fr") {
    dataChange = tabsProyectosFR;
  } else {
    dataChange = tabsProyectosEN;
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
          {/* Sección Proyectos */}
          <div
            className=" grid max-w-7xl  gap-x-8 gap-y-16 lg:mx-0 hidden animate__animated animate__fadeIn"
            id="styled-proyectos"
            role="tabpanel"
            aria-labelledby="proyectos-tab"
          >
            <ItemsRepoRepositorios currentLocale={currentLocale} />
          </div>

          {/* Sección Proyectos empresariales */}
          <div
            className="mt-10 grid max-w-7xl  gap-x-8 gap-y-16 lg:mx-0 hidden animate__animated animate__fadeIn"
            id="styled-proyectos-emp"
            role="tabpanel"
            aria-labelledby="proyectos-emp-tab"
          >
            {/* <ItemDataBackend currentLocale={currentLocale} /> */}
          </div>
        </div>
      </div>
    </>
  );
};
