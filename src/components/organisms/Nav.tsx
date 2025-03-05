import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { ItemsNav } from "../features/navbar/ItemsNav";
import { LangDrop } from "../features/navbar/LangDrop";
import { ThemeDrop } from "../features/navbar/ThemeSwitch";
import { ImageContrast } from "../utils/ImageContrast";

export const Nav = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    const themeButtons = document.querySelectorAll("[data-set-theme]");

    const handleThemeClick = (event: Event) => {
      const button = event.currentTarget as HTMLElement;
      const theme = button.getAttribute("data-set-theme");
      localStorage.setItem("theme", theme || "");
      document.documentElement.setAttribute("data-theme", theme || "");
    };

    themeButtons.forEach((button) => {
      button.addEventListener("click", handleThemeClick);
    });
    return () => {
      themeButtons.forEach((button) => {
        button.removeEventListener("click", handleThemeClick);
      });
    };
  }, []);

  return (
    <nav className="navbar bg-base-100 rounded-b-lg py-3 px-5 sticky top-0 left-0 w-full z-50 flex items-center">
      {/* Logo */}
      <div className="flex-grow items-center gap-4">
        <ImageContrast width="w-24" />
      </div>
      <div className="flex gap-3">
        {/* Navbar Principal */}
        <ul className="hidden min-[670px]:flex space-x-6">
          <ItemsNav currentLocale={"es"} />
        </ul>

        {/* Selector de Idioma */}
        <LangDrop />

        {/* Botón para Cambiar Tema */}
        <ThemeDrop />

        {/* Botón Menú para Mobile */}
        <button
          onClick={toggleSidebar}
          className="min-[670px]:hidden btn btn-ghost text-base"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay para cerrar sidebar al hacer clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`fixed top-0 right-0 h-full w-72 bg-primary shadow-lg z-50 p-4 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* Botón para cerrar */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 btn btn-ghost dark:text-white text-white"
        >
          <X size={24} />
        </button>

        {/* Contenido del Sidebar */}
        <div className="w-full text-3xl">
          <ul className="space-y-4 flex flex-col justify-center items-center gap-8 dark:text-white text-white">
            <ItemsNav currentLocale={"es"} />
          </ul>
        </div>
      </motion.div>
    </nav>
  );
};
