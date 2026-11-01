import { type Cleanup, type MotionTools, watch } from "./core";

/**
 * Reading scrub: the words of a [data-scrub-text] paragraph start dim and
 * light up one after another while the paragraph crosses the viewport (the
 * same idea as the pinned manifesto, without pinning). Text stays complete in
 * the DOM; SplitText keeps an aria-label for assistive tech. Once the
 * paragraph has crossed, every word is at full opacity.
 */
export const scrubText = ({ gsap, SplitText }: MotionTools): Cleanup =>
	watch("[data-scrub-text]", (el) => {
		const split = SplitText.create(el, {
			type: "words",
			autoSplit: true,
			onSplit: (self) =>
				gsap.fromTo(
					self.words,
					{ opacity: 0.22 },
					{
						opacity: 1,
						ease: "none",
						stagger: 0.1,
						scrollTrigger: {
							trigger: el,
							start: "top 85%",
							end: "bottom 55%",
							scrub: true,
						},
					},
				),
		});
		return () => split.revert();
	});
