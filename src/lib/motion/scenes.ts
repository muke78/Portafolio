import { type Cleanup, dimFloor, MOTION, type MotionTools } from "./core";

/**
 * Pinned manifesto scene (src/components/sections/Manifiesto.astro).
 *
 * The section pins to the viewport and the page "reads" a statement while
 * you scroll: the words light up one after another (scrubbed, so the reader
 * controls the pace), two huge technology tracks slide in opposite
 * directions, a hairline progress bar fills and a few chips pop in near the
 * end. Same family of effect as the pinned "why GSAP" block on gsap.com.
 *
 * With reduced motion this scene never runs: the statement is plain text.
 */
export const manifestoScene = ({
	gsap,
	SplitText,
}: MotionTools): Cleanup | undefined => {
	const section = document.querySelector<HTMLElement>("[data-manifesto]");
	const text = section?.querySelector<HTMLElement>("[data-manifesto-text]");
	if (!section || !text) return;

	const tracks = Array.from(
		section.querySelectorAll<HTMLElement>("[data-manifesto-track]"),
	);
	const chips = Array.from(
		section.querySelectorAll<HTMLElement>("[data-manifesto-chip]"),
	);
	const bar = section.querySelector<HTMLElement>("[data-manifesto-progress]");

	const mobile = window.matchMedia("(max-width: 767px)").matches;
	const screens = mobile
		? MOTION.manifesto.screensMobile
		: MOTION.manifesto.screens;

	// SplitText also sets aria-label on the original element, so screen
	// readers still read the sentence as a whole.
	const split = SplitText.create(text, { type: "words" });

	const tl = gsap.timeline({
		defaults: { ease: "none" },
		scrollTrigger: {
			trigger: section,
			start: "top top+=72",
			end: () => `+=${Math.round(window.innerHeight * screens)}`,
			pin: true,
			pinSpacing: true,
			scrub: 1,
			anticipatePin: 1,
			invalidateOnRefresh: true,
		},
	});

	// 1. Words light up in reading order.
	tl.fromTo(
		split.words,
		// Never fainter than the legible floor (see MOTION.dim).
		{ opacity: () => dimFloor(text) },
		{ opacity: 1, duration: 0.5, stagger: { each: 0.18 } },
		0,
	);
	const total = tl.duration();

	// 2. Technology tracks drift in opposite directions for the whole scene.
	tracks.forEach((track, i) => {
		const from = i % 2 === 0 ? 0 : -40;
		const to = i % 2 === 0 ? -40 : 0;
		tl.fromTo(track, { xPercent: from }, { xPercent: to, duration: total }, 0);
	});

	// 3. Progress hairline.
	if (bar) {
		tl.fromTo(
			bar,
			{ scaleX: 0 },
			{ scaleX: 1, duration: total, transformOrigin: "left center" },
			0,
		);
	}

	// 4. Chips pop in near the end, like the tags on gsap.com.
	if (chips.length) {
		tl.fromTo(
			chips,
			{ scale: 0.4, rotation: (i: number) => (i % 2 ? 8 : -8), autoAlpha: 0 },
			{
				scale: 1,
				rotation: (i: number) => (i % 2 ? 3 : -3),
				autoAlpha: 1,
				duration: total * 0.18,
				ease: "back.out(2.4)",
				stagger: total * 0.05,
			},
			total * 0.62,
		);
	}

	return () => {
		tl.scrollTrigger?.kill();
		tl.kill();
		split.revert();
	};
};
