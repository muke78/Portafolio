import { type Cleanup, MOTION, type MotionTools, watch } from "./core";

/**
 * Decorative parallax: [data-parallax="N"] moves +/-N % of its own size
 * while it crosses the viewport (scrubbed). Decorative elements only.
 */
export const setupParallax = ({ gsap }: MotionTools): Cleanup => {
	const tweens = gsap.utils
		.toArray<HTMLElement>("[data-parallax]")
		.map((el) => {
			const amplitude =
				Number(el.dataset.parallax) || MOTION.parallax.amplitude;
			return gsap.fromTo(
				el,
				{ yPercent: -amplitude },
				{
					yPercent: amplitude,
					ease: "none",
					scrollTrigger: {
						trigger: el,
						start: "top bottom",
						end: "bottom top",
						scrub: true,
					},
				},
			);
		});
	return () => {
		for (const t of tweens) {
			t.scrollTrigger?.kill();
			t.kill();
		}
	};
};

/**
 * Project card images: the picture sits taller than its frame
 * ([data-parallax-img] inside an overflow-hidden figure) and drifts a few
 * percent while the card crosses the viewport - depth without any hover.
 */
export const cardImageParallax = ({ gsap }: MotionTools): Cleanup =>
	watch("[data-parallax-img]", (img) => {
		const frame = img.parentElement ?? img;
		const tween = gsap.fromTo(
			img,
			{ yPercent: -6 },
			{
				yPercent: 6,
				ease: "none",
				scrollTrigger: {
					trigger: frame,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
				},
			},
		);
		return () => {
			tween.scrollTrigger?.kill();
			tween.kill();
			gsap.set(img, { clearProps: "transform" });
		};
	});

/**
 * Opinions lanes: each [data-marquee] contains one [data-marquee-track] made of
 * two identical halves; `data-marquee-dir="right"` makes it slide the other way
 * (default: left). The loop is ONE gsap tween on xPercent (no per-frame DOM
 * reads) whose speed follows the scroll: a single ticker callback eases
 * `timeScale` toward the target the scroll velocity sets, so a burst of scroll
 * events never creates tweens. Cheap on purpose:
 *   - the track is its own compositor layer (will-change in app.css) and the
 *     edge fade is static overlays, not a mask over moving content;
 *   - everything stops while the strip is off screen or the tab is hidden;
 *   - hover or keyboard focus pauses it.
 * The reader can also take the lane and drag it (mouse, pen or finger): while
 * held, the pointer moves the tween's own clock (so the loop keeps wrapping) and
 * on release the speed it was dragged at becomes a flick that settles back to
 * the calm drift. On touch screens only horizontal moves are taken (the CSS
 * `touch-action: pan-y` leaves the vertical scroll to the browser).
 * The track leans a few degrees with the speed (skewX through a quickSetter).
 */
