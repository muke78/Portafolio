import { type Cleanup, MOTION, type MotionTools, watch } from "./core";

/**
 * Horizontal pinned showcase: [data-hscroll] is a stable (Astro-rendered)
 * wrapper that pins to the viewport while the page scroll drives a sideways
 * slide of the [data-hscroll-track] inside it (cards, rendered by a React
 * island). Optional [data-hscroll-progress] fills as the track moves.
 *
 * - The wrapper is pinned, never a node React owns, so hydration and
 *   re-renders are safe. The track is only translated.
 * - The track may appear, change size (tab switch) or be replaced after
 *   hydration: its width is read lazily on every refresh and the wrapper is
 *   watched, so the scroll distance follows the content.
 * - Desktop only (>= 1024 px wide and >= 760 px tall): below that the cards
 *   stay a plain grid. The CSS that hides the native scrollbar and clips the
 *   track lives under `.motion-ok` in app.css, so without the engine (or with
 *   reduced motion) the row simply scrolls sideways by hand.
 */
export const horizontalScenes = ({
	gsap,
	ScrollTrigger,
}: MotionTools): Cleanup =>
	watch("[data-hscroll]", (root) => {
		const mm = gsap.matchMedia();

		mm.add("(min-width: 1024px) and (min-height: 760px)", () => {
			const track = () =>
				root.querySelector<HTMLElement>("[data-hscroll-track]");
			const viewport = () =>
				root.querySelector<HTMLElement>("[data-hscroll-viewport]");
			const bar = () =>
				root.querySelector<HTMLElement>("[data-hscroll-progress]");

			// How far the track can slide (px); 0 while it is a skeleton.
			const distance = () => {
				const t = track();
				const v = viewport();
				if (!t || !v) return 0;
				return Math.max(0, t.scrollWidth - v.clientWidth);
			};

			const trigger = ScrollTrigger.create({
				trigger: root,
				start: "top top+=72",
				// Scroll length follows the content, capped like every pinned scene.
				end: () =>
					`+=${Math.round(
						Math.max(
							1,
							Math.min(
								distance(),
								window.innerHeight * MOTION.hscroll.maxScreens,
							),
						),
					)}`,
				pin: true,
				pinSpacing: true,
				anticipatePin: 1,
				invalidateOnRefresh: true,
				onUpdate: (self) => {
					const t = track();
					if (t) {
						gsap.to(t, {
							x: -self.progress * distance(),
							duration: 0.5,
							ease: MOTION.ease,
							overwrite: true,
						});
					}
					const b = bar();
					if (b) gsap.set(b, { scaleX: self.progress });
				},
			});

			// Content changed (tab switch, data arrived): measure again.
			let timer: number | undefined;
			const mo = new MutationObserver(() => {
				window.clearTimeout(timer);
				timer = window.setTimeout(() => {
					const t = track();
					if (t) gsap.set(t, { x: 0 });
					ScrollTrigger.refresh();
				}, 120);
			});
			mo.observe(root, { childList: true, subtree: true });

			return () => {
				mo.disconnect();
				window.clearTimeout(timer);
				trigger.kill();
				const t = track();
				if (t) gsap.set(t, { clearProps: "transform" });
			};
		});

		return () => mm.revert();
	});

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
						scale: MOTION.stack.scale - i * 0.01,
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
				ScrollTrigger.refresh();
			};
		});

		return () => mm.revert();
	});
