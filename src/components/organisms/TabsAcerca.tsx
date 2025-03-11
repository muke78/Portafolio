import { Educacion } from "@/components/features/aboutMe/Educacion";
import { Experiencia } from "@/components/features/aboutMe/Experiencia";
import { Habilidades } from "@/components/features/aboutMe/Habilidades";
import { SobreMi } from "@/components/features/aboutMe/SobreMi";
import { getI18N } from "@/i18n";

import React, { useEffect, useState } from "react";

export const TabsAcerca = ({ currentLocale }) => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  const i18n = getI18N({ currentLocale });

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    setActiveTab(savedTab);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab, mounted]);

  return (
    <div className="flex flex-col lg:flex-row w-5/6 lg:w-full h-1/2">
      {/* Contenedor de los botones con un ancho fijo */}
      <div className="flex flex-col gap-4 w-full h-full lg:w-1/3 lg:pl-20">
        <button
          className={`btn ${activeTab === "experiencia" ? "btn-primary" : "btn-neutral"}  text-lg w-full`}
          onClick={() => setActiveTab("experiencia")}
        >
          {i18n.ABOUTME.EXPERIENCE}
        </button>
        <button
          className={`btn ${activeTab === "educacion" ? "btn-primary" : "btn-neutral"} text-lg w-full`}
          onClick={() => setActiveTab("educacion")}
        >
          {i18n.EDUCATION.EDUCATION_TITLE}
        </button>
        <button
          className={`btn ${activeTab === "habilidades" ? "btn-primary" : "btn-neutral"} text-lg w-full `}
          onClick={() => setActiveTab("habilidades")}
        >
          {i18n.SKILLS.SKILLS_TITLE}
        </button>
        <button
          className={`btn ${activeTab === "sobreMi" ? "btn-primary" : "btn-neutral"} text-lg w-full`}
          onClick={() => setActiveTab("sobreMi")}
        >
          {i18n.ABOUTME.ABOUT_TITLE}
        </button>
      </div>
      {/* Separador solo visible en pantallas grandes */}
      <div className="divider divider-vertical lg:divider-horizontal"></div>
      {/* Contenedor del contenido del tab con un ancho flexible */}
      <div className="flex-1 w-full">
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
