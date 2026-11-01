import {
	type Cleanup,
	MOTION,
	type MotionTools,
	REVEALED,
	settle,
	watch,
} from "./core";

/**
 * The comment dialog and its launcher.
 *
 *   [data-dialog]          the panel: grows out of the launcher (scale from
 *                          its bottom-right corner) with a soft rise
 *   [data-dialog-item]     header, fields and button: enter one by one
 *   [data-fab]             the floating launcher: pops in a moment after load
 *
 * The dialog is mounted by React when it opens, so it is picked up by watch()
 * (the island is already live: no hydration wait). Closing unmounts at once
 * (Escape / click outside must feel instant); only the opening is animated.
 */
export const dialogs = ({ gsap }: MotionTools): Cleanup => {
	const stopDialog = watch("[data-dialog]", (panel) => {
		const items = [
			...panel.querySelectorAll<HTMLElement>("[data-dialog-item]"),
		];

		const tl = gsap.timeline({
			defaults: { ease: MOTION.ease },
			onComplete: () => {
				gsap.set(panel, {
					clearProps: "opacity,visibility,transform,transformOrigin",
				});
				gsap.set(items, { clearProps: "opacity,visibility,transform" });
			},
		});
		tl.fromTo(
			panel,
			{ autoAlpha: 0, scale: 0.9, y: 16, transformOrigin: "100% 100%" },
			{ autoAlpha: 1, scale: 1, y: 0, duration: 0.55 },
			0,
		);
		if (items.length) {
			tl.fromTo(
				items,
				{ autoAlpha: 0, y: 14 },
				{ autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 },
				0.22,
			);
		}

		return () => {
			tl.kill();
		};
	});

	const stopFab = watch("[data-fab]", (fab) => {
		const tween = gsap.fromTo(
			fab,
			{ autoAlpha: 0, scale: 0.5, y: 12 },
			{
				autoAlpha: 1,
				scale: 1,
				y: 0,
				duration: 0.8,
				ease: "back.out(1.6)",
				delay: 1.2,
				onStart: () => fab.setAttribute(REVEALED, ""),
				onComplete: () => settle(fab),
			},
		);
		return () => {
			tween.kill();
			settle(fab);
		};
	});

	return () => {
		stopDialog();
		stopFab();
	};
};
