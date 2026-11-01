import type { Cleanup, MotionTools } from "./core";

/**
 * Reading progress: a hairline at the top of the page ([data-scroll-progress])
 * fills with the scroll position. Purely decorative (aria-hidden), invisible
 * without the engine.
 */
export const scrollProgress = ({ gsap }: MotionTools): Cleanup | undefined => {
	const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
	if (!bar) return;

	const tween = gsap.fromTo(
		bar,
		{ scaleX: 0 },
		{
			scaleX: 1,
			ease: "none",
			scrollTrigger: {
				trigger: document.documentElement,
				start: "top top",
				end: "max",
				scrub: 0.3,
			},
		},
	);
	return () => {
		tween.scrollTrigger?.kill();
		tween.kill();
		gsap.set(bar, { clearProps: "transform" });
	};
};
