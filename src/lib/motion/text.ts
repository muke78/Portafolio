import { type Cleanup, dimFloor, type MotionTools, watch } from "./core";

/**
 * Reading scrub: the words of a [data-scrub-text] paragraph start dim and
 * light up one after another while the paragraph crosses the viewport (the
 * same idea as the pinned manifesto, without pinning). Text stays complete in
 * the DOM (aria "none": no aria-label on a <p>). Once the
 * paragraph has crossed, every word is at full opacity.
 */
export const scrubText = ({ gsap, SplitText }: MotionTools): Cleanup =>
	watch("[data-scrub-text]", (el) => {
		const split = SplitText.create(el, {
			type: "words",
			aria: "none",
			autoSplit: true,
			onSplit: (self) =>
				gsap.fromTo(
					self.words,
					// Floor keeps the not-yet-read words legible in both themes.
					{ opacity: () => dimFloor(el) },
					{
						opacity: 1,
						ease: "none",
						stagger: 0.1,
						scrollTrigger: {
							trigger: el,
							start: "top 85%",
							end: "bottom 55%",
							scrub: true,
							invalidateOnRefresh: true,
						},
					},
				),
		});
		return () => split.revert();
	});
