import {
	type Cleanup,
	MOTION,
	type MotionTools,
	REVEALED,
	settle,
} from "./core";

/**
 * Project detail page (/[lang]/project/[id]). Marked by [data-detail] on
 * <main>; the parts it animates:
 *
 *   [data-detail-back]    "back" button (header), slides in from the left
 *   [data-detail-meta]    category label
 *   [data-detail-title]   the h1: characters rise out of line masks
 *   [data-detail-figure]  hero picture frame: opens from the bottom, then
 *                         shrinks a little while you scroll down to read
 *   [data-detail-img]     the picture: settles from a zoom, then drifts
 *                         (parallax) inside the frame
 *
 * The stack icons, links, description and "next project" use the generic
 * data-stagger / data-scrub-text / data-split / data-reveal hooks.
 */
export const projectDetail = ({
	gsap,
	SplitText,
}: MotionTools): Cleanup | undefined => {
	if (!document.querySelector("[data-detail]")) return;

	const pick = (selector: string) =>
		document.querySelector<HTMLElement>(selector);
	const back = pick("[data-detail-back]");
	const meta = pick("[data-detail-meta]");
	const title = pick("[data-detail-title]");
	const figure = pick("[data-detail-figure]");
	const img = pick("[data-detail-img]");

	const split = title
		? SplitText.create(title, { type: "lines,chars", mask: "lines" })
		: undefined;

	const tl = gsap.timeline({
		defaults: { ease: MOTION.ease },
		onComplete: () => {
			split?.revert();
			for (const el of [back, meta, title]) if (el) settle(el);
			if (figure) gsap.set(figure, { clearProps: "clipPath" });
		},
	});

	if (back) {
		// fromTo, not from: CSS hides these parts, so a plain `from` would read
		// opacity 0 as the end value and animate 0 -> 0.
		tl.fromTo(
			back,
			{ autoAlpha: 0, x: -16 },
			{ autoAlpha: 1, x: 0, duration: 0.7 },
			0,
		);
	}
	if (meta) {
		tl.fromTo(
			meta,
			{ autoAlpha: 0, y: 12 },
			{ autoAlpha: 1, y: 0, duration: 0.7 },
			0.1,
		);
	}
	if (split) {
		const chars = split.chars;
		tl.from(
			chars,
			{
				yPercent: 115,
				duration: 1,
				ease: "power4.out",
				stagger: Math.min(0.03, 0.9 / Math.max(chars.length, 1)),
			},
			0.2,
		);
	}
	if (figure) {
		tl.fromTo(
			figure,
			{ clipPath: "inset(100% 0% 0% 0%)" },
			{
				clipPath: "inset(0% 0% 0% 0%)",
				duration: 1.3,
				ease: MOTION.mask.ease,
			},
			0.45,
		);
	}
	if (img) {
		tl.fromTo(
			img,
			{ scale: 1.35 },
			{ scale: 1, duration: 1.8, ease: MOTION.ease },
			0.45,
		);
	}

	// First frames are inline now: CSS can stop hiding the parts.
	for (const el of [back, meta, title, figure]) el?.setAttribute(REVEALED, "");

	// Scroll-linked depth: the frame recedes while the text takes over, and
	// the picture drifts inside it. Both only move transform.
	if (figure) {
		gsap.to(figure, {
			scale: MOTION.detail.figureScale,
			transformOrigin: "50% 0%",
			ease: "none",
			scrollTrigger: {
				trigger: figure,
				start: "top 25%",
				end: "bottom top",
				scrub: true,
			},
		});
	}
	if (img && figure) {
		gsap.fromTo(
			img,
			{ yPercent: -MOTION.detail.imgDrift },
			{
				yPercent: MOTION.detail.imgDrift,
				ease: "none",
				scrollTrigger: {
					trigger: figure,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
				},
			},
		);
	}

	return () => {
		tl.kill();
		split?.revert();
		for (const el of [back, meta, title]) if (el) settle(el);
		if (figure) gsap.set(figure, { clearProps: "clipPath" });
	};
};
