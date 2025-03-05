import { defaultLang, languages } from "@/i18n/ui";

import React, { useState } from "react";

export const LangDrop = () => {
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const selectLanguage = (lang: string) => {
    setSelectedLang(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="btn btn-ghost flex items-center gap-2"
      >
        <img
          src={languages[selectedLang].img.src}
          alt={languages[selectedLang].label}
          className="w-5 h-5 rounded-full"
        />

        <span className="hidden min-[440px]:inline">
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
              onClick={() => selectLanguage(key)}
              className="flex items-center gap-2 w-full px-4 py-2 text-left rounded-md hover:bg-base-200"
            >
              <img src={img.src} alt={label} className="w-5 h-5 rounded-full" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
