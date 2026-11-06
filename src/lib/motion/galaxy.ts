import { galaxyState } from "@/lib/galaxyState";
import { type Cleanup, MOTION, type MotionTools } from "./core";

/**
 * The particle galaxy follows the scroll of the WHOLE page (components/three/
 * ParticleGalaxy.tsx only reads galaxyState): `story` goes 0 -> 1 from the top of the
 * page to the very bottom, so the viewer sees a galaxy being born (header) and, as they
 * go down, the stars gather into clouds, the gas falls in, the disc spins up, the first
 * stars ignite, the spiral arms and a black hole appear, a smaller galaxy is absorbed,
 * and by the footer it has gone out. See the header of ParticleGalaxy.tsx for the ranges.
 *
 * The distance is the real scroll length (re-read on every refresh, so it follows the
 * lazy islands and images growing the page), never a pixel constant. Without this scene
 * (reduced motion) the canvas draws the galaxy still, at its healthy peak.
 */
export const galaxyScene = ({ gsap, ScrollTrigger }: MotionTools): Cleanup => {
	const story = gsap.to(galaxyState, {
		story: 1,
		ease: "none",
		scrollTrigger: {
			start: 0,
			end: () => ScrollTrigger.maxScroll(window),
			scrub: MOTION.galaxy.scrub,
			invalidateOnRefresh: true,
		},
	});

	return () => {
		story.scrollTrigger?.kill();
		story.kill();
		// Reduced motion mid-session: show the galaxy at its peak, still.
		galaxyState.story = 0.72;
	};
};
