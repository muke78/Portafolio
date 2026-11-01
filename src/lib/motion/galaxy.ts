import { galaxyState } from "@/lib/galaxyState";
import { type Cleanup, MOTION, type MotionTools } from "./core";

/**
 * The particle galaxy follows the scroll (components/three/ParticleGalaxy.tsx
 * only reads galaxyState):
 *
 *   0 .. burstScreens                  burst 0 -> 1: the stardust gathers and
 *                                      explodes into the spiral
 *   burstScreens .. + settleScreens    settle 0 -> 1: the finished galaxy
 *                                      drifts to the corner, smaller
 *
 * Distances are viewport-relative (function values re-read on refresh), never
 * pixel constants. Without this scene (reduced motion) the canvas draws the
 * finished galaxy still.
 */
export const galaxyScene = ({ gsap }: MotionTools): Cleanup => {
	const { burstScreens, settleScreens, scrub } = MOTION.galaxy;
	const vh = () => window.innerHeight;

	const burst = gsap.to(galaxyState, {
		burst: 1,
		ease: "none",
		scrollTrigger: {
			start: 0,
			end: () => vh() * burstScreens,
			scrub,
			invalidateOnRefresh: true,
		},
	});
	const settle = gsap.to(galaxyState, {
		settle: 1,
		ease: "none",
		scrollTrigger: {
			start: () => vh() * burstScreens,
			end: () => vh() * (burstScreens + settleScreens),
			scrub,
			invalidateOnRefresh: true,
		},
	});

	return () => {
		for (const t of [burst, settle]) {
			t.scrollTrigger?.kill();
			t.kill();
		}
		galaxyState.burst = 1;
		galaxyState.settle = 1;
	};
};
