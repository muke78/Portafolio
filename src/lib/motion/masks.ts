import {
	type Cleanup,
	MOTION,
	type MotionTools,
	REVEALED,
	settle,
	watch,
	whenSeen,
} from "./core";

const CLIP_FROM = {
	up: "inset(100% 0% 0% 0%)",
	left: "inset(0% 100% 0% 0%)",
} as const;
const CLIP_TO = "inset(0% 0% 0% 0%)";

/**
 * Masked reveals: a [data-mask] frame opens like a curtain (clip-path) when it
 * enters the viewport while the picture inside settles from a slight zoom.
 * data-mask="left" opens sideways instead of from the bottom;
 * data-mask-delay="0.3" waits before opening. The picture is the element
 * marked [data-mask-img] or [data-parallax-img]; it only gets `scale`, so it
 * can keep a scrubbed parallax on `yPercent` at the same time.
 */
export const maskReveals = ({ gsap }: MotionTools): Cleanup =>
	watch("[data-mask]", (frame) => {
		const from = frame.dataset.mask === "left" ? CLIP_FROM.left : CLIP_FROM.up;
		const delay = Number(frame.dataset.maskDelay) || 0;
		const img = frame.querySelector<HTMLElement>(
			"[data-mask-img], [data-parallax-img]",
		);

		const tl = gsap.timeline({
			paused: true,
			onComplete: () => {
				// Only the clip: a transform cleared here would cancel the parallax.
				gsap.set(frame, { clearProps: "clipPath" });
			},
		});
		tl.fromTo(
			frame,
			{ clipPath: from },
			{
				clipPath: CLIP_TO,
				duration: MOTION.mask.duration,
				ease: MOTION.mask.ease,
			},
			delay,
		);
		if (img) {
			tl.fromTo(
				img,
				{ scale: MOTION.mask.scaleFrom },
				{ scale: 1, duration: MOTION.mask.duration + 0.6, ease: MOTION.ease },
				delay,
			);
		}
		// The first frame is already inline: CSS can stop hiding the frame.
		frame.setAttribute(REVEALED, "");
		const stopSeen = whenSeen(frame, () => tl.play());

		return () => {
			stopSeen();
			tl.kill();
			gsap.set(frame, { clearProps: "clipPath" });
		};
	});

/**
 * Staggered groups: the [data-stagger-item] children of a [data-stagger]
 * container enter one after another (fade + rise) when the container comes
 * into view. data-stagger="pop" also grows each item from 80 % (round icons);
 * data-stagger-delay="0.4" waits before starting (e.g. behind a mask).
 * Items that mount later (no data-stagger-item at render time) are untouched.
 */
export const staggerGroups = ({ gsap }: MotionTools): Cleanup =>
	watch("[data-stagger]", (group) => {
		const items = [
			...group.querySelectorAll<HTMLElement>("[data-stagger-item]"),
		];
		if (!items.length) return;
		const delay = Number(group.dataset.staggerDelay) || 0;
		const pop = group.dataset.stagger === "pop";

		const tween = gsap.fromTo(
			items,
			{
				autoAlpha: 0,
				y: MOTION.stagger.distance,
				...(pop ? { scale: 0.8 } : {}),
			},
			{
				autoAlpha: 1,
				y: 0,
				...(pop ? { scale: 1 } : {}),
				duration: MOTION.stagger.duration,
				ease: MOTION.ease,
				stagger: MOTION.stagger.each,
				delay,
				paused: true,
				onComplete: () => {
					for (const el of items) settle(el);
				},
			},
		);
		// A group inside a masked frame (the contact form) starts with the frame:
		// observing the clipped group itself would wait on a hidden region.
		const stopSeen = whenSeen(
			group.closest("[data-mask]") ?? group,
			() => tween.play(),
			"0px",
		);

		return () => {
			stopSeen();
			tween.kill();
			for (const el of items) settle(el);
		};
	});
