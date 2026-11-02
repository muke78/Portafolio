/**
 * Motion engine - shared core (GSAP + ScrollTrigger + SplitText).
 *
 * Everything that animates on this site goes through src/lib/motion/*; see
 * docs/UI_STANDARDS.md sections 7 and 12.4. Nothing here runs on import and
 * nothing touches `window` until initMotion() is called (client only), so
 * the module graph is SSR-safe.
 */
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
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
	marquee: { maxBoost: 4, maxSkew: 3 },
	// Image masks: a frame opens (clip-path) while its picture settles (scale).
	mask: {
		duration: 1.1,
		ease: "power4.inOut",
		scaleFrom: 1.25,
	},
	// Groups of items entering one after another (stack icons, fields, links).
	stagger: { duration: 0.8, distance: 20, each: 0.07 },
	// Lowest opacity of a "not read yet" word (scrubbed text). Floors that keep
	// the dimmed text legible in each theme: contrast >= 3:1 for large text and
	// >= 4.5:1 for body text, measured by tests/unit/dimmedText.test.ts.
	dim: {
		large: { light: 0.5, dark: 0.4 },
		body: { light: 0.65, dark: 0.52 },
	},
	// Particle galaxy (galaxy.ts): scroll length of the collapse+blast and of
	// the move to the corner, in viewport heights; scrub lag.
	galaxy: { burstScreens: 1.2, settleScreens: 1.4, scrub: 1.2 },
	// Skills adrift (skills.ts): seconds between chips inside the scrubbed
	// timeline, the largest tilt (degrees) a chip starts with, how far (px) it
	// drifts in from, and the scrub lag (higher = floatier).
	fly: { stagger: 0.09, tilt: 14, near: 240, far: 460, scrub: 1.8 },
	// Pinned sideways showcase and layered stack (layers.ts).
	hscroll: { maxScreens: 2.5, smooth: 0.7 },
	stack: { scale: 0.95, floor: 0.88 },
	// Project detail page: intro timeline and scroll-linked depth.
	detail: { total: 2, figureScale: 0.92, imgDrift: 7 },
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
	gsap.registerPlugin(
		ScrollTrigger,
		SplitText,
		MotionPathPlugin,
		ScrollToPlugin,
	);
	// Phones: the URL bar showing/hiding resizes the window while scrolling;
	// that must not recompute every pin.
	ScrollTrigger.config({ ignoreMobileResize: true });
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

/**
 * Opacity a word starts from in scrubbed text. Never lower than the floor
 * that keeps it readable (WCAG 1.4.3) in the current theme; "large" is text
 * of 24 px and up.
 */
export const dimFloor = (el: Element): number => {
	const theme = document.documentElement.classList.contains("dark")
		? "dark"
		: "light";
	const size = fontSizeOf(el);
	return MOTION.dim[size >= 24 ? "large" : "body"][theme];
};

// GSAP evaluates `opacity: () => dimFloor(el)` once per word, and each
// evaluation is followed by a write, so every getComputedStyle forced a style
// recalculation (a reflow per word). The size is read once per element per
// synchronous pass; the cache is dropped right after, so a later refresh
// (resize, font load) measures again.
const fontSizes = new WeakMap<Element, number>();
const fontSizeOf = (el: Element): number => {
	let size = fontSizes.get(el);
	if (size === undefined) {
		size = Number.parseFloat(getComputedStyle(el).fontSize);
		fontSizes.set(el, size);
		queueMicrotask(() => fontSizes.delete(el));
	}
	return size;
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
 * Astro drops `ssr` as soon as it *starts* hydrating; React finishes a few
 * frames later. Touching the DOM in between is still a hydration mismatch, so
 * anything inside an island waits this long after the island went live.
 */
export const HYDRATION_SETTLE_MS = 160;

/**
 * Runs `run` once, the first time `el` is on screen - or already above it
 * (the reader jumped past). Unlike a ScrollTrigger `once`, it reads the live
 * geometry, so fast jumps (anchor links, the scrollbar), pins and late layout
 * shifts cannot leave an entrance stuck in its hidden state.
 */
export const whenSeen = (
	el: Element,
	run: () => void,
	rootMargin = "0px 0px -12% 0px",
): Cleanup => {
	let done = false;
	const io = new IntersectionObserver(
		(entries) => {
			if (done) return;
			const seen = entries.some(
				(e) => e.isIntersecting || e.boundingClientRect.bottom < 0,
			);
			if (!seen) return;
			done = true;
			io.disconnect();
			run();
		},
		{ rootMargin },
	);
	io.observe(el);
	return () => {
		done = true;
		io.disconnect();
	};
};

/**
 * ScrollTrigger throws on a refresh if one of its triggers lost its element
 * (React replaced the node). Drop those first, and never let a refresh error
 * escape: a broken refresh leaves pins half-applied.
 */
export const safeRefresh = (st: typeof ScrollTrigger) => {
	for (const t of st.getAll()) {
		const el = t.trigger;
		if (el instanceof Element && !el.isConnected) t.kill();
	}
	try {
		st.refresh();
	} catch (err) {
		console.warn("ScrollTrigger refresh failed:", err);
	}
};

const liveAt = new WeakMap<Element, number>();

/** Starts noting when each island goes live (call once, from the client). */
export const trackIslands = (): Cleanup => {
	const mo = new MutationObserver((mutations) => {
		for (const m of mutations) {
			if (m.target instanceof Element) liveAt.set(m.target, performance.now());
		}
	});
	mo.observe(document.body, {
		subtree: true,
		attributes: true,
		attributeFilter: ["ssr"],
	});
	return () => mo.disconnect();
};

/**
 * True while an element sits in an island that has not hydrated, or went
 * live moments ago and may still be hydrating: do not touch its DOM or its
 * inline styles yet.
 */
export const isHydrating = (el: Element): boolean => {
	const island = el.closest("astro-island");
	if (!island) return false;
	if (island.hasAttribute("ssr")) return true;
	const at = liveAt.get(island);
	return at !== undefined && performance.now() - at < HYDRATION_SETTLE_MS;
};

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
		const run = () => {
			if (!el.isConnected) return;
			try {
				const cleanup = handler(el as HTMLElement);
				if (cleanup) cleanups.push(cleanup);
			} catch (err) {
				// One element's scene failing must not stop the rest of the page.
				console.warn(`Motion scene failed for ${selector}:`, err);
			}
		};
		if (isHydrating(el)) {
			const t = window.setTimeout(run, HYDRATION_SETTLE_MS);
			cleanups.push(() => window.clearTimeout(t));
		} else {
			// Static HTML, or an element React mounted after the island was
			// already live (dialogs, fetched lists): safe to run right away.
			run();
		}
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
