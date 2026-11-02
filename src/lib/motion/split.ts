import {
	type Cleanup,
	type MotionTools,
	REVEALED,
	watch,
	whenSeen,
} from "./core";

/**
 * Section titles: [data-split] headings are split into lines, each line
 * sitting in a mask, and the lines rise out of it when the title enters the
 * viewport (once). SplitText keeps the heading readable by assistive tech
 * (aria-label) and `autoSplit` re-splits on resize and font load.
 *
 * Titles live in React islands, so they are processed only after the
 * island hydrated (watch()); CSS hides them until then (motion-ok only).
 */
export const splitTitles = ({ gsap, SplitText }: MotionTools): Cleanup =>
	watch("[data-split]", (el) => {
		let stopSeen: Cleanup | undefined;
		const split = SplitText.create(el, {
			type: "lines",
			mask: "lines",
			autoSplit: true,
			onSplit: (self) => {
				const tween = gsap.from(self.lines, {
					yPercent: 110,
					duration: 1,
					ease: "power4.out",
					stagger: 0.1,
					paused: true,
				});
				// Play when the title is seen (see whenSeen), not on a scroll mark.
				stopSeen?.();
				stopSeen = whenSeen(el, () => tween.play(), "0px 0px -10% 0px");
				return tween;
			},
		});
		// Lines are already masked (gsap.from renders its first frame now):
		// the heading itself can stop being hidden.
		el.setAttribute(REVEALED, "");
		return () => {
			stopSeen?.();
			split.revert();
		};
	});
