import {
	type Cleanup,
	isHydrating,
	MOTION,
	type MotionTools,
	safeRefresh,
	watch,
	whenSeen,
} from "./core";

/**
 * Query under which a category rail is pinned and driven by the scroll. Keep it
 * equal to the one in app.css (it is the one that clips the track): below it
 * (phones in portrait, very short windows) the rail is a native swipeable row
 * with snap, which is lighter and what a thumb expects.
 */
export const RAIL_QUERY = "(min-width: 768px) and (min-height: 700px)";

/**
 * Projects rail: [data-hscroll] is a stable (Astro-rendered) wrapper that pins
 * to the viewport while the page scroll slides the [data-hscroll-track] inside
 * it sideways. The track holds the category's best projects (RAIL_LIMIT, one
 * row of big cards); the rest live outside the pin, behind a button (peek.ts).
 * Its scroll length follows the content but is capped like any pinned scene
 * (MOTION.hscroll.maxScreens).
 *
 * Everything that moves is driven from ONE ScrollTrigger per rail, never one
 * per card:
 *   - the track glides (x) and leans with the scroll speed (skewX);
 *   - [data-hscroll-progress] fills and [data-hscroll-current] shows the card
 *     in the middle (card positions are cached on refresh: a frame reads no
 *     layout).
 * Pictures are never scaled or shifted: a card's image enters whole.
 *
 * The pinned node is Astro's, never one React owns; React only renders what is
 * inside the track, which is only translated. The track may arrive after
 * hydration (data), so it is looked up lazily and the wrapper is watched.
 */
export const horizontalRails = ({
	gsap,
	ScrollTrigger,
}: MotionTools): Cleanup =>
	watch("[data-hscroll]", (root) => {
		const mm = gsap.matchMedia();

		mm.add(RAIL_QUERY, () => {
			const track = () =>
				root.querySelector<HTMLElement>("[data-hscroll-track]");
			const viewport = () =>
				root.querySelector<HTMLElement>("[data-hscroll-viewport]");
			const bar = () =>
				root.querySelector<HTMLElement>("[data-hscroll-progress]");
			const current = () =>
				root.querySelector<HTMLElement>("[data-hscroll-current]");

			// How far the track can slide (px); 0 while it is a skeleton.
			const distance = () => {
				const t = track();
				const v = viewport();
				if (!t || !v) return 0;
				return Math.max(0, t.scrollWidth - v.clientWidth);
			};

			// Inside a clipped, translated track the browser only loads a lazy
			// picture once it is truly on screen, so cards would open on a grey frame.
			// Load the rail's pictures when the rail is near instead (not on page load).
			let near = false;
			const warm = () => {
				if (!near) return;
				for (const img of root.querySelectorAll<HTMLImageElement>(
					"[data-rail-card] img",
				)) {
					img.setAttribute("loading", "eager");
				}
			};
			const stopNear = whenSeen(
				root,
				() => {
					near = true;
					warm();
				},
				"600px 0px 600px 0px",
			);

			// "N / total": 1 at the start of the strip, total at its end, always in
			// step with the progress bar (the card nearest the middle would read 2 on
			// arrival, because the first card sits left of centre).
			let shown = -1;
			const paint = (x: number) => {
				const total = track()?.querySelectorAll("[data-rail-card]").length ?? 0;
				const max = distance();
				if (total === 0) return;
				const progress = max > 0 ? Math.min(1, Math.max(0, -x / max)) : 0;
				const index = Math.round(progress * (total - 1));
				if (index === shown) return;
				shown = index;
				const label = current()?.firstChild;
				if (label) label.nodeValue = String(index + 1);
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
					if (t && !isHydrating(t)) {
						const x = -self.progress * distance();
						gsap.to(t, {
							x,
							// Lean with the speed: the strip feels pulled, then settles.
							skewX: gsap.utils.clamp(
								-MOTION.hscroll.skew,
								MOTION.hscroll.skew,
								self.getVelocity() / -400,
							),
							// Smoothing: absorbs the coarse steps of a mouse wheel and the
							// fine, fast ones of a trackpad alike.
							duration: MOTION.hscroll.smooth,
							ease: "power3.out",
							overwrite: true,
							onUpdate: () => paint(Number(gsap.getProperty(t, "x"))),
							onComplete: () => {
								gsap.to(t, { skewX: 0, duration: 0.4, ease: "power3.out" });
							},
						});
					}
					const b = bar();
					if (b && !isHydrating(b)) gsap.set(b, { scaleX: self.progress });
				},
			});

			// Keyboard: tabbing to a card that is out of view must bring it in. The
			// viewport is clipped, so the browser would scroll it sideways by itself
			// and fight the GSAP offset; instead the page scroll that drives the
			// rail is moved to where that card is on screen.
			const onFocusIn = (e: FocusEvent) => {
				const v = viewport();
				const t = track();
				const target = e.target as Element | null;
				const card = target?.closest<HTMLElement>("[data-rail-card]");
				if (!v || !t || !card) return;
				v.scrollLeft = 0;
				// A mouse click also focuses the link: moving the page then would
				// swallow the click. Only keyboard focus (:focus-visible) travels.
				if (!target?.matches(":focus-visible")) return;
				const max = distance();
				if (max <= 0) return;
				const box = card.getBoundingClientRect();
				const view = v.getBoundingClientRect();
				if (box.left >= view.left - 1 && box.right <= view.right + 1) return;
				const offset = box.left - t.getBoundingClientRect().left;
				const progress = Math.min(1, Math.max(0, offset / max));
				window.scrollTo({
					top: trigger.start + progress * (trigger.end - trigger.start),
					behavior: "auto",
				});
			};
			root.addEventListener("focusin", onFocusIn);

			// Content changed (data arrived, a tab switched): measure again.
			let timer: number | undefined;
			const mo = new MutationObserver(() => {
				window.clearTimeout(timer);
				timer = window.setTimeout(() => {
					const t = track();
					if (t) gsap.set(t, { x: 0, skewX: 0 });
					shown = -1;
					warm();
					safeRefresh(ScrollTrigger);
				}, 120);
			});
			mo.observe(root, { childList: true, subtree: true });
			warm();

			return () => {
				root.removeEventListener("focusin", onFocusIn);
				stopNear();
				mo.disconnect();
				window.clearTimeout(timer);
				trigger.kill();
				const t = track();
				if (t) gsap.set(t, { clearProps: "transform" });
				for (const img of root.querySelectorAll<HTMLElement>(
					"[data-rail-card] img",
				)) {
					gsap.set(img, { clearProps: "x" });
				}
			};
		});

		return () => mm.revert();
	});

export const railScenes = horizontalRails;
