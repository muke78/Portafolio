import { ItemRepositoriosEmpres } from "@/components/features/projects/ItemRepositoriosEmpres";
import { ItemsRepoRepositorios } from "@/components/features/projects/ItemsRepositorios";
import { getI18N } from "@/i18n";
import { v } from "@/styles/variables";

import React, { useEffect, useState } from "react";

interface PropsLang {
  currentLocale: string;
}

export const TabsProyectos: React.FC<PropsLang> = ({ currentLocale }) => {
  const [activeTab, setActiveTab] = useState<string>("proyectos");
  const [mounted, setMounted] = useState<boolean>(false);

  const i18n = getI18N({ currentLocale });

  useEffect(() => {
    const savedTab = localStorage.getItem("activeProjectTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("activeProjectTab", activeTab);
    }
  }, [activeTab, mounted]);

  if (!mounted) {
    return <span className="loading loading-ring loading-xl"></span>;
  }

  return (
    <div className="flex flex-col w-full h-1/2 mx-auto p-4 mt-16">
      {/* Buttons at the top */}
      <div className="lg:flex lg:justify-center lg:items-center grid grid-cols-1 gap-4 w-full justify-center sm:justify-start animate__animated animate__fadeIn">
        <button
          className={`btn btn-sm sm:w-auto ${activeTab === "proyectos" ? "btn-primary" : "btn-neutral"} text-md lg:text-lg`}
          onClick={() => setActiveTab("proyectos")}
        >
          <span className="text-2xl">
            {v.iconoProyectos && <v.iconoProyectos />}
          </span>
          {i18n.PROJECTS.PROJECTS_TITLE}
        </button>
        <button
          className={`btn btn-sm sm:w-auto ${activeTab === "proyectosEmpres" ? "btn-primary" : "btn-neutral"} text-md lg:text-lg`}
          onClick={() => setActiveTab("proyectosEmpres")}
        >
          <span className="text-2xl">
            {v.iconoProyectoEmpresarial && <v.iconoProyectoEmpresarial />}
          </span>
          {i18n.PROJECTS.PROJECTS_TITLE_BUSIN}
        </button>
      </div>

      {/* Content below */}
      <div className="pt-4 w-full">
        {activeTab === "proyectos" && (
          <ItemsRepoRepositorios currentLocale={currentLocale} />
        )}
        {activeTab === "proyectosEmpres" && (
          <ItemRepositoriosEmpres currentLocale={currentLocale} />
        )}
      </div>
    </div>
  );
};
