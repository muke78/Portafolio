import {
  Backend,
  Companies,
  DataAnalyst,
  Frontend,
} from "@/components/features/projects/index";
import { SkeletonProjectsCard } from "@/components/features/projects/items/SkeletonProjectsCard";
import { getI18N } from "@/i18n";
import type { Projects, PropsLang } from "@/interfaces/currentLang.interface";
import { listProjectsServices } from "@/services/projects/projects.services";

import { useEffect, useMemo, useState } from "react";

import { Building, ChartArea, HardDrive, Layout } from "lucide-react";

export const TabsProyectos = ({ currentLocale }: PropsLang) => {
  const [activeTab, setActiveTab] = useState<string>("frontend");
  const [mounted, setMounted] = useState<boolean>(false);
  const [data, setData] = useState<Projects[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [previousDataLength, setPreviousDataLength] = useState<number>(0);

  const i18n = getI18N({ currentLocale });

  const getShortText = (text: string, length: number) => {
    return text.slice(0, length);
  };

  // Determinamos cuántos skeletons mostrar basado en la data
  const getSkeletonCount = () => {
    // Si hay data previa, usamos esa longitud
    if (previousDataLength > 0) {
      return previousDataLength;
    }
    // Si no hay data previa, usamos un número por defecto según el tab
    switch (activeTab) {
      case "frontend":
        return 7;
      case "backend":
        return 9;
      case "companies":
        return 3;
      case "dataAnalyst":
        return 2;
      default:
        return 3;
    }
  };

  const skeletonCount = getSkeletonCount();
  const skeletonItems = Array(skeletonCount).fill(null);

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
      const result = await listProjectsServices({ currentLocale });
      setData(result.data.rows as Projects[]);

      if (data.length > 0) {
        setPreviousDataLength(data.length);
      }

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
    fetchData();
  }, [currentLocale]);

  const projectsByCategory = useMemo(() => {
    return {
      frontend: data.filter((p) => p.category === "frontend"),
      backend: data.filter((p) => p.category === "backend"),
      companies: data.filter((p) => p.category === "companies"),
      dataAnalyst: data.filter((p) => p.category === "dataAnalyst"),
    };
  }, [data]);

  if (!mounted) {
    return <span className="loading loading-ring loading-xl"></span>;
  }

  return (
    <div className="flex flex-col lg:flex-col lg:w-full">
      {/* Contenedor de los botones con un ancho fijo */}
      <div className="flex justify-center items-center lg:justify-start lg:items-start md:justify-start md:items-start gap-4">
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
      <div className="flex-1 w-full p-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 p-2 xs:p-4 sm:p-6">
            {skeletonItems.map((_, i) => (
              <SkeletonProjectsCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "frontend" && (
              <Frontend
                currentLocale={currentLocale}
                data={projectsByCategory.frontend}
              />
            )}
            {activeTab === "backend" && (
              <Backend
                currentLocale={currentLocale}
                data={projectsByCategory.backend}
              />
            )}
            {activeTab === "companies" && (
              <Companies
                currentLocale={currentLocale}
                data={projectsByCategory.companies}
              />
            )}
            {activeTab === "dataAnalyst" && (
              <DataAnalyst
                currentLocale={currentLocale}
                data={projectsByCategory.dataAnalyst}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
