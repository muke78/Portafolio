import { type Cleanup, MOTION, type MotionTools, watch } from "./core";

/**
 * Query under which the preview trails the cursor: a real pointer that can hover.
 * Touch has no hover (rows show a thumbnail there instead, see ProjectRow).
 */
export const PEEK_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Index preview: in a [data-peek] list, every [data-peek-row] holds a big
 * [data-peek-img]. While the pointer is over a row its picture opens like a
 * curtain (clip-path) next to the cursor and TRAILS it (one quickTo pair, so
 * a burst of mouse events never creates tweens), leaning a few degrees with the
 * horizontal speed. Keyboard focus on the row's link shows it too, parked beside
 * the row, so the preview is not mouse-only.
 *
 * The picture enters whole: opacity + clip-path + translate, never a scale.
 * Nothing is read from the layout while moving: the row's box is measured when
 * the pointer enters it.
 */
export const peekScenes = ({ gsap }: MotionTools): Cleanup =>
	watch("[data-peek]", (list) => {
		const mm = gsap.matchMedia();

		mm.add(PEEK_QUERY, () => {
			const cleanups: Cleanup[] = [];

			for (const row of list.querySelectorAll<HTMLElement>("[data-peek-row]")) {
				const img = row.querySelector<HTMLElement>("[data-peek-img]");
				if (!img) continue;

				const moveX = gsap.quickTo(img, "x", {
					duration: MOTION.peek.follow,
					ease: "power3.out",
				});
				const moveY = gsap.quickTo(img, "y", {
					duration: MOTION.peek.follow,
					ease: "power3.out",
				});
				const tilt = gsap.quickTo(img, "rotation", {
					duration: MOTION.peek.follow,
					ease: "power3.out",
				});

				let box: DOMRect | null = null;
				let lastX = 0;
				let shown = false;

				const place = (x: number, y: number, instant: boolean) => {
					const h = img.offsetHeight;
					const px = x + MOTION.peek.gap;
					const py = y - h / 2;
					if (instant) gsap.set(img, { x: px, y: py });
					else {
						moveX(px);
						moveY(py);
					}
				};

				const show = (x: number, y: number) => {
					if (shown) return;
					shown = true;
					lastX = x;
					place(x, y, true);
					gsap.killTweensOf(img, "opacity,visibility,clipPath");
					gsap.fromTo(
						img,
						{ autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
						{
							autoAlpha: 1,
							clipPath: "inset(0% 0% 0% 0%)",
							duration: 0.55,
							ease: MOTION.easeInOut,
						},
					);
				};

				const hide = () => {
					if (!shown) return;
					shown = false;
					tilt(0);
					gsap.to(img, {
						autoAlpha: 0,
						duration: 0.25,
						ease: "power2.out",
						overwrite: "auto",
					});
				};

				const onEnter = (e: PointerEvent) => {
					box = row.getBoundingClientRect();
					show(e.clientX - box.left, e.clientY - box.top);
				};
				const onMove = (e: PointerEvent) => {
					if (!box) box = row.getBoundingClientRect();
					const x = e.clientX - box.left;
					place(x, e.clientY - box.top, false);
					tilt(
						gsap.utils.clamp(
							-MOTION.peek.tilt,
							MOTION.peek.tilt,
							(x - lastX) * 0.6,
						),
					);
					lastX = x;
				};
				const onLeave = () => {
					box = null;
					hide();
				};
				// Keyboard: park the preview beside the row, vertically centred on it.
				const onFocusIn = (e: FocusEvent) => {
					if (!(e.target as Element).matches(":focus-visible")) return;
					const r = row.getBoundingClientRect();
					show(r.width * 0.55, r.height / 2);
				};

				row.addEventListener("pointerenter", onEnter);
				row.addEventListener("pointermove", onMove);
				row.addEventListener("pointerleave", onLeave);
				row.addEventListener("focusin", onFocusIn);
				row.addEventListener("focusout", hide);

				cleanups.push(() => {
					row.removeEventListener("pointerenter", onEnter);
					row.removeEventListener("pointermove", onMove);
					row.removeEventListener("pointerleave", onLeave);
					row.removeEventListener("focusin", onFocusIn);
					row.removeEventListener("focusout", hide);
					gsap.killTweensOf(img);
					gsap.set(img, { clearProps: "all" });
				});
			}

			return () => {
				for (const c of cleanups) c();
			};
		});

		return () => mm.revert();
	});
