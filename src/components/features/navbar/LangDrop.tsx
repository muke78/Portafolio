import { getI18N } from "@/i18n";
import { languages } from "@/i18n/ui";

import React, { useEffect, useRef, useState } from "react";

interface langDropProps {
  currentLocale: string;
}

export const LangDrop: React.FC<langDropProps> = ({ currentLocale }) => {
  const [selectedLang, setSelectedLang] = useState<string>(currentLocale);
  const [isOpen, setIsOpen] = useState(false);
  const [i18n, setI18n] = useState(() =>
    getI18N({ currentLocale: currentLocale }),
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener el idioma actual de la URL
  useEffect(() => {
    const langFromPath = window.location.pathname.split("/")[1];
    const lang = Object.keys(languages).includes(langFromPath)
      ? langFromPath
      : currentLocale;

    setSelectedLang(lang);
    setI18n(getI18N({ currentLocale: lang }));
  }, []);

  // Cerrar dropdown si se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (lang: string) => {
    setSelectedLang(lang);
    setIsOpen(false);
    setI18n(getI18N({ currentLocale: lang }));

    const newPath = `/${lang}/${window.location.pathname.split("/").slice(2).join("/")}`;
    window.location.href = newPath;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="btn btn-ghost flex items-center gap-2"
      >
        <img
          src={languages[selectedLang].img.src}
          alt="Banderas"
          className="w-5 h-5 rounded-full"
        />

        <span className="hidden min-[440px]:inline text-lg">
          {languages[selectedLang].label}
        </span>
        <svg
          className="w-2.5 h-2.5 ms-1"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-40 bg-base-100 shadow-2xl rounded-xl z-10">
          {Object.entries(languages).map(([key, { label, img }]) => (
            <button
              key={key}
              aria-label="Boton para cambio de idiomas"
              onClick={() => selectLanguage(key)}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-lg rounded-xl hover:bg-base-200"
            >
              <img
                src={img.src}
                alt="Banderas Drop"
                className="w-5 h-5 rounded-full"
              />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
