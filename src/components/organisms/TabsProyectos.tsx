import { useDataProjects } from "@/api/apiDataProjects";
import {
  Backend,
  Companies,
  DataAnalyst,
  Frontend,
} from "@/components/features/projects/index";
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

  const SkeletonCard = () => (
    <div className="w-full">
      <div className="card w-full bg-base-100 shadow-sm border border-transparent animate-pulse">
        {/* Figure skeleton - mismo tamaño que las imágenes reales */}
        <figure className="relative overflow-hidden">
          <div className="w-full h-48 bg-base-300"></div>
          {/* Botones skeleton en las mismas posiciones */}
          <div className="absolute right-12 top-2 p-2">
            <div className="btn btn-sm bg-base-300 border-0">
              <div className="w-[30px] h-[30px] bg-base-content/20 rounded"></div>
            </div>
          </div>
          <div className="absolute right-0 top-2 p-2">
            <div className="btn btn-sm bg-base-300 border-0">
              <div className="w-[30px] h-[30px] bg-base-content/20 rounded"></div>
            </div>
          </div>
        </figure>

        {/* Card body skeleton */}
        <div className="card-body">
          {/* Título y badge skeleton */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 bg-base-300 rounded w-32"></div>
              <div className="badge bg-base-300 border-0 h-5 w-20"></div>
            </div>
          </div>

          {/* Descripción skeleton - 3 líneas como el contenido real */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-base-300 rounded w-full"></div>
            <div className="h-4 bg-base-300 rounded w-4/5"></div>
            <div className="h-4 bg-base-300 rounded w-3/5"></div>
          </div>

          {/* Card actions skeleton */}
          <div className="card-actions justify-start">
            <div className="avatar-group -space-x-3">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="avatar">
                  <div className="w-8 h-8 bg-base-300 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Para skeletons, simulamos 3 cards de carga
  const skeletonItems = Array(3).fill(null);

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
      <div className="flex-1 w-full hero-content">
        {loading ? (
          skeletonItems.map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {activeTab === "frontend" && (
              <Frontend currentLocale={currentLocale} data={data} />
            )}
            {activeTab === "backend" && (
              <Backend currentLocale={currentLocale} data={data} />
            )}
            {activeTab === "companies" && (
              <Companies currentLocale={currentLocale} data={data} />
            )}
            {activeTab === "dataAnalyst" && (
              <DataAnalyst currentLocale={currentLocale} data={data} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
