import { describe, expect, it, vi } from "vitest";
import {
	MOTION,
	MOTION_OK,
	parallaxOnScroll,
	refreshScrollTriggers,
	revealOnScroll,
	withMotion,
} from "@/lib/motion";

// Vitest runs in the node environment: there is no `window`, which is
// exactly the SSR case. The module must import and run there without
// throwing and without doing any animation work.
describe("motion (SSR safety)", () => {
	it("only allows motion when the user has no reduced-motion preference", () => {
		expect(MOTION_OK).toBe("(prefers-reduced-motion: no-preference)");
	});

	it("keeps reveal distances small and animation properties cheap", () => {
		expect(MOTION.reveal.distance).toBeLessThanOrEqual(32);
		expect(MOTION.reveal.duration).toBeLessThanOrEqual(0.8);
		expect(MOTION.parallax.amplitude).toBeLessThanOrEqual(12);
	});

	it("withMotion never runs setup without a window and returns a callable cleanup", () => {
		const setup = vi.fn();
		const stop = withMotion(setup);
		expect(setup).not.toHaveBeenCalled();
		expect(() => stop()).not.toThrow();
	});

	it("revealOnScroll and parallaxOnScroll are inert on the server", () => {
		expect(() => revealOnScroll("[data-reveal-group]")()).not.toThrow();
		expect(() => parallaxOnScroll()()).not.toThrow();
	});

	it("refreshScrollTriggers resolves without a window", async () => {
		await expect(refreshScrollTriggers()).resolves.toBeUndefined();
	});
});
