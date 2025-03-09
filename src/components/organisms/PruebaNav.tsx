import { Educacion } from "@/components/features/aboutMe/Educacion";
import { Experiencia } from "@/components/features/aboutMe/Experiencia";
import { Habilidades } from "@/components/features/aboutMe/Habilidades";
import { SobreMi } from "@/components/features/aboutMe/SobreMi";

import React, { useEffect, useState } from "react";

export const PruebaNav = ({ currentLocale }) => {
  const [activeTab, setActiveTab] = useState<string>("experiencia");
  const [mounted, setMounted] = useState<boolean>(false);

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
    <div className="flex flex-col lg:flex-row w-full h-1/2">
      {/* Contenedor de los botones con un ancho fijo */}
      <div className="flex flex-col gap-4 w-full h-full lg:w-1/3 lg:pl-20">
        <button
          className={`btn ${activeTab === "experiencia" ? "btn-primary" : "btn-neutral"}  text-lg w-full`}
          onClick={() => setActiveTab("experiencia")}
        >
          Experiencia
        </button>
        <button
          className={`btn ${activeTab === "educacion" ? "btn-primary" : "btn-neutral"} text-lg w-full`}
          onClick={() => setActiveTab("educacion")}
        >
          Educación
        </button>
        <button
          className={`btn ${activeTab === "habilidades" ? "btn-primary" : "btn-neutral"} text-lg w-full `}
          onClick={() => setActiveTab("habilidades")}
        >
          Habilidades
        </button>
        <button
          className={`btn ${activeTab === "sobreMi" ? "btn-primary" : "btn-neutral"} text-lg w-full`}
          onClick={() => setActiveTab("sobreMi")}
        >
          Sobre Mi
        </button>
      </div>
      <div className="divider divider-vertical lg:divider-horizontal"></div>
      {/* Contenedor del contenido del tab con un ancho flexible */}
      <div className="flex-1 lg:pl-12 p-2 w-full">
        {activeTab === "experiencia" && <Experiencia />}
        {activeTab === "educacion" && <Educacion />}
        {activeTab === "habilidades" && <Habilidades />}
        {activeTab === "sobreMi" && <SobreMi currentLocale={currentLocale} />}
      </div>
    </div>
  );
};
