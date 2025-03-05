import { dataListNavbarEN } from "@/utils/en/dataNavbarEN.astro";
import { dataListNavbar } from "@/utils/es/dataNavbar.astro";
import { dataListNavbarFR } from "@/utils/fr/dataNavbarFR.astro";

import React from "react";

import { ThemeDrop } from "./ThemeSwitch";

interface NavbarItem {
  to: string;
  label: string;
}

interface Props {
  currentLocale: string;
}

export const ItemsNav: React.FC<Props> = ({ currentLocale }) => {
  const dataChange: NavbarItem[] =
    currentLocale === "es"
      ? dataListNavbar
      : currentLocale === "fr"
        ? dataListNavbarFR
        : dataListNavbarEN;

  return (
    <>
      {dataChange.map((list) => (
        <li
          key={list.to}
          className="
        relative transition-all w-min-content p-1
        before:w-0 before:h-1 before:absolute before:bottom-0 before:right-0 before:bg-neutral before:transition-all before:duration-700
        hover:before:w-full hover:before:left-0 hover:before:bg-secondary before:rounded-full
        "
        >
          <a href={list.to} aria-label={`Ir a ${list.label}`}>
            {list.label}
          </a>
        </li>
      ))}
    </>
  );
};
