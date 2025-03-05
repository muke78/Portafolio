import kdl from "@/img/KheldeNew.svg";
import kdlWhite from "@/img/KheldeNew.svg";
import { darkThemes } from "@/utils/dataDarkThemes";

import { useEffect, useState } from "react";

export const ImageContrast = ({ width }) => {
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  useEffect(() => {
    const initialTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setCurrentTheme(initialTheme);

    const handleThemeChange = () => {
      setCurrentTheme(document.documentElement.getAttribute("data-theme"));
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const imageSrc = darkThemes.includes(currentTheme) ? kdlWhite : kdl;

  return (
    <div className={width}>
      <img
        src={imageSrc.src}
        alt="Logotipo personal de Erick Gonzalez"
        aria-label="Logotipo personal de Erick Gonzalez"
        loading="lazy"
        className={`transition-all duration-300 rounded-sm ${darkThemes.includes(currentTheme) ? "invert opacity-80 grayscale" : ""}`}
      />
    </div>
  );
};
