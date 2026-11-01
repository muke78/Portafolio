/**
 * Motion engine entry point (GSAP + ScrollTrigger + SplitText).
 *
 * How the page talks to the engine - data attributes, nothing else:
 *
 *   [data-hero] + data-hero-*  orchestrated load + scrubbed exit (hero.ts)
 *   [data-reveal]              fade-up with batch stagger on entering (reveals.ts)
 *   [data-manifesto] + parts   pinned, scrubbed reading scene (scenes.ts)
 *   [data-split]               titles rising line by line out of a mask (split.ts)
 *   [data-parallax=N]          decorative parallax (media.ts)
 *   [data-parallax-img]        image drift inside a card frame (media.ts)
 *   [data-marquee] + track     velocity-driven marquee + lean (media.ts)
 *   [data-mask]                frame that opens like a curtain (masks.ts)
 *   [data-stagger] + items     children entering one by one (masks.ts)
 *   [data-scrub-text]          words lighting up with the scroll (text.ts)
 *   [data-hscroll] + track     pinned sideways showcase (layers.ts)
 *   [data-stack] + cards       layered sticky stack with depth (layers.ts)
 *   [data-fly-group] + chips   skills flying along curves, MotionPath (skills.ts)
 *   [data-snake] + trace/dot   snake line drawn with the scroll (skills.ts)
 *   [data-detail] + parts     project detail intro + depth (detail.ts)
 *   [data-scroll-progress]     reading progress hairline (page.ts)
 *
 * Accessibility: everything is registered under
 * "prefers-reduced-motion: no-preference" (withMotion). With "reduce"
 * nothing runs and every element is simply visible. CSS hides the initial
 * state ONLY while <html> has .motion-ok, a class set by an inline script in
 * <head> (JS available AND motion allowed) and removed by a 4 s watchdog if
 * the engine never starts, so content cannot get stuck invisible.
 */
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
	type Cleanup,
	isBrowser,
	isRegistered,
	MOTION_CLASS,
	trackIslands,
	withMotion,
} from "./core";
import { projectDetail } from "./detail";
import { playHero } from "./hero";
import { horizontalScenes, stackScenes } from "./layers";
import { maskReveals, staggerGroups } from "./masks";
import { cardImageParallax, marquees, setupParallax } from "./media";
import { scrollProgress } from "./page";
import { observeReveals } from "./reveals";
import { manifestoScene } from "./scenes";
import { skillFlights, snakeLine } from "./skills";
import { splitTitles } from "./split";
import { scrubText } from "./text";

export {
	byVisualOrder,
	MOTION,
	MOTION_CLASS,
	MOTION_OK,
	type MotionTools,
	withMotion,
} from "./core";

/** Recomputes ScrollTrigger positions after late layout shifts. */
export const refreshScrollTriggers = async (): Promise<void> => {
	if (!isBrowser() || !isRegistered()) return;
	await document.fonts?.ready;
	ScrollTrigger.refresh();
};

/**
 * Starts the whole engine. Call once per page from the client (Layout.astro).
 * Returns a stop function that reverts everything.
 */
export const initMotion = (): Cleanup => {
	if (!isBrowser()) return () => {};

	return withMotion((tools) => {
		document.documentElement.classList.add(MOTION_CLASS);

		const stops: (Cleanup | undefined)[] = [
			trackIslands(),
			playHero(tools),
			observeReveals(tools),
			manifestoScene(tools),
			splitTitles(tools),
			setupParallax(tools),
			cardImageParallax(tools),
			marquees(tools),
			maskReveals(tools),
			staggerGroups(tools),
			scrubText(tools),
			horizontalScenes(tools),
			stackScenes(tools),
			skillFlights(tools),
			snakeLine(tools),
			projectDetail(tools),
			scrollProgress(tools),
		];

		// Layout keeps moving after load (lazy images, islands, web fonts).
		let timer: number | undefined;
		const refresh = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => void refreshScrollTriggers(), 150);
		};
		const ro = new ResizeObserver(refresh);
		ro.observe(document.body);
		window.addEventListener("load", refresh);
		void refreshScrollTriggers();

		window.__motionReady = true;

		return () => {
			for (const stop of stops) stop?.();
			ro.disconnect();
			window.removeEventListener("load", refresh);
			window.clearTimeout(timer);
			// Reduced motion turned on mid-session: show everything.
			document.documentElement.classList.remove(MOTION_CLASS);
		};
	});
};