export const marquees = ({ gsap, ScrollTrigger }: MotionTools): Cleanup =>
	watch("[data-marquee]", (root) => {
		const track = root.querySelector<HTMLElement>("[data-marquee-track]");
		if (!track) return;

		const seconds =
			Number.parseFloat(
				getComputedStyle(root).getPropertyValue("--marquee-duration"),
			) || 60;
		track.style.animation = "none";

		// +1: the lane slides left (x goes 0 -> -50 %); -1: it slides right.
		const sense = root.dataset.marqueeDir === "right" ? -1 : 1;
		const tween =
			sense === 1
				? gsap.to(track, {
						xPercent: -50,
						duration: seconds,
						ease: "none",
						repeat: -1,
						paused: true,
					})
				: gsap.fromTo(
						track,
						{ xPercent: -50 },
						{
							xPercent: 0,
							duration: seconds,
							ease: "none",
							repeat: -1,
							paused: true,
						},
					);
		const setSkew = gsap.quickSetter(track, "skewX", "deg");

		// Speed state, eased every frame by one ticker callback.
		let target = 1;
		let current = 1;
		let hovering = false;
		let dragging = false;
		let coasting = false; // a flick is still playing out under the pointer
		const tick = () => {
			if (hovering && !coasting) {
				tween.timeScale(0);
			} else {
				target += ((hovering ? 0 : 1) - target) * 0.035; // settle: calm drift, or still
				current += (target - current) * 0.1;
				if (hovering && Math.abs(current) < 0.02) coasting = false;
				tween.timeScale(dragging ? 0 : current);
			}
			setSkew(
				gsap.utils.clamp(
					-MOTION.marquee.maxSkew,
					MOTION.marquee.maxSkew,
					-sense * (current - 1) * 0.9,
				),
			);
		};

		const trigger = ScrollTrigger.create({
			trigger: root,
			start: "top bottom",
			end: "bottom top",
			onToggle: (self) => {
				if (self.isActive) {
					tween.play();
					gsap.ticker.add(tick);
				} else {
					tween.pause();
					gsap.ticker.remove(tick);
				}
			},
			onUpdate: (self) => {
				if (dragging) return;
				const boost = Math.min(
					MOTION.marquee.maxBoost,
					1 + Math.abs(self.getVelocity()) / 450,
				);
				target = self.direction * boost;
			},
		});

		const hold = () => {
			hovering = true;
		};
		const release = () => {
			hovering = false;
			coasting = false;
		};

		// --- Dragging -------------------------------------------------------
		let pressed = false; // a pointer is down, not yet far enough to be a drag
		let pointerId = -1;
		let startX = 0;
		let lastX = 0;
		let lastAt = 0;
		let flick = 0; // tween seconds per real second, smoothed
		let secondsPerPx = 0;

		const onDown = (e: PointerEvent) => {
			if (e.pointerType === "mouse" && e.button !== 0) return;
			const half = track.scrollWidth / 2;
			if (!half) return;
			pressed = true;
			pointerId = e.pointerId;
			startX = lastX = e.clientX;
			lastAt = e.timeStamp;
			flick = 0;
			// One pixel of travel is this many seconds of the loop (and which way).
			secondsPerPx = (-sense * tween.duration()) / half;
		};
		const onMove = (e: PointerEvent) => {
			if (!pressed || e.pointerId !== pointerId) return;
			if (!dragging) {
				if (Math.abs(e.clientX - startX) < MOTION.marquee.dragStart) return;
				dragging = true;
				root.setPointerCapture?.(e.pointerId);
				root.setAttribute("data-dragging", "");
			}
			const dx = e.clientX - lastX;
			const dt = (e.timeStamp - lastAt) / 1000;
			lastX = e.clientX;
			lastAt = e.timeStamp;
			const dTime = dx * secondsPerPx;
			tween.time(gsap.utils.wrap(0, tween.duration(), tween.time() + dTime));
			if (dt > 0) flick = flick * 0.7 + (dTime / dt) * 0.3;
		};
		const onUp = (e: PointerEvent) => {
			if (!pressed || e.pointerId !== pointerId) return;
			pressed = false;
			if (!dragging) return;
			dragging = false;
			root.removeAttribute("data-dragging");
			root.releasePointerCapture?.(e.pointerId);
			// A held-still release carries no momentum.
			const stale = e.timeStamp - lastAt > 100;
			const speed = stale
				? 0
				: gsap.utils.clamp(
						-MOTION.marquee.maxFlick,
						MOTION.marquee.maxFlick,
						flick,
					);
			if (speed !== 0) {
				current = target = speed;
				coasting = true;
			}
		};
		const noNativeDrag = (e: Event) => e.preventDefault();

		root.addEventListener("pointerenter", hold);
		root.addEventListener("pointerleave", release);
		root.addEventListener("focusin", hold);
		root.addEventListener("focusout", release);
		root.addEventListener("pointerdown", onDown);
		root.addEventListener("pointermove", onMove);
		root.addEventListener("pointerup", onUp);
		root.addEventListener("pointercancel", onUp);
		root.addEventListener("dragstart", noNativeDrag);

		return () => {
			root.removeEventListener("pointerenter", hold);
			root.removeEventListener("pointerleave", release);
			root.removeEventListener("focusin", hold);
			root.removeEventListener("focusout", release);
			root.removeEventListener("pointerdown", onDown);
			root.removeEventListener("pointermove", onMove);
			root.removeEventListener("pointerup", onUp);
			root.removeEventListener("pointercancel", onUp);
			root.removeEventListener("dragstart", noNativeDrag);
			root.removeAttribute("data-dragging");
			gsap.ticker.remove(tick);
			trigger.kill();
			tween.kill();
			gsap.set(track, { clearProps: "transform" });
			track.style.animation = "";
		};
	});
