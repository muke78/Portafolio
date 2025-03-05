import { dataListNavbarEN } from "@/utils/en/dataNavbarEN.astro";
import { dataListNavbar } from "@/utils/es/dataNavbar.astro";
import { dataListNavbarFR } from "@/utils/fr/dataNavbarFR.astro";

import React from "react";

interface NavbarItem {
  to: string;
  label: string;
}

interface Props {
  currentLocale: string;
}

export const ItemsNavDraw: React.FC<Props> = ({ currentLocale }) => {
  const dataChange: NavbarItem[] =
    currentLocale === "es"
      ? dataListNavbar
      : currentLocale === "fr"
        ? dataListNavbarFR
        : dataListNavbarEN;
  return (
    <>
      {dataChange.map((list) => (
        <li key={list.to}>
          <a href={list.to} aria-label={`Ir a ${list.label}`}>
            {" "}
            {list.label}{" "}
          </a>
        </li>
      ))}
    </>
  );
};
