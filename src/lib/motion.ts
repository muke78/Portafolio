/**
 * Central motion module (GSAP + ScrollTrigger).
 *
 * Single entry point for every scroll/entrance animation, per
 * docs/UI_STANDARDS.md section 7. Nothing here runs on import and nothing
 * touches `window` until a function is called, so it is safe to import
 * from Astro frontmatter or SSR-rendered React without crashing the
 * server — but it only *does* anything in the browser.
 *
 * Rules baked in:
 * - Everything runs inside gsap.matchMedia() under
 *   "prefers-reduced-motion: no-preference". With "reduce" nothing is
 *   registered, so content stays visible and static.
 * - Only `transform` and `opacity` are animated (compositor, 60 fps).
 * - GSAP sets the hidden initial state (gsap.from), never the CSS, so the
 *   content is visible if JS fails.
 * - Callers get a cleanup function; call it when an island unmounts.
 *
 * Usage:
 *   const stop = revealOnScroll("[data-reveal-group]");
 *   // ...on unmount
 *   stop();
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Media query under which motion is allowed. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Shared timing/easing, mirrors the table in UI_STANDARDS 7.3. */
export const MOTION = {
	ease: "power3.out",
	reveal: { duration: 0.7, distance: 24, stagger: 0.1, start: "top 85%" },
	parallax: { amplitude: 8 }, // percent of the element's own height
} as const;

export interface MotionTools {
	gsap: typeof gsap;
	ScrollTrigger: typeof ScrollTrigger;
}

let registered = false;

const isBrowser = () => typeof window !== "undefined";

const register = () => {
	if (registered) return;
	gsap.registerPlugin(ScrollTrigger);
	registered = true;
};

/**
 * Runs `setup` only in the browser and only while the user allows motion.
 * Animations and ScrollTriggers created inside are reverted automatically
 * when the preference flips to "reduce", and by the returned cleanup.
 */
export const withMotion = (
	setup: (tools: MotionTools) => void,
): (() => void) => {
	if (!isBrowser()) return () => {};
	register();
	const mm = gsap.matchMedia();
	mm.add(MOTION_OK, () => {
		setup({ gsap, ScrollTrigger });
	});
	return () => mm.revert();
};

/**
 * Fade-up reveal with stagger, played once when the group enters the
 * viewport. Children are the elements matching `itemSelector` inside each
 * group (default `[data-reveal]`); a group with no matches animates itself.
 */
export const revealOnScroll = (
	groupSelector: string,
	itemSelector = "[data-reveal]",
): (() => void) =>
	withMotion(({ gsap, ScrollTrigger }) => {
		for (const group of gsap.utils.toArray<HTMLElement>(groupSelector)) {
			const items = group.querySelectorAll<HTMLElement>(itemSelector);
			gsap.from(items.length ? items : group, {
				opacity: 0,
				y: MOTION.reveal.distance,
				duration: MOTION.reveal.duration,
				ease: MOTION.ease,
				stagger: MOTION.reveal.stagger,
				scrollTrigger: {
					trigger: group,
					start: MOTION.reveal.start,
					once: true,
				},
			});
		}
		// Islands and lazy images settle after load and move the targets.
		ScrollTrigger.refresh();
	});

/**
 * Subtle scroll-linked parallax for decorative elements only.
 * `data-parallax` can carry a custom amplitude (percent), e.g. "12".
 */
export const parallaxOnScroll = (selector = "[data-parallax]"): (() => void) =>
	withMotion(({ gsap }) => {
		for (const el of gsap.utils.toArray<HTMLElement>(selector)) {
			const amplitude =
				Number(el.dataset.parallax) || MOTION.parallax.amplitude;
			gsap.fromTo(
				el,
				{ yPercent: -amplitude },
				{
					yPercent: amplitude,
					ease: "none",
					scrollTrigger: {
						trigger: el,
						start: "top bottom",
						end: "bottom top",
						scrub: true,
					},
				},
			);
		}
	});

/**
 * Recomputes every ScrollTrigger position. Call after anything that
 * changes page height post-load (client:visible islands, lazy images,
 * the 3D canvas). Waits for web fonts first: the large serif headlines
 * change height when they load.
 */
export const refreshScrollTriggers = async (): Promise<void> => {
	if (!isBrowser() || !registered) return;
	await document.fonts?.ready;
	ScrollTrigger.refresh();
};
