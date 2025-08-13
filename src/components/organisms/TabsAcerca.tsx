import { Educacion } from "@/components/features/aboutMe/Educacion";
import { Experiencia } from "@/components/features/aboutMe/Experiencia";
import { Habilidades } from "@/components/features/aboutMe/Habilidades";
import { SobreMi } from "@/components/features/aboutMe/SobreMi";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

import { useEffect, useState } from "react";

import { Briefcase, GraduationCap, PencilRuler, UserRound } from "lucide-react";

export const TabsAcerca = ({ currentLocale }: PropsLang) => {
  const [activeTab, setActiveTab] = useState<string>("experiencia");
  const [mounted, setMounted] = useState<boolean>(false);

  const i18n = getI18N({ currentLocale });

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab, mounted]);

  if (!mounted) {
    return <span className="loading loading-ring loading-xl"></span>;
  }

  const getShortText = (text: string, length: number) => {
    return text.slice(0, length);
  };

  return (
    <div className="flex flex-col lg:flex-col lg:w-full">
      {/* Contenedor de los botones con un ancho fijo */}
      <div className="flex justify-center items-center lg:justify-start lg:items-start md:justify-start md:items-start gap-4">
        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "sobreMi" ? "btn-primary " : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("sobreMi")}
        >
          <span className=" sm:inline md:inline lg:inline">
            {<UserRound />}
          </span>
          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.ABOUTME.ABOUT_TITLE, 5)}
          </span>
          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.ABOUTME.ABOUT_TITLE}
          </span>
        </button>

        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "educacion" ? "btn-primary " : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("educacion")}
        >
          <span className="sm:inline md:inline lg:inline">
            {<GraduationCap />}
          </span>
          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.EDUCATION.EDUCATION_TITLE, 5)}
          </span>
          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.EDUCATION.EDUCATION_TITLE}
          </span>
        </button>

        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "experiencia" ? "btn-primary " : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("experiencia")}
        >
          <span className=" sm:inline md:inline lg:inline">
            {<Briefcase />}
          </span>

          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.ABOUTME.EXPERIENCE, 5)}
          </span>

          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.ABOUTME.EXPERIENCE}
          </span>
        </button>

        <button
          className={`btn lg:btn-lg md:btn-md sm:btn-sm rounded-full ${activeTab === "habilidades" ? "btn-primary " : "btn-outline"} lg:text-lg md:text-base text-sm`}
          onClick={() => setActiveTab("habilidades")}
        >
          <span className=" sm:inline md:inline lg:inline">
            {<PencilRuler />}
          </span>
          {/* Texto para pantallas pequeñas (sm) */}
          <span className="hidden sm:inline md:hidden lg:hidden">
            {getShortText(i18n.SKILLS.SKILLS_TITLE, 5)}
          </span>
          {/* Texto completo para pantallas medianas y grandes (md y lg) */}
          <span className="hidden md:inline lg:inline">
            {i18n.SKILLS.SKILLS_TITLE}
          </span>
        </button>
      </div>
      {/* Separador solo visible en pantallas grandes */}
      <div className="divider divider-vertical lg:divider-vertical"></div>
      {/* Contenedor del contenido del tab con un ancho flexible */}
      <div className="flex-1 w-full hero-content animate__animated animate__zoomIn">
        {activeTab === "experiencia" && (
          <Experiencia currentLocale={currentLocale} />
        )}
        {activeTab === "educacion" && (
          <Educacion currentLocale={currentLocale} />
        )}
        {activeTab === "habilidades" && (
          <Habilidades currentLocale={currentLocale} />
        )}
        {activeTab === "sobreMi" && <SobreMi currentLocale={currentLocale} />}
      </div>
    </div>
  );
};
