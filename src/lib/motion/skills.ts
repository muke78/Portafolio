import {
	type Cleanup,
	MOTION,
	type MotionTools,
	REVEALED,
	settle,
	watch,
} from "./core";

const DESKTOP = "(min-width: 768px)";
const MOBILE = "(max-width: 767px)";

/**
 * Skills adrift (MotionPathPlugin). The theme is space: every
 * [data-fly-chip] of a [data-fly-group] drifts in from nearby, as if it were
 * floating up out of the depth - along a slow, wide arc, a few degrees off
 * level, a little smaller and fainter - and settles into its place. The
 * approach is scrubbed by the scroll with a long lag (`MOTION.fly.scrub`), so
 * it feels weightless. Once it has arrived, the pill inside ([data-fly-body])
 * keeps drifting by itself, a few pixels, forever (paused while off-screen).
 *
 * - Chips are real, laid-out DOM (no JS: they simply sit there). The path is
 *   in the chip's own x/y space, so (0, 0) is its final position.
 * - The <li> moves with the scroll; the pill inside floats on its own, so the
 *   two never fight over the same transform.
 * - Desktop only. Small screens get a quiet staggered fade-up.
 */
export const skillFlights = ({ gsap, ScrollTrigger }: MotionTools): Cleanup =>
	watch("[data-fly-group]", (group) => {
		const chips = [...group.querySelectorAll<HTMLElement>("[data-fly-chip]")];
		if (!chips.length) return;
		const mm = gsap.matchMedia();

		mm.add(DESKTOP, () => {
			const rand = gsap.utils.random;
			const { fly } = MOTION;
			const tl = gsap.timeline({
				defaults: { ease: "none" },
				scrollTrigger: {
					trigger: group,
					start: "top 108%",
					end: "top 28%",
					scrub: fly.scrub,
				},
			});

			chips.forEach((chip, i) => {
				const side = i % 2 === 0 ? -1 : 1;
				const at = i * fly.stagger;
				const far = rand(fly.near, fly.far);
				tl.set(
					chip,
					{ autoAlpha: 0, rotation: rand(-fly.tilt, fly.tilt), scale: 0.7 },
					0,
				);
				// One tween per chip (path + fade + tilt + scale together): a
				// cheaper timeline to scrub than four per chip.
				tl.to(
					chip,
					{
						autoAlpha: 1,
						rotation: 0,
						scale: 1,
						duration: 1.6,
						ease: "sine.inOut",
						motionPath: {
							// One wide, lazy arc: in from the side and below, a gentle
							// swing past, then home at (0, 0).
							path: [
								{ x: side * far, y: rand(80, 200) },
								{ x: side * far * 0.35, y: rand(-60, -20) },
								{ x: -side * rand(14, 30), y: rand(6, 16) },
								{ x: 0, y: 0 },
							],
							type: "thru",
							curviness: 1.1,
						},
					},
					at,
				);
			});

			for (const chip of chips) chip.setAttribute(REVEALED, "");

			// Idle drift of each pill: tiny, slow, out of phase. Only while the
			// group is on screen.
			const drifts = chips.flatMap((chip) => {
				const body = chip.querySelector<HTMLElement>("[data-fly-body]");
				if (!body) return [];
				return [
					gsap.to(body, {
						x: rand(-5, 5),
						y: rand(-9, 9),
						rotation: rand(-2.2, 2.2),
						duration: rand(3.6, 6.4),
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
						delay: rand(0, 2.5),
						paused: true,
					}),
				];
			});
			const watcher = ScrollTrigger.create({
				trigger: group,
				start: "top bottom",
				end: "bottom top",
				onToggle: (self) => {
					for (const d of drifts) self.isActive ? d.play() : d.pause();
				},
			});

			return () => {
				watcher.kill();
				for (const d of drifts) d.kill();
				tl.scrollTrigger?.kill();
				tl.kill();
				for (const chip of chips) {
					settle(chip);
					const body = chip.querySelector<HTMLElement>("[data-fly-body]");
					if (body) gsap.set(body, { clearProps: "all" });
				}
			};
		});

		mm.add(MOBILE, () => {
			const tween = gsap.fromTo(
				chips,
				{ autoAlpha: 0, y: 18 },
				{
					autoAlpha: 1,
					y: 0,
					duration: 0.7,
					ease: MOTION.ease,
					stagger: 0.05,
					scrollTrigger: { trigger: group, start: "top 90%", once: true },
					onComplete: () => {
						for (const chip of chips) settle(chip);
					},
				},
			);
			for (const chip of chips) chip.setAttribute(REVEALED, "");
			return () => {
				tween.scrollTrigger?.kill();
				tween.kill();
				for (const chip of chips) settle(chip);
			};
		});

		return () => mm.revert();
	});

/**
 * The snake line behind the skills: a faint full path, a bright trace that is
 * drawn as the section scrolls by, and a dot that rides the trace
 * (MotionPathPlugin `align`). Desktop only; decorative (aria-hidden).
 */
export const snakeLine = ({ gsap }: MotionTools): Cleanup =>
	watch("[data-snake]", (svg) => {
		const trace = svg.querySelector<SVGPathElement>("[data-snake-trace]");
		const stage = svg.parentElement;
		const dot = stage?.querySelector<HTMLElement>("[data-snake-dot]");
		if (!trace || !stage || !dot) return;
		const mm = gsap.matchMedia();

		mm.add(DESKTOP, () => {
			const tl = gsap.timeline({
				defaults: { ease: "none" },
				scrollTrigger: {
					trigger: stage,
					start: "top 75%",
					end: "bottom 45%",
					scrub: 0.6,
				},
			});
			tl.fromTo(
				trace,
				{ strokeDashoffset: 1, strokeDasharray: 1 },
				{ strokeDashoffset: 0 },
				0,
			);
			tl.fromTo(
				dot,
				{ autoAlpha: 0 },
				{ autoAlpha: 1, duration: 0.02, ease: "none" },
				0,
			);
			tl.to(
				dot,
				{
					motionPath: {
						path: trace,
						align: trace,
						alignOrigin: [0.5, 0.5],
						start: 0,
						end: 1,
					},
				},
				0,
			);
			return () => {
				tl.scrollTrigger?.kill();
				tl.kill();
				gsap.set([trace, dot], { clearProps: "all" });
			};
		});

		return () => mm.revert();
	});
