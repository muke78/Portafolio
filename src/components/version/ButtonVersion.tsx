import React, { useEffect, useState } from "react";

import { getI18N } from "../../i18n";

interface VersionSelectProps {
  currentLocale: string;
}

export const VersionSelect: React.FC<VersionSelectProps> = ({
  currentLocale,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>("");

  const i18n = getI18N({ currentLocale });

  const handleVersionSelect = (version: string) => {
    setSelectedVersion(version);
    if (version === "v1.0.0") {
      window.location.assign("https://portafoliov100.vercel.app/");
    }
  };

  useEffect(() => {
    const savedVersion = JSON.parse(localStorage.getItem("version") || '""');
    if (savedVersion === "v1.0.0") {
      setSelectedVersion("v1.0.1");
    } else {
      setSelectedVersion(savedVersion || "v1.0.1");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("version", JSON.stringify(selectedVersion));
  }, [selectedVersion]);

  return (
    <div className="dropdown">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-sm btn-ghost hover:btn-outline px-3"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          className="icon label-icon astro-eta4quzz astro-27agt67y"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.242 7.757A6 6 0 0 0 6.81 8.986l.734-.376a1 1 0 0 1 .911 1.78l-2.704 1.385l-.438-.856l.438.856a1.222 1.222 0 0 1-1.708-.678l-.985-2.761a1 1 0 0 1 1.884-.672l.123.345a8 8 0 1 1 6.364 11.971a1 1 0 0 1 .142-1.995a6 6 0 0 0 4.672-10.227M12 7.111a1 1 0 0 1 1 1v3.808c0 .317-.126.621-.35.845l-2.443 2.443a1 1 0 0 1-1.414-1.414L11 11.586V8.11a1 1 0 0 1 1-1m-5.657 9.132a1 1 0 0 1 1.414 0q.386.384.815.683a1 1 0 1 1-1.144 1.64a8 8 0 0 1-1.085-.91a1 1 0 0 1 0-1.413"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden md:inline">{i18n.VERSION.BUTTON_LABEL}</span>
        <svg
          className="w-2.5 h-2.5"
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
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        <li
          className="flex items-center justify-center text-base font-semibold cursor-pointer"
          onClick={() => handleVersionSelect("v1.0.1")}
        >
          v1.0.1 ({i18n.VERSION.VERSION_CURRENT})
        </li>
        <li
          className="flex items-center justify-center text-base font-semibold cursor-pointer"
          onClick={() => handleVersionSelect("v1.0.0")}
        >
          v1.0.0
        </li>
      </ul>
    </div>
  );
};
