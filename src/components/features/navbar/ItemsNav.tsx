import type { NavbarItem, PropsLang } from "@/interfaces/currentLang.interface";
import { dataListNavbarEN } from "@/utils/en/dataNavbarEN";
import { dataListNavbar } from "@/utils/es/dataNavbar";
import { dataListNavbarFR } from "@/utils/fr/dataNavbarFR";

import { useEffect, useMemo, useState } from "react";

const langTraduceData: Record<string, typeof dataListNavbar> = {
  es: dataListNavbar,
  en: dataListNavbarEN,
  fr: dataListNavbarFR,
};

export const ItemsNav = ({ currentLocale }: PropsLang) => {
  const [activeSection, setActiveSection] = useState<string>("");

  const memorization: NavbarItem[] = useMemo(
    () => langTraduceData[currentLocale] || dataListNavbar,
    [currentLocale],
  );

  useEffect(() => {
    const handleScroll = () => {
      let currentId = "";

      memorization.forEach((item) => {
        const section = document.querySelector(item.to) as HTMLElement;
        if (section) {
          const sectionTop = section.offsetTop - 32; // margen superior
          const sectionHeight = section.offsetHeight;
          if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
          ) {
            currentId = item.to;
          }
        }
      });

      setActiveSection(currentId);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // ejecuta en el montaje
    return () => window.removeEventListener("scroll", handleScroll);
  }, [memorization]);

  return (
    <>
      {memorization.map((list) => {
        const isActive = activeSection === list.to;
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
