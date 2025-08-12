import {
  Backend,
  Companies,
  DataAnalyst,
  Frontend,
} from "@/components/features/projects/index";
import { useDataProjects } from "@/hooks/useDataProjects";
import { getI18N } from "@/i18n";
import type { Projects, PropsLang } from "@/interfaces/currentLang.interface";

import { useEffect, useState } from "react";

import { Building, ChartArea, HardDrive, Layout } from "lucide-react";

export const TabsProyectos = ({ currentLocale }: PropsLang) => {
  const [activeTab, setActiveTab] = useState<string>("frontend");
  const [mounted, setMounted] = useState<boolean>(false);
  const [data, setData] = useState<Projects[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const result = await useDataProjects({ currentLocale, activeTab });
      setData(result.rows as Projects[]);
      setLoading(false);
    }
    fetchData();
  }, [currentLocale, activeTab]);

  if (!mounted) {
    return <span className="loading loading-ring loading-xl"></span>;
  }

  const getShortText = (text: string, length: number) => {
    return text.slice(0, length);
  };

  return (
    <div className="flex flex-col lg:flex-col w-5/6 lg:w-full h-1/2">
      {/* Contenedor de los botones con un ancho fijo */}
      <div className="flex gap-4">
        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "frontend" ? "btn-primary" : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("frontend")}
        >
          <span className="sm:inline md:inline lg:inline">
            <Layout />
          </span>
          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F, 5)}
          </span>
          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F}
          </span>
        </button>

        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "backend" ? "btn-primary" : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("backend")}
        >
          <span className="sm:inline md:inline lg:inline">
            <HardDrive />
          </span>
          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B, 5)}
          </span>
          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B}
          </span>
        </button>

        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "companies" ? "btn-primary" : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("companies")}
        >
          <span className="sm:inline md:inline lg:inline">
            <Building />
          </span>
          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C, 5)}
          </span>
          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C}
          </span>
        </button>

        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "dataAnalyst" ? "btn-primary" : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("dataAnalyst")}
        >
          <span className="sm:inline md:inline lg:inline">
            <ChartArea />
          </span>
          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D, 5)}
          </span>
          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D}
          </span>
        </button>
      </div>
      {/* Separador solo visible en pantallas grandes */}
      <div className="divider divider-vertical lg:divider-vertical"></div>
      {/* Contenedor del contenido del tab con un ancho flexible */}
      <div className="flex-1 w-full animate__animated animate__zoomIn">
        {activeTab === "frontend" && (
          <Frontend
            currentLocale={currentLocale}
            data={data}
            loading={loading}
          />
        )}
        {activeTab === "backend" && (
          <Backend
            currentLocale={currentLocale}
            data={data}
            loading={loading}
          />
        )}
        {activeTab === "companies" && (
          <Companies
            currentLocale={currentLocale}
            data={data}
            loading={loading}
          />
        )}
        {activeTab === "dataAnalyst" && (
          <DataAnalyst
            currentLocale={currentLocale}
            data={data}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
