import { describe, expect, it } from "vitest";
import {
	flightZ,
	galaxyState,
	INTERIOR_LABELS,
	interiorView,
	projectInterior,
	timeScale,
} from "@/lib/galaxyState";
import * as motionBarrel from "@/lib/motion";
import { cn } from "@/lib/utils";

describe("galaxyState", () => {
	it("starts as the sky already spread (no intro) at the very beginning of the story", () => {
		expect(galaxyState).toEqual({
			bang: 1,
			story: 0,
			hole: 0,
			fall: 0,
			worm: 0,
			exit: 0,
		});
	});

	it("is one shared mutable object (the engine writes, the canvas reads)", async () => {
		const again = (await import("@/lib/galaxyState")).galaxyState;
		again.story = 0.5;
		expect(galaxyState.story).toBe(0.5);
		again.story = 0;
	});
});

describe("lib/motion barrel", () => {
	it("re-exports the engine entry points", () => {
		expect(typeof motionBarrel.initMotion).toBe("function");
	});
});

describe("cn", () => {
	it("joins class names and drops falsy ones", () => {
		expect(cn("a", false && "b", "c")).toBe("a c");
	});
});

describe("inside the diamond (the 3D interior)", () => {
	it("the camera only ever moves forward along the axis, scroll by scroll", () => {
		let last = flightZ(0);
		for (let i = 1; i <= 100; i++) {
			const z = flightZ(i / 100);
			expect(z).toBeGreaterThanOrEqual(last);
			last = z;
		}
		expect(flightZ(0)).toBe(-6);
		expect(flightZ(1)).toBeCloseTo(17.6, 5);
	});

	it("stops at each scene: the inner horizon is where four cells meet (z = 6)", () => {
		expect(flightZ(0.62)).toBeCloseTo(6, 5);
		expect(flightZ(0.34)).toBeCloseTo(0, 5);
		expect(flightZ(0.84)).toBeCloseTo(12, 5);
	});

	it("is only visible from the first step to the last one", () => {
		expect(interiorView(0).vis).toBe(0);
		expect(interiorView(0.5).vis).toBe(1);
		expect(interiorView(1).vis).toBe(0);
	});

	it("time slows down as you fall in: a tenth of its speed at the horizon", () => {
		expect(timeScale(0)).toBe(1);
		expect(timeScale(0.6)).toBeLessThan(0.7);
		expect(timeScale(1)).toBeCloseTo(0.1, 5);
	});

	it("projects labels with the camera: ahead and centred shrinks to the middle, behind is hidden", () => {
		const near = projectInterior(2, 0, 4, 0, 1.6);
		const far = projectInterior(2, 0, 12, 0, 1.6);
		expect(near && far && Math.abs(far.x) < Math.abs(near.x)).toBe(true);
		expect(projectInterior(0, 0, 0, 3, 1.6)).toBeNull();
		expect(projectInterior(0, 0, 3.2, 3, 1.6)).toBeNull();
	});

	it("labels the cells of the diagram, the wormholes among them", () => {
		const keys = INTERIOR_LABELS.map((l) => l.key);
		for (const k of ["INNER_HORIZON", "WORMHOLE", "WHITE_HOLE", "ANTIVERSE"])
			expect(keys).toContain(k);
	});
});
