/**
 * Motion engine - shared core (GSAP + ScrollTrigger + SplitText).
 *
 * Everything that animates on this site goes through src/lib/motion/*; see
 * docs/UI_STANDARDS.md sections 7 and 12.4. Nothing here runs on import and
 * nothing touches `window` until initMotion() is called (client only), so
 * the module graph is SSR-safe.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/** Media query under which motion is allowed. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Class on <html> that lets CSS hide not-yet-revealed elements. */
export const MOTION_CLASS = "motion-ok";

/** Shared timing/easing, mirrors the table in UI_STANDARDS 7.3. */
export const MOTION = {
	ease: "power3.out",
	easeInOut: "power3.inOut",
	reveal: {
		duration: 0.8,
		distance: 24,
		stagger: 0.09,
		rootMargin: "0px 0px -10% 0px",
	},
	parallax: { amplitude: 6 }, // percent of the element's own size
	hero: { total: 1.7 },
	// Pinned manifesto: how many viewport heights of scroll it lasts.
	manifesto: { screens: 2, screensMobile: 1.4 },
	marquee: { maxBoost: 4 },
} as const;

export interface MotionTools {
	gsap: typeof gsap;
	ScrollTrigger: typeof ScrollTrigger;
	SplitText: typeof SplitText;
}

declare global {
	interface Window {
		__motionReady?: boolean;
	}
}

/** A function that undoes whatever a scene created. */
export type Cleanup = () => void;

let registered = false;

export const isBrowser = () => typeof window !== "undefined";

const register = () => {
	if (registered) return;
	gsap.registerPlugin(ScrollTrigger, SplitText);
	registered = true;
};

export const isRegistered = () => registered;

/**
 * Runs `setup` only in the browser and only while the user allows motion.
 * `setup` may return a cleanup function; it runs (together with reverting
 * every tween/trigger created inside) when the preference flips to
 * "reduce" or when the returned stop function is called.
 */
export const withMotion = (
	// biome-ignore lint/suspicious/noConfusingVoidType: matches gsap.matchMedia contract (the callback may return a cleanup or nothing)
	setup: (tools: MotionTools) => void | Cleanup,
): Cleanup => {
	if (!isBrowser()) return () => {};
	register();
	const mm = gsap.matchMedia();
	mm.add(MOTION_OK, () => setup({ gsap, ScrollTrigger, SplitText }));
	return () => mm.revert();
};

/** Visual reading order (top to bottom, then left to right). */
export const byVisualOrder = (
	a: { top: number; left: number },
	b: { top: number; left: number },
): number => a.top - b.top || a.left - b.left;

export const REVEALED = "data-revealed";

/** Marks an element as done: CSS stops hiding it and GSAP leaves it alone. */
export const settle = (el: Element) => {
	el.setAttribute(REVEALED, "");
	gsap.set(el, { clearProps: "all" });
};

/**
 * An element inside an Astro island that has not hydrated yet must not be
 * touched: React would read GSAP's inline styles / DOM edits as a hydration
 * mismatch. Astro removes the island's `ssr` attribute once it is live.
 */
export const UNHYDRATED = "astro-island[ssr]";

/**
 * Runs `handler` for every element matching `selector`, now and whenever
 * one appears later (islands hydrating, tab switches, data arriving). The
 * handler runs once per element, only after its island has hydrated, and
 * may return a cleanup. Returns a function that stops watching and runs
 * every cleanup.
 */
export const watch = (
	selector: string,
	// biome-ignore lint/suspicious/noConfusingVoidType: a handler may return a cleanup or nothing
	handler: (el: HTMLElement) => void | Cleanup,
): Cleanup => {
	const done = new WeakSet<Element>();
	const cleanups: Cleanup[] = [];

	const tryRun = (el: Element) => {
		if (done.has(el) || el.closest(UNHYDRATED)) return;
		done.add(el);
		const cleanup = handler(el as HTMLElement);
		if (cleanup) cleanups.push(cleanup);
	};
	const scan = (root: ParentNode) => {
		if (root instanceof Element && root.matches(selector)) tryRun(root);
		for (const el of root.querySelectorAll(selector)) tryRun(el);
	};

	const mo = new MutationObserver((mutations) => {
		for (const m of mutations) {
			if (m.type === "attributes") {
				// An island just became interactive: look inside it.
				if (m.target instanceof Element) scan(m.target);
				continue;
			}
			for (const node of m.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) scan(node as Element);
			}
		}
	});
	mo.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["ssr"],
	});
	scan(document);

	return () => {
		mo.disconnect();
		for (const cleanup of cleanups.splice(0)) cleanup();
	};
};
