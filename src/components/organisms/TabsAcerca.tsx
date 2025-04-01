import { Educacion } from "@/components/features/aboutMe/Educacion";
import { Experiencia } from "@/components/features/aboutMe/Experiencia";
import { Habilidades } from "@/components/features/aboutMe/Habilidades";
import { SobreMi } from "@/components/features/aboutMe/SobreMi";
import { getI18N } from "@/i18n";

import React, { useEffect, useState } from "react";

interface PropsLang {
  currentLocale: string;
}

export const TabsAcerca: React.FC<PropsLang> = ({ currentLocale }) => {
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

  const getShortText = (text: string) => {
    return text.slice(0, 3);
  };

  return (
    <div className="flex flex-col lg:flex-row w-5/6 lg:w-full h-1/2">
      {/* Contenedor de los botones con un ancho fijo */}
      <div className="flex flex-row justify-center lg:flex-col gap-4 w-full h-full lg:w-1/3 lg:pl-20 animate__animated animate__fadeIn">
        <button
          className={`btn ${activeTab === "experiencia" ? "btn-primary" : "btn-neutral"} text-lg`}
          onClick={() => setActiveTab("experiencia")}
        >
          <span className="lg:hidden">
            {getShortText(i18n.ABOUTME.EXPERIENCE)}
          </span>
          <span className="hidden lg:inline">{i18n.ABOUTME.EXPERIENCE}</span>
        </button>
        <button
          className={`btn ${activeTab === "educacion" ? "btn-primary" : "btn-neutral"} text-lg`}
          onClick={() => setActiveTab("educacion")}
        >
          <span className="lg:hidden">
            {getShortText(i18n.EDUCATION.EDUCATION_TITLE)}
          </span>
          <span className="hidden lg:inline">
            {i18n.EDUCATION.EDUCATION_TITLE}
          </span>
        </button>
        <button
          className={`btn ${activeTab === "habilidades" ? "btn-primary" : "btn-neutral"} text-lg`}
          onClick={() => setActiveTab("habilidades")}
        >
          <span className="lg:hidden">
            {getShortText(i18n.SKILLS.SKILLS_TITLE)}
          </span>
          <span className="hidden lg:inline">{i18n.SKILLS.SKILLS_TITLE}</span>
        </button>
        <button
          className={`btn ${activeTab === "sobreMi" ? "btn-primary" : "btn-neutral"} text-lg`}
          onClick={() => setActiveTab("sobreMi")}
        >
          <span className="lg:hidden">
            {getShortText(i18n.ABOUTME.ABOUT_TITLE)}
          </span>
          <span className="hidden lg:inline">{i18n.ABOUTME.ABOUT_TITLE}</span>
        </button>
      </div>
      {/* Separador solo visible en pantallas grandes */}
      <div className="divider divider-vertical lg:divider-horizontal"></div>
      {/* Contenedor del contenido del tab con un ancho flexible */}
      <div className="flex-1 w-full animate__animated animate__zoomIn">
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
