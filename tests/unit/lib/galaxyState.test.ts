import { describe, expect, it } from "vitest";
import { galaxyState } from "@/lib/galaxyState";
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
