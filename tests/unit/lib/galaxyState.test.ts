import { describe, expect, it } from "vitest";
import { galaxyState } from "@/lib/galaxyState";
import * as motionBarrel from "@/lib/motion";
import { cn } from "@/lib/utils";

describe("galaxyState", () => {
	it("starts as dust: the sky is already spread (no intro), nothing burst, nothing settled", () => {
		expect(galaxyState).toEqual({ bang: 1, burst: 0, settle: 0 });
	});

	it("is one shared mutable object (the engine writes, the canvas reads)", async () => {
		const again = (await import("@/lib/galaxyState")).galaxyState;
		again.burst = 0.5;
		expect(galaxyState.burst).toBe(0.5);
		again.burst = 0;
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
