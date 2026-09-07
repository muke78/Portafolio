// hooks/useTheme.ts
import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const applyTheme = (theme: Theme) => {
	document.documentElement.classList.toggle("dark", theme === "dark");
};

export const useTheme = () => {
	const [theme, setTheme] = useState<Theme | "">("");

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		setTheme(stored ?? (prefersDark ? "dark" : "light"));

		const handleThemeChange = (e: CustomEvent<Theme>) => {
			setTheme(e.detail);
		};
		window.addEventListener("themeChange", handleThemeChange as EventListener);

		return () =>
			window.removeEventListener(
				"themeChange",
				handleThemeChange as EventListener,
			);
	}, []);

	// Cambiar theme y disparar evento custom (dos <ThemeDrop> montados a la
	// vez -nav desktop + sidebar movil- se sincronizan via este evento)
	const toggleTheme = () => {
		const newTheme: Theme = theme === "dark" ? "light" : "dark";
		localStorage.setItem(STORAGE_KEY, newTheme);
		setTheme(newTheme);
		window.dispatchEvent(
			new CustomEvent<Theme>("themeChange", { detail: newTheme }),
		);
		applyTheme(newTheme);
	};

	return { theme, toggleTheme, mounted: !!theme };
};
