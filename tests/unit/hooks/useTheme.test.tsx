// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "@/hooks/useTheme";

const prefersDark = (dark: boolean) =>
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches: dark,
		media: query,
		addEventListener() {},
		removeEventListener() {},
	}));

describe("useTheme", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.remove("dark");
	});

	it("follows the system preference when nothing is stored", () => {
		prefersDark(true);
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("dark");
		expect(result.current.mounted).toBe(true);
	});

	it("falls back to light when the system prefers light", () => {
		prefersDark(false);
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("light");
	});

	it("prefers the stored choice over the system", () => {
		prefersDark(true);
		localStorage.setItem("theme", "light");
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("light");
	});

	it("toggles, persists, flips the html class and notifies other switches", () => {
		prefersDark(false);
		const { result } = renderHook(() => useTheme());
		const heard = vi.fn();
		window.addEventListener("themeChange", heard);

		act(() => result.current.toggleTheme());

		expect(result.current.theme).toBe("dark");
		expect(localStorage.getItem("theme")).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(heard).toHaveBeenCalledTimes(1);

		act(() => result.current.toggleTheme());
		expect(document.documentElement.classList.contains("dark")).toBe(false);
		window.removeEventListener("themeChange", heard);
	});

	it("stays in sync with a switch toggled elsewhere", () => {
		prefersDark(false);
		const { result } = renderHook(() => useTheme());
		act(() => {
			window.dispatchEvent(new CustomEvent("themeChange", { detail: "dark" }));
		});
		expect(result.current.theme).toBe("dark");
	});
});
