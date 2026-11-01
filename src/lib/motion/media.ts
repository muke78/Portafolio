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
 * Testimonials marquee: [data-marquee] contains one [data-marquee-track]
 * made of two identical halves. The loop is ONE gsap tween on xPercent
 * (-50 -> 0 and around, no per-frame DOM reads) whose speed follows the
 * scroll: a single ticker callback eases `timeScale` toward the target the
 * scroll velocity sets, so a burst of scroll events never creates tweens.
 * Cheap on purpose:
 *   - the track is its own compositor layer (will-change in app.css) and the
 *     edge fade is static overlays, not a mask over moving content;
 *   - everything stops while the strip is off screen or the tab is hidden;
 *   - hover or keyboard focus pauses it.
 * The pill leans a few degrees with the speed (skewX through a quickSetter).
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

		const tween = gsap.to(track, {
			xPercent: -50,
			duration: seconds,
			ease: "none",
			repeat: -1,
			paused: true,
		});
		const setSkew = gsap.quickSetter(track, "skewX", "deg");

		// Speed state, eased every frame by one ticker callback.
		let target = 1;
		let current = 1;
		let hovering = false;
		const tick = () => {
			target += (1 - target) * 0.035; // settle back to a calm forward drift
			current += (target - current) * 0.1;
			tween.timeScale(hovering ? 0 : current);
			setSkew(
				gsap.utils.clamp(
					-MOTION.marquee.maxSkew,
					MOTION.marquee.maxSkew,
					-(current - 1) * 0.9,
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
		};
		root.addEventListener("pointerenter", hold);
		root.addEventListener("pointerleave", release);
		root.addEventListener("focusin", hold);
		root.addEventListener("focusout", release);

		return () => {
			root.removeEventListener("pointerenter", hold);
			root.removeEventListener("pointerleave", release);
			root.removeEventListener("focusin", hold);
			root.removeEventListener("focusout", release);
			gsap.ticker.remove(tick);
			trigger.kill();
			tween.kill();
			gsap.set(track, { clearProps: "transform" });
			track.style.animation = "";
		};
	});
