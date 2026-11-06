// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
	createSnowglobe,
	type Flake,
	GLASS,
	makeFlakes,
	stepFlakes,
} from "@/lib/motion/snowglobe";

/** Deterministic "random": a repeating sequence. */
const seq = (values: number[]) => {
	let i = 0;
	return () => values[i++ % values.length];
};

const speed = (flakes: Flake[]) =>
	flakes.reduce((sum, f) => sum + Math.hypot(f.vx, f.vy), 0) / flakes.length;

const run = (
	flakes: Flake[],
	seconds: number,
	agitation: number,
	mode: "calm" | "collapse" = "calm",
) => {
	const rnd = seq([0.1, 0.9, 0.4, 0.7, 0.2, 0.6]);
	for (let t = 0; t < seconds; t += 1 / 60) {
		stepFlakes(flakes, 1 / 60, agitation, mode, t, rnd);
	}
};

describe("snow globe physics", () => {
	it("all the flakes start inside the glass, with depth", () => {
		const flakes = makeFlakes(200, seq([0.13, 0.57, 0.91, 0.33, 0.78]));
		for (const f of flakes) {
			expect(Math.hypot(f.x, f.y)).toBeLessThanOrEqual(GLASS);
			expect(f.z).toBeGreaterThanOrEqual(0);
			expect(f.z).toBeLessThanOrEqual(1);
		}
	});

	it("never leaves the glass, however hard it is shaken", () => {
		const flakes = makeFlakes(80, seq([0.2, 0.8, 0.5, 0.3, 0.95]));
		run(flakes, 6, 1);
		for (const f of flakes) {
			expect(Math.hypot(f.x, f.y)).toBeLessThanOrEqual(GLASS + 1e-6);
		}
	});

	it("shaking it moves the flakes much faster than leaving it alone", () => {
		const calm = makeFlakes(80, seq([0.2, 0.8, 0.5, 0.3, 0.95]));
		const shaken = makeFlakes(80, seq([0.2, 0.8, 0.5, 0.3, 0.95]));
		run(calm, 2, 0);
		run(shaken, 2, 1);
		expect(speed(shaken)).toBeGreaterThan(speed(calm) * 5);
	});

	it("when left alone the flakes sink slowly (they do not freeze or fall at once)", () => {
		const flakes = makeFlakes(60, seq([0.3, 0.6, 0.9, 0.1]));
		const before = flakes.reduce((s, f) => s + f.y, 0) / flakes.length;
		run(flakes, 4, 0);
		const after = flakes.reduce((s, f) => s + f.y, 0) / flakes.length;
		expect(after).toBeGreaterThan(before);
		expect(after - before).toBeLessThan(0.5);
	});

	it("the stirring dies away and they settle again", () => {
		const flakes = makeFlakes(60, seq([0.3, 0.6, 0.9, 0.1]));
		run(flakes, 1, 1);
		const stirred = speed(flakes);
		run(flakes, 6, 0);
		expect(speed(flakes)).toBeLessThan(stirred / 4);
	});

	it("collapse draws every flake into the centre (the instant before the Big Bang)", () => {
		const flakes = makeFlakes(80, seq([0.2, 0.8, 0.5, 0.3, 0.95]));
		const radius = () =>
			flakes.reduce((s, f) => s + Math.hypot(f.x, f.y), 0) / flakes.length;
		const before = radius();
		run(flakes, 0.6, 0.2, "collapse");
		expect(radius()).toBeLessThan(before * 0.35);
	});
});

describe("createSnowglobe", () => {
	it("is a harmless no-op when the browser has no 2D canvas (jsdom)", () => {
		const ticker = { add: vi.fn(), remove: vi.fn() };
		const canvas = document.createElement("canvas");
		const globe = createSnowglobe(canvas, ticker);
		expect(() => {
			globe.kick(1);
			globe.hold(1);
			globe.setMode("collapse");
			globe.destroy();
		}).not.toThrow();
		expect(ticker.add).not.toHaveBeenCalled();
	});
});
