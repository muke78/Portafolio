// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
	bulgeAngle,
	createSnowglobe,
	type Flake,
	GLASS,
	HUE_RED,
	HUE_VIOLET,
	hueAt,
	makeFlakes,
	type Phases,
	phasesAt,
	radiusAt,
	stepFlakes,
} from "@/lib/motion/snowglobe";

/** Deterministic, well-mixed "random" (mulberry32): the same run every time. */
const prng = (seed: number) => {
	let t = seed;
	return () => {
		t += 0x6d2b79f5;
		let x = t;
		x = Math.imul(x ^ (x >>> 15), x | 1);
		x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
		return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
	};
};

const speed = (flakes: Flake[]) =>
	flakes.reduce((sum, f) => sum + Math.hypot(f.vx, f.vy), 0) / flakes.length;

const run = (
	flakes: Flake[],
	seconds: number,
	temperature: number,
	mode: "calm" | "collapse" = "calm",
) => {
	const rnd = prng(7);
	for (let t = 0; t < seconds; t += 1 / 60) {
		stepFlakes(flakes, 1 / 60, temperature, mode, rnd);
	}
};

const none: Phases = { spikes: 0, ferro: 0, shiver: 0, inflate: 0, heat: 0 };

describe("plasma physics", () => {
	it("starts inside the glass, denser toward the middle", () => {
		const flakes = makeFlakes(400, prng(11));
		for (const f of flakes) {
			expect(Math.hypot(f.x, f.y)).toBeLessThanOrEqual(GLASS);
			expect(f.z).toBeGreaterThanOrEqual(0);
			expect(f.z).toBeLessThanOrEqual(1);
		}
		const inner = flakes.filter((f) => Math.hypot(f.x, f.y) < GLASS / 2);
		expect(inner.length).toBeGreaterThan(flakes.length / 2);
	});

	it("never leaves the glass, however hot it gets", () => {
		const flakes = makeFlakes(80, prng(11));
		run(flakes, 6, 3);
		for (const f of flakes) {
			expect(Math.hypot(f.x, f.y)).toBeLessThanOrEqual(GLASS + 1e-6);
		}
	});

	it("is hot all the time: it never settles, even with nobody touching it", () => {
		const flakes = makeFlakes(80, prng(11));
		run(flakes, 10, 0.55);
		expect(speed(flakes)).toBeGreaterThan(0.1);
	});

	it("does not sink: nothing piles up in a corner of the glass", () => {
		const flakes = makeFlakes(120, prng(11));
		run(flakes, 30, 0.55);
		const meanY = flakes.reduce((s, f) => s + f.y, 0) / flakes.length;
		const meanX = flakes.reduce((s, f) => s + f.x, 0) / flakes.length;
		// The cloud stays around the centre instead of falling to the bottom.
		expect(Math.abs(meanY)).toBeLessThan(0.2);
		expect(Math.abs(meanX)).toBeLessThan(0.2);
		const resting = flakes.filter((f) => Math.hypot(f.x, f.y) > GLASS * 0.97);
		expect(resting.length).toBeLessThan(flakes.length * 0.25);
	});

	it("a hotter plasma moves much faster", () => {
		const cool = makeFlakes(80, prng(11));
		const hot = makeFlakes(80, prng(11));
		run(cool, 3, 0.55);
		run(hot, 3, 2.5);
		expect(speed(hot)).toBeGreaterThan(speed(cool) * 2);
	});

	it("collapse draws every flake into the centre (the instant before the Big Bang)", () => {
		const flakes = makeFlakes(80, prng(11));
		const radius = () =>
			flakes.reduce((s, f) => s + Math.hypot(f.x, f.y), 0) / flakes.length;
		const before = radius();
		run(flakes, 1.2, 0.2, "collapse");
		expect(radius()).toBeLessThan(before * 0.35);
	});
});

