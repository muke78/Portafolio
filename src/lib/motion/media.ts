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
 * made of two identical halves. The CSS animation is replaced by a GSAP
 * tween whose speed follows the scroll velocity (and direction): scroll
 * fast and the wall of opinions rushes with you, then eases back to calm.
 * Hover or keyboard focus pauses it.
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
		});

		const trigger = ScrollTrigger.create({
			trigger: root,
			start: "top bottom",
			end: "bottom top",
			onUpdate: (self) => {
				const boost = Math.min(
					MOTION.marquee.maxBoost,
					1 + Math.abs(self.getVelocity()) / 450,
				);
				gsap.to(tween, {
					timeScale: self.direction * boost,
					duration: 0.25,
					overwrite: true,
					onComplete: () => {
						gsap.to(tween, { timeScale: 1, duration: 1.4, ease: "power2.out" });
					},
				});
			},
		});

		const pause = () => tween.pause();
		const play = () => tween.play();
		root.addEventListener("pointerenter", pause);
		root.addEventListener("pointerleave", play);
		root.addEventListener("focusin", pause);
		root.addEventListener("focusout", play);

		return () => {
			root.removeEventListener("pointerenter", pause);
			root.removeEventListener("pointerleave", play);
			root.removeEventListener("focusin", pause);
			root.removeEventListener("focusout", play);
			trigger.kill();
			tween.kill();
			gsap.set(track, { clearProps: "transform" });
			track.style.animation = "";
		};
	});
