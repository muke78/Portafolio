import { dataListNavbarEN } from "@/utils/en/dataNavbarEN";
import { dataListNavbar } from "@/utils/es/dataNavbar";
import { dataListNavbarFR } from "@/utils/fr/dataNavbarFR";

import React, { useEffect, useState } from "react";

interface NavbarItem {
  to: string;
  label: string;
}

interface Props {
  currentLocale: string;
  currentPath: string;
}

export const ItemsNav: React.FC<Props> = ({ currentLocale, currentPath }) => {
  const path = currentPath.length >= 4 ? currentPath.slice(4) : currentPath;
  const [pathIsActive, setPathIsActive] = useState<string>("");

  useEffect(() => {
    setPathIsActive(path);
  }, [path]);

  const dataChange: NavbarItem[] =
    currentLocale === "es"
      ? dataListNavbar
      : currentLocale === "fr"
        ? dataListNavbarFR
        : dataListNavbarEN;

  return (
    <>
      {dataChange.map((list) => {
        const isActive = pathIsActive === list.to;
        return (
          <li
            key={list.to}
            className={`
              relative transition-all w-min-content p-1
              before:w-0 before:h-1 before:absolute before:bottom-0 before:right-0 before:bg-neutral before:transition-all before:duration-500
              hover:before:w-full hover:before:left-0 before:rounded-full
              ${isActive ? "text-primary font-bold before:w-full before:bg-primary" : ""}
            `}
          >
            <a href={list.to} aria-label={`Ir a ${list.label}`}>
              {list.label}
            </a>
          </li>
        );
      })}
    </>
  );
};
