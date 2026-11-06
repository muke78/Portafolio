import {
	type Cleanup,
	MOTION,
	type MotionTools,
	safeRefresh,
	watch,
} from "./core";

/**
 * Layered stack: the [data-stack-card] children of a [data-stack] container
 * are `position: sticky` (CSS, see ItemDataExperiencia) so each new card slides
 * over the previous one. This scene adds the depth: while the next card
 * arrives, the card under it recedes (scale) - scrubbed, no DOM moved.
 */
export const stackScenes = ({ gsap, ScrollTrigger }: MotionTools): Cleanup =>
	watch("[data-stack]", (stack) => {
		const mm = gsap.matchMedia();

		mm.add("(min-width: 1024px)", () => {
			const cards = [
				...stack.querySelectorAll<HTMLElement>("[data-stack-card]"),
			];
			const tweens = cards.slice(0, -1).map((card, i) =>
				gsap.fromTo(
					card,
					{ scale: 1 },
					{
						scale: Math.max(MOTION.stack.floor, MOTION.stack.scale - i * 0.01),
						transformOrigin: "50% 0%",
						ease: "none",
						scrollTrigger: {
							trigger: cards[i + 1],
							start: "top 85%",
							end: "top 20%",
							scrub: true,
							// Tab switched away: the cards are gone, drop the trigger.
							onRefresh: (self) => {
								if (!stack.isConnected) self.kill();
							},
						},
					},
				),
			);
			return () => {
				for (const t of tweens) {
					t.scrollTrigger?.kill();
					t.kill();
				}
				// Recompute so sticky offsets stay right after cleanup.
				safeRefresh(ScrollTrigger);
			};
		});

		return () => mm.revert();
	});
