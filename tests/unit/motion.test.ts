import { describe, expect, it, vi } from "vitest";
import {
	byVisualOrder,
	initMotion,
	MOTION,
	MOTION_CLASS,
	MOTION_OK,
	refreshScrollTriggers,
	withMotion,
} from "@/lib/motion";

// Vitest runs in the node environment: there is no `window`, which is
// exactly the SSR case. The module must import and run there without
// throwing and without doing any animation work.
describe("motion (SSR safety)", () => {
	it("only allows motion when the user has no reduced-motion preference", () => {
		expect(MOTION_OK).toBe("(prefers-reduced-motion: no-preference)");
	});

	it("exposes the class CSS uses to gate the hidden initial state", () => {
		expect(MOTION_CLASS).toBe("motion-ok");
	});

	it("keeps distances and durations small and cheap", () => {
		expect(MOTION.reveal.distance).toBeLessThanOrEqual(32);
		expect(MOTION.reveal.duration).toBeLessThanOrEqual(0.9);
		expect(MOTION.reveal.stagger).toBeLessThanOrEqual(0.12);
		expect(MOTION.parallax.amplitude).toBeLessThanOrEqual(8);
		expect(MOTION.hero.total).toBeLessThanOrEqual(2);
		// The pinned manifesto must not trap the reader: <= 2.5 screens of scroll.
		expect(MOTION.manifesto.screens).toBeLessThanOrEqual(2.5);
		expect(MOTION.manifesto.screensMobile).toBeLessThan(
			MOTION.manifesto.screens,
		);
		expect(MOTION.marquee.maxBoost).toBeLessThanOrEqual(5);
		// A sideways showcase is a pinned scene too: same cap, and a gentle lean.
		expect(MOTION.hscroll.maxScreens).toBeLessThanOrEqual(2.5);
		expect(MOTION.marquee.maxSkew).toBeLessThanOrEqual(4);
		expect(MOTION.stack.scale).toBeGreaterThanOrEqual(0.9);
		expect(MOTION.detail.figureScale).toBeGreaterThanOrEqual(0.9);
	});

	it("withMotion never runs setup without a window and returns a callable cleanup", () => {
		const setup = vi.fn();
		const stop = withMotion(setup);
		expect(setup).not.toHaveBeenCalled();
		expect(() => stop()).not.toThrow();
	});

	it("initMotion is inert on the server", () => {
		expect(() => initMotion()()).not.toThrow();
	});

	it("refreshScrollTriggers resolves without a window", async () => {
		await expect(refreshScrollTriggers()).resolves.toBeUndefined();
	});
});

describe("byVisualOrder", () => {
	it("sorts top to bottom, then left to right", () => {
		const boxes = [
			{ id: "c", top: 200, left: 0 },
			{ id: "b", top: 100, left: 300 },
			{ id: "a", top: 100, left: 0 },
		];
		expect(boxes.sort(byVisualOrder).map((b) => b.id)).toEqual(["a", "b", "c"]);
	});

	it("keeps the cards of one row in column order for the stagger", () => {
		const row = [
			{ top: 50, left: 740 },
			{ top: 50, left: 24 },
		];
		expect(row.sort(byVisualOrder)[0].left).toBe(24);
	});
});