describe("what the cursor does to the sphere (phases)", () => {
	it("a cursor that is only near keeps it calm: just a hint of liquid edge", () => {
		const near = phasesAt(0, 0.6);
		expect(near.ferro).toBeLessThan(0.3);
		expect(near.shiver).toBe(0);
		expect(near.inflate).toBe(0);
		expect(near.heat).toBe(0);
	});

	it("on the sphere the states come one after another, in order", () => {
		const at = (s: number) => phasesAt(s, 1);
		// First the spikes (before anything else), then they let go.
		expect(at(0.5).spikes).toBeGreaterThan(0);
		expect(at(0.5).ferro).toBeLessThan(0.4);
		expect(at(1.8).spikes).toBeGreaterThan(0.6);
		expect(at(5).spikes).toBe(0);
		expect(at(4.4).ferro).toBeGreaterThan(0.3);
		expect(at(5.6).shiver).toBeGreaterThan(0.3);
		expect(at(5.6).inflate).toBe(0);
		expect(at(7.8).inflate).toBeGreaterThan(0.3);
		expect(at(7.8).heat).toBe(0);
		expect(at(11).heat).toBeGreaterThan(0.3);
		expect(at(14).heat).toBe(1);
		expect(at(14).inflate).toBe(1);
	});

	it("the colour goes from violet to red through the whole spectrum", () => {
		expect(hueAt(0)).toBe(HUE_VIOLET);
		expect(hueAt(1)).toBe(HUE_RED);
		// Every hue in between is passed, monotonically (blue, cyan, green, yellow, orange).
		const hues = [0, 0.2, 0.4, 0.6, 0.8, 1].map(hueAt);
		for (let i = 1; i < hues.length; i++)
			expect(hues[i]).toBeLessThan(hues[i - 1]);
		expect(hueAt(0.5)).toBeGreaterThan(150);
		expect(hueAt(0.5)).toBeLessThan(160);
	});
});

describe("the contour", () => {
	const R = 100;
	const angles = Array.from({ length: 72 }, (_, i) => (i / 72) * Math.PI * 2);

	it("at rest it is a perfect circle", () => {
		for (const a of angles) expect(radiusAt(a, 3, none, R)).toBe(R);
	});

	it("liquid edge: it bends out of the circle with lumps and spikes", () => {
		const radii = angles.map((a) => radiusAt(a, 1, { ...none, ferro: 1 }, R));
		expect(Math.max(...radii)).toBeGreaterThan(R * 1.03);
		expect(Math.min(...radii)).toBeLessThan(R);
	});

	it("spikes: several sharp, long points that rise one by one out of the circle", () => {
		const dense = Array.from(
			{ length: 720 },
			(_, i) => (i / 720) * Math.PI * 2,
		);
		const radii = dense.map((a) => radiusAt(a, 1, { ...none, spikes: 1 }, R));
		expect(Math.max(...radii)).toBeGreaterThan(R * 1.35);
		// Between the spikes the circle is untouched.
		expect(radii.filter((r) => r === R).length).toBeGreaterThan(
			dense.length / 2,
		);
		// Count the points: runs of radii above the circle.
		let spikes = 0;
		for (let i = 0; i < radii.length; i++) {
			if (
				radii[i] > R * 1.1 &&
				radii[(i + radii.length - 1) % radii.length] <= R * 1.1
			)
				spikes++;
		}
		expect(spikes).toBeGreaterThanOrEqual(5);
		// They come out in turn: early on fewer are out than at the end.
		const early = dense.map((a) =>
			radiusAt(a, 1, { ...none, spikes: 0.25 }, R),
		);
		expect(early.filter((r) => r > R * 1.1).length).toBeLessThan(
			radii.filter((r) => r > R * 1.1).length,
		);
	});

	it("shivers: small fast waves, never a big change of shape", () => {
		const radii = angles.map((a) => radiusAt(a, 1, { ...none, shiver: 1 }, R));
		expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(R * 0.02);
		expect(Math.max(...radii)).toBeLessThan(R * 1.1);
	});

	it("inflates on ONE side only, not all around", () => {
		const t = 2;
		const at = bulgeAngle(t);
		const ph = { ...none, inflate: 1 };
		const onBulge = radiusAt(at, t, ph, R);
		const opposite = radiusAt(at + Math.PI, t, ph, R);
		expect(onBulge).toBeGreaterThan(R * 1.5);
		expect(opposite).toBeLessThanOrEqual(R * 1.02);
		// Most of the contour is hardly touched.
		const calm = angles.filter((a) => radiusAt(a, t, ph, R) < R * 1.08).length;
		expect(calm).toBeGreaterThan(angles.length / 2);
	});
});

describe("createSnowglobe", () => {
	it("is a harmless no-op when the browser has no 2D canvas (jsdom)", () => {
		const ticker = { add: vi.fn(), remove: vi.fn() };
		const canvas = document.createElement("canvas");
		const globe = createSnowglobe(canvas, ticker);
		expect(() => {
			globe.kick(1);
			globe.setEnergy(1);
			globe.setHover(true);
			globe.setBreath(1.02);
			globe.setLean(0.5, -0.5);
			globe.setMode("collapse");
			expect(globe.rim()).toBe("");
			globe.destroy();
		}).not.toThrow();
		expect(ticker.add).not.toHaveBeenCalled();
	});
});
