import {
	EPILOGUE_FROM,
	galaxyState,
	PEAK,
	penroseView,
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
		document.querySelectorAll<HTMLElement>("[data-penrose-label]"),
	);

	// The Penrose diagram's labels ride on its diamonds: same maths as the canvas
	// (penroseView), written once per frame, only while the diagram is visible.
	const placeLabels = () => {
		const { zoom, alpha } = penroseView(galaxyState.fall, galaxyState.worm);
		const w = window.innerWidth;
		const h = window.innerHeight;
		for (const el of labels) {
			const x = Number(el.dataset.x);
			const y = Number(el.dataset.y);
			const px = w / 2 + ((x * zoom) / (w / h)) * (w / 2);
			const py = h / 2 - y * zoom * (h / 2);
			const inside = px > -80 && px < w + 80 && py > -40 && py < h + 40;
			el.style.opacity = inside ? String(Math.min(1, alpha * 1.3)) : "0";
			el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -50%) rotate(${el.dataset.rot ?? 0}deg)`;
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
		// The epilogue, scene by scene, each with its own distance (share of the stretch):
		//   0    - .20   the smaller galaxy falls in and is absorbed (story -> .86)
		//   .20  - .24   calm: the merged galaxy just turns, nothing changes
		//   .24  - .43   the gas runs out, the light turns to embers, the stars go out (-> 1)
		//   .43  - .45   silence: only the black hole is left
		//   .45  - .60   the black hole comes toward you and bends the new stars (hole 0 -> 1)
		//   .60  - .76   you fall in: the stars streak out of the hole (fall 0 -> 1)
		//   .76  - .93   the wormhole is crossed from end to end (worm 0 -> 1)
		//   .93  - 1     the white hole floods everything with light (exit 0 -> 1)
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
				{ story: 0.86, duration: 0.2, immediateRender: false },
				0,
			)
			.to(galaxyState, { story: 1, duration: 0.19 }, 0.24)
			.to(galaxyState, { hole: 1, duration: 0.15 }, 0.45)
			.to(galaxyState, { fall: 1, duration: 0.16 }, 0.6)
			.to(galaxyState, { worm: 1, duration: 0.17 }, 0.76)
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
				[0.21, 0.27],
				[0.28, 0.35],
				[0.36, 0.43],
				[0.46, 0.58],
				[0.62, 0.74],
				[0.8, 0.92],
			];
			lines.forEach((line, i) => {
				const [from, to] = beats[i] ?? [0.8, 0.92];
				tl.fromTo(
					line,
					{ autoAlpha: 0, y: 16 },
					{ autoAlpha: 1, y: 0, duration: 0.06 },
					from,
				);
				if (to <= 1) tl.to(line, { autoAlpha: 0, y: -12, duration: 0.05 }, to);
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
