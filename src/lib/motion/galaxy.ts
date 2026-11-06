import {
	EPILOGUE_FROM,
	galaxyState,
	interiorView,
	PEAK,
	projectInterior,
} from "@/lib/galaxyState";
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
	const labels = Array.from(
		document.querySelectorAll<HTMLElement>("[data-interior-label]"),
	);

	// The interior's labels ride on its cones: same camera as the canvas (projectInterior),
	// written once per frame and only while the camera is inside the diamond.
	const placeLabels = () => {
		const { cz, vis } = interiorView(galaxyState.worm);
		const w = window.innerWidth;
		const h = window.innerHeight;
		for (const el of labels) {
			const p =
				vis > 0
					? projectInterior(
							Number(el.dataset.x),
							Number(el.dataset.y),
							Number(el.dataset.z),
							cz,
							w / h,
						)
					: null;
			if (!p || Math.abs(p.x) > 1.1 || Math.abs(p.y) > 1.1) {
				el.style.opacity = "0";
				continue;
			}
			// closer = clearer; far away they fade into the fog, and right in your face they go
			const near = Math.min(1, (p.d - 0.6) / 2.5);
			const far = Math.max(0, 1 - (p.d - 7) / 8);
			el.style.opacity = String(
				Math.max(0, Math.min(1, vis * near * far * 1.4)),
			);
			el.style.transform = `translate(${(w / 2 + p.x * (w / 2)).toFixed(1)}px, ${(h / 2 - p.y * (h / 2)).toFixed(1)}px) translate(-50%, -50%)`;
		}
	};
	if (labels.length > 0) gsap.ticker.add(placeLabels);

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
		// The epilogue, scene by scene, each with its own distance and NONE on top of another
		// (share of the stretch):
		//   0    - .14   the smaller galaxy falls in and is absorbed (story -> .86)
		//   .14  - .17   calm: the merged galaxy just turns
		//   .17  - .30   the gas runs out, the light turns to embers, the stars go out (-> 1)
		//   .30  - .32   silence: only the black hole is left
		//   .32  - .47   the black hole tilts up toward you like a cup (hole 0 -> 1)
		//   .47  - .62   you fall in: the hole swells until it fills the screen, orange stars
		//                stream out, then the colours drain and only the dark is left (fall)
		//   .62  - .93   inside the diamond, in 3D: the black hole's cone, the inner horizon
		//                with the wormholes at the sides, the white hole's cone (worm)
		//   .93  - 1     the light of the white hole floods everything (exit)
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
				{ story: EPILOGUE_FROM, hole: 0, fall: 0, worm: 0, exit: 0 },
				{ story: 0.86, duration: 0.14, immediateRender: false },
				0,
			)
			.to(galaxyState, { story: 1, duration: 0.13 }, 0.17)
			.to(galaxyState, { hole: 1, duration: 0.15 }, 0.32)
			.to(galaxyState, { fall: 1, duration: 0.15 }, 0.47)
			.to(galaxyState, { worm: 1, duration: 0.31 }, 0.62)
			.to(galaxyState, { exit: 1, duration: 0.07 }, 0.93)
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
			// [in, out] as a share of the epilogue; each phrase comes AFTER what it says has
			// happened and has its own stretch; the last one leaves before the white hole.
			const beats: [number, number][] = [
				[0.145, 0.205],
				[0.215, 0.265],
				[0.275, 0.31],
				[0.325, 0.45],
				[0.565, 0.625],
				[0.64, 0.735],
				[0.75, 0.835],
				[0.85, 0.915],
			];
			lines.forEach((line, i) => {
				const [from, to] = beats[i] ?? [0.85, 0.915];
				tl.fromTo(
					line,
					{ autoAlpha: 0, y: 16 },
					{ autoAlpha: 1, y: 0, duration: 0.03 },
					from,
				);
				if (to <= 1) tl.to(line, { autoAlpha: 0, y: -12, duration: 0.03 }, to);
			});
			const veil = document.querySelector<HTMLElement>("[data-epilogue-veil]");
			if (veil) tl.to(veil, { autoAlpha: 0, duration: 0.05 }, 0.9);
			// Give the timeline its full length so the shares above are shares of the stretch.
			tl.set({}, {}, 1);
			tweens.push(tl);
		}
	}

	return () => {
		gsap.ticker.remove(placeLabels);
		for (const t of tweens) {
			(t as gsap.core.Tween).scrollTrigger?.kill();
			t.kill();
		}
		// Reduced motion mid-session: show the galaxy at its peak, still.
		galaxyState.story = PEAK;
		galaxyState.hole = 0;
		galaxyState.fall = 0;
		galaxyState.worm = 0;
		galaxyState.exit = 0;
		for (const line of lines) gsap.set(line, { clearProps: "all" });
		const veil = document.querySelector<HTMLElement>("[data-epilogue-veil]");
		if (veil) gsap.set(veil, { clearProps: "all" });
	};
};
