import { type Cleanup, MOTION, type MotionTools, settle } from "./core";
import { INTRO_OPEN_EVENT } from "./intro";

/**
 * Everything the hero sequence animates. CSS hides these (only while
 * html.motion-ok) until the timeline settles them.
 */
const HERO_PARTS =
	"[data-hero-label], [data-hero-line], [data-hero-lead], [data-hero-cta] > *, [data-hero-portrait], [data-hero-rings], [data-hero-ring-accent], [data-hero-bar]";

/**
 * Hero, part 1 - the load sequence (~1.7 s): label, the name rising line by
 * line out of its mask, lead, actions, the arch opening bottom-up, the orbit
 * ring being drawn, the bar. Part 2 (heroScrollExit) takes over once it ends.
 *
 * While the intro gate is up (html.intro-on) nothing plays: the sequence waits for
 * INTRO_OPEN_EVENT. After the Big Bang the label, lead, actions, portrait, rings and
 * bar are thrown out of the centre of the screen (the name keeps rising out of its
 * mask); after "skip" the normal load sequence runs.
 */
export const playHero = (tools: MotionTools): Cleanup | undefined => {
	const { gsap } = tools;
	const hero = document.querySelector<HTMLElement>("[data-hero]");
	if (!hero) return;

	const all = (selector: string) =>
		Array.from(hero.querySelectorAll<HTMLElement>(selector));
	const label = all("[data-hero-label]");
	const lines = all("[data-hero-line]");
	const lead = all("[data-hero-lead]");
	const actions = all("[data-hero-cta] > *");
	const cover = all("[data-hero-cover]");
	const portraitImg = all("[data-hero-portrait] img");
	const rings = all("[data-hero-rings]");
	const solidRing = all("[data-hero-ring-solid]");
	const ringAccents = all("[data-hero-ring-accent]");
	const bar = all("[data-hero-bar]");

	// The solid ring is drawn on: pathLength=1 makes dash math resolution-free.
	gsap.set(solidRing, { strokeDasharray: 1, strokeDashoffset: 1 });

	let stopExit: Cleanup | undefined;
	let tl: gsap.core.Timeline | undefined;

	// Where each part flies in from: the middle of the screen, shrunk and spinning.
	const fromCenter = {
		x: (_i: number, el: HTMLElement) => {
			const r = el.getBoundingClientRect();
			return window.innerWidth / 2 - (r.left + r.width / 2);
		},
		y: (_i: number, el: HTMLElement) => {
			const r = el.getBoundingClientRect();
			return window.innerHeight / 2 - (r.top + r.height / 2);
		},
		scale: 0,
		rotation: () => gsap.utils.random(-140, 140),
		autoAlpha: 0,
	};
	const toPlace = {
		x: 0,
		y: 0,
		scale: 1,
		rotation: 0,
		autoAlpha: 1,
		duration: 1.7,
		ease: "power4.out",
		stagger: { amount: 0.5, from: "center" as const },
	};
	const portrait = all("[data-hero-portrait]");

	const run = (bang: boolean) => {
		tl = gsap.timeline({
			defaults: { ease: MOTION.ease },
			onComplete: () => {
				for (const el of hero.querySelectorAll(HERO_PARTS)) settle(el);
				for (const el of cover) el.remove();
				gsap.set(solidRing, { clearProps: "strokeDasharray,strokeDashoffset" });
				gsap.set(ringAccents, { clearProps: "all" });
				gsap.set(portraitImg, { clearProps: "all" });
				// Only now is it safe to scrub the same elements with scroll.
				stopExit = heroScrollExit(tools, hero);
			},
		});

		if (bang) {
			tl.fromTo(portrait, fromCenter, toPlace, 0).fromTo(
				label,
				fromCenter,
				toPlace,
				0.1,
			);
		} else {
			tl.fromTo(
				label,
				{ autoAlpha: 0, y: 12 },
				{ autoAlpha: 1, y: 0, duration: 0.6 },
				0.1,
			);
		}
		tl.fromTo(
			lines,
			// autoAlpha: CSS keeps the line at opacity 0 until the engine runs;
			// the mask (overflow-hidden parent) hides it while it is at 115 %.
			{ yPercent: 115, autoAlpha: 1 },
			{
				yPercent: 0,
				autoAlpha: 1,
				duration: 1.1,
				ease: "power4.out",
				stagger: 0.12,
			},
			0.15,
		)
			.fromTo(
				lead,
				bang ? fromCenter : { autoAlpha: 0, y: 24 },
				bang ? toPlace : { autoAlpha: 1, y: 0, duration: 0.9 },
				0.55,
			)
			.fromTo(
				actions,
				bang ? fromCenter : { autoAlpha: 0, y: 18 },
				bang ? toPlace : { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 },
				0.7,
			)
			// The arch opens bottom-up: the cover shrinks toward the top edge.
			.fromTo(
				cover,
				{ scaleY: 1, transformOrigin: "50% 0%" },
				{ scaleY: 0, duration: 1.2, ease: MOTION.easeInOut },
				0.25,
			)
			.fromTo(portraitImg, { scale: 1.18 }, { scale: 1, duration: 1.6 }, 0.25)
			.fromTo(
				rings,
				{ autoAlpha: 0 },
				{ autoAlpha: 1, duration: 0.8, ease: "none" },
				0.7,
			)
			.to(
				solidRing,
				{ strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" },
				0.7,
			)
			.fromTo(
				ringAccents,
				{ autoAlpha: 0 },
				{ autoAlpha: 1, duration: 0.9, ease: "none" },
				1.1,
			)
			.fromTo(
				bar,
				bang ? fromCenter : { autoAlpha: 0, y: 12 },
				bang ? toPlace : { autoAlpha: 1, y: 0, duration: 0.8 },
				1.0,
			);
	};

	// With the gate up, wait for the Big Bang (or the skip); otherwise play now.
	if (document.documentElement.classList.contains("intro-on")) {
		const onOpen = (e: Event) =>
			run((e as CustomEvent<{ bang: boolean }>).detail?.bang === true);
		window.addEventListener(INTRO_OPEN_EVENT, onOpen, { once: true });
		return () => {
			window.removeEventListener(INTRO_OPEN_EVENT, onOpen);
			tl?.kill();
			stopExit?.();
		};
	}
	run(false);

	return () => {
		tl?.kill();
		stopExit?.();
	};
};

/**
 * Hero, part 2 - the scrubbed exit. While the first screen scrolls away the
 * two name lines slide apart, the lead and actions drift up and fade, the
 * portrait recedes and the orbit rotates: the hero comes apart instead of
 * just scrolling off.
 */
const heroScrollExit = (
	{ gsap }: MotionTools,
	hero: HTMLElement,
): Cleanup | undefined => {
	const lines = Array.from(
		hero.querySelectorAll<HTMLElement>("[data-hero-line]"),
	);
	const copy = Array.from(
		hero.querySelectorAll<HTMLElement>("[data-hero-lead], [data-hero-cta]"),
	);
	const portrait = hero.querySelector<HTMLElement>("[data-hero-portrait]");
	const rings = hero.querySelector<HTMLElement>("[data-hero-rings]");

	const tl = gsap.timeline({
		defaults: { ease: "none" },
		scrollTrigger: {
			trigger: hero,
			start: "top top+=72",
			end: "bottom top+=72",
			scrub: 1,
		},
	});
	if (lines[0]) tl.to(lines[0], { xPercent: -16 }, 0);
	if (lines[1]) tl.to(lines[1], { xPercent: 12 }, 0);
	if (copy.length) tl.to(copy, { y: -48, autoAlpha: 0.15 }, 0);
	if (portrait) tl.to(portrait, { yPercent: -5, scale: 0.94 }, 0);
	if (rings) tl.to(rings, { rotation: 38, transformOrigin: "50% 50%" }, 0);

	return () => {
		tl.scrollTrigger?.kill();
		tl.kill();
	};
};
