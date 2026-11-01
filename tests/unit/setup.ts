import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Only the jsdom tests have a window; node tests skip all of this.
if (typeof window !== "undefined") {
	afterEach(() => {
		cleanup();
		// Open menus/dialogs lock the body (pointer-events) and leave portals
		// behind; the next test must start from a clean document.
		document.body.removeAttribute("style");
		document.body.innerHTML = "";
	});

	// jsdom lacks the layout/observer APIs the motion engine and the islands
	// feature-detect. Inert stand-ins keep them from throwing.
	class InertObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() {
			return [];
		}
	}
	// Re-applied before every test: a test that calls vi.unstubAllGlobals()
	// must not take these stand-ins with it.
	beforeEach(() => {
		vi.stubGlobal("IntersectionObserver", InertObserver);
		vi.stubGlobal("ResizeObserver", InertObserver);
	});

	if (!window.matchMedia) {
		window.matchMedia = ((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false,
		})) as typeof window.matchMedia;
	}
	window.scrollTo = (() => {}) as typeof window.scrollTo;
}
