import { EPILOGUE_FROM, galaxyState, PEAK } from "@/lib/galaxyState";
import { type Cleanup, MOTION, type MotionTools } from "./core";

/**
 * The particle galaxy follows the scroll (components/three/ParticleGalaxy.tsx only reads
 * galaxyState): `story` goes 0 -> 1 and the canvas tells how a galaxy is born, lives and
 * dies. The ranges of each phase are in the header of ParticleGalaxy.tsx.
 *
 *  - From the top of the page to the epilogue: story 0 -> EPILOGUE_FROM. The stars gather
 *    into clouds, the gas falls in, the disc spins up, the first stars ignite, the arms
 *    wind up. All of it behind the content, as a living background.
 *  - In the epilogue ([data-epilogue], a transparent stretch between the contact and the
 *    footer with a sticky stage): story EPILOGUE_FROM -> 1. The galaxy sits in the middle of
 *    an empty stage and, in the open, a smaller one is absorbed, the gas runs out, the
 *    stars go out and only the black hole is left. Nothing covers it and it covers nothing:
 *    the footer and the name ("Khelde.") come after. One phrase per beat
 *    ([data-epilogue-line]) says what is happening.
 *
 * Distances are the real positions of the DOM (re-read on every refresh, so they follow
 * the lazy islands and images growing the page), never pixel constants. Without the
 * epilogue the whole page is used. Without this scene (reduced motion) the canvas draws
 * the galaxy still, at its healthy peak.
 */
export const galaxyScene = ({ gsap, ScrollTrigger }: MotionTools): Cleanup => {
	const { scrub } = MOTION.galaxy;
	const stage = document.querySelector<HTMLElement>("[data-epilogue]");
	const lines = Array.from(
		document.querySelectorAll<HTMLElement>("[data-epilogue-line]"),
	);
	const tweens: gsap.core.Animation[] = [];

	const pageEnd = () => ScrollTrigger.maxScroll(window);
	const top = () =>
		stage
			? stage.getBoundingClientRect().top +
				window.scrollY -
				window.innerHeight * 0.7
			: pageEnd();
	// The sticky stage lasts until the section's bottom reaches the bottom of the screen:
	// the story ends a little before the footer starts to come up.
	const bottom = () =>
		stage
			? stage.getBoundingClientRect().bottom +
				window.scrollY -
				window.innerHeight * 1.25
			: pageEnd();

	tweens.push(
		gsap.fromTo(
			galaxyState,
			{ story: 0 },
			{
				story: stage ? EPILOGUE_FROM : 1,
				ease: "none",
				scrollTrigger: {
					start: 0,
					end: top,
					scrub,
					invalidateOnRefresh: true,
				},
			},
		),
	);

	if (stage) {
		// The epilogue, scene by scene, each with its own distance (share of the stretch):
		//   0    - .30   the smaller galaxy falls in and is absorbed (story -> .86)
		//   .30  - .36   calm: the merged galaxy just turns, nothing changes
		//   .36  - .64   the gas runs out, the light turns to embers, the stars go out (-> 1)
		//   .64  - .66   silence: only the black hole is left
		//   .66  - 1     the black hole comes toward you and bends the new stars (hole 0 -> 1)
		const tl0 = gsap.timeline({
			defaults: { ease: "none" },
			scrollTrigger: {
				start: top,
				end: bottom,
				scrub,
				invalidateOnRefresh: true,
			},
		});
		tl0
			.fromTo(
				galaxyState,
				{ story: EPILOGUE_FROM, hole: 0 },
				{ story: 0.86, duration: 0.3, immediateRender: false },
				0,
			)
			.to(galaxyState, { story: 1, duration: 0.28 }, 0.36)
			.to(galaxyState, { hole: 1, duration: 0.34 }, 0.66)
			.set({}, {}, 1);
		tweens.push(tl0);

		// One phrase per beat, scrubbed with the same stretch: the merger, the embers, the
		// stars going out, the silence.
		if (lines.length > 0) {
			const tl = gsap.timeline({
				defaults: { ease: "none" },
				scrollTrigger: {
					start: top,
					end: bottom,
					scrub: true,
					invalidateOnRefresh: true,
				},
			});
			// [in, out] as a share of the epilogue; the last phrase stays. Each phrase comes
			// AFTER what it says has happened (the merge is over by .30, the stars go out
			// between .36 and .64, the black hole is alone from .66) and has its own stretch.
			const beats: [number, number][] = [
				[0.31, 0.4],
				[0.42, 0.52],
				[0.54, 0.63],
				[0.67, 2],
			];
			lines.forEach((line, i) => {
				const [from, to] = beats[i] ?? [0.9, 2];
				tl.fromTo(
					line,
					{ autoAlpha: 0, y: 16 },
					{ autoAlpha: 1, y: 0, duration: 0.06 },
					from,
				);
				if (to <= 1) tl.to(line, { autoAlpha: 0, y: -12, duration: 0.05 }, to);
			});
			// Give the timeline its full length so the shares above are shares of the stretch.
			tl.set({}, {}, 1);
			tweens.push(tl);
		}
	}

	return () => {
		for (const t of tweens) {
			(t as gsap.core.Tween).scrollTrigger?.kill();
			t.kill();
		}
		// Reduced motion mid-session: show the galaxy at its peak, still.
		galaxyState.story = PEAK;
		galaxyState.hole = 0;
		for (const line of lines) gsap.set(line, { clearProps: "all" });
	};
};
