// hooks/useTheme.ts
import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "winter";
    setTheme(stored);

    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail);
    };
    window.addEventListener("themeChange", handleThemeChange as EventListener);

    return () =>
      window.removeEventListener(
        "themeChange",
        handleThemeChange as EventListener,
      );
  }, []);

  // Cambiar theme y disparar evento custom
  const toggleTheme = () => {
    const newTheme = theme === "winter" ? "night" : "winter";
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
    window.dispatchEvent(new CustomEvent("themeChange", { detail: newTheme }));
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return { theme, toggleTheme, mounted: !!theme };
};
