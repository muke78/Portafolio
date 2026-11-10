// @vitest-environment jsdom
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOTION } from "@/lib/motion/core";
import { marquees } from "@/lib/motion/media";
import { installMotionEnv, runScene } from "../helpers/motionEnv";

let stop: (() => void) | undefined;
const $ = <T extends Element = HTMLElement>(selector: string) =>
	document.querySelector(selector) as T;
const trigger = () => ScrollTrigger.getAll()[0];
const fakeSelf = (over: Record<string, unknown>) =>
	over as unknown as ScrollTrigger;

/** One lane, its track as wide as `width` px (two halves of width / 2). */
const lane = (dir: "left" | "right", width = 2000) => {
	document.body.innerHTML = `<div data-marquee data-marquee-dir="${dir}"><div data-marquee-track><span>a</span><span>a</span></div></div>`;
	Object.defineProperty($("[data-marquee-track]"), "scrollWidth", {
		value: width,
	});
	stop = runScene(marquees);
	return {
		root: $("[data-marquee]"),
		track: $("[data-marquee-track]"),
		tween: gsap.getTweensOf($("[data-marquee-track]"))[0],
	};
};

const pointer = (
	target: Element,
	type: string,
	clientX: number,
	timeStamp: number,
	init: MouseEventInit = {},
) => {
	const e = new MouseEvent(type, {
		bubbles: true,
		clientX,
		button: 0,
		...init,
	});
	Object.defineProperty(e, "timeStamp", { value: timeStamp });
	Object.defineProperty(e, "pointerType", { value: "mouse" });
	target.dispatchEvent(e);
	return e;
};

beforeEach(() => {
	installMotionEnv("no-preference", []);
	vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
	stop?.();
	stop = undefined;
	gsap.globalTimeline.clear();
	for (const t of ScrollTrigger.getAll()) t.kill();
	vi.restoreAllMocks();
});

describe("marquees: direction", () => {
	it("slides left by default: the track goes from 0 to -50 %", () => {
		const { track, tween } = lane("left");
		tween.progress(0.25);
		expect(gsap.getProperty(track, "xPercent")).toBeCloseTo(-12.5);
	});

	it("slides right when the lane says so: the same loop, backwards", () => {
		const { track, tween } = lane("right");
		tween.progress(0);
		expect(gsap.getProperty(track, "xPercent")).toBe(-50);
		tween.progress(0.25);
		expect(gsap.getProperty(track, "xPercent")).toBeCloseTo(-37.5);
	});

	it("leans the other way on the right lane when it speeds up", () => {
		const { track } = lane("right");
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		trigger().vars.onUpdate?.(
			fakeSelf({ getVelocity: () => 100000, direction: 1 }),
		);
		for (let i = 0; i < 30; i++) gsap.ticker.tick();
		expect(gsap.getProperty(track, "skewX")).toBeGreaterThan(0);
	});

	it("leans back on the left lane when it speeds up", () => {
		const { track } = lane("left");
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		trigger().vars.onUpdate?.(
			fakeSelf({ getVelocity: () => 100000, direction: 1 }),
		);
		for (let i = 0; i < 30; i++) gsap.ticker.tick();
		expect(gsap.getProperty(track, "skewX")).toBeLessThan(0);
	});
});

describe("marquees: dragging", () => {
	it("moves the left lane with the pointer and marks the drag while it lasts", () => {
		const { root, tween } = lane("left");
		const capture = vi.fn();
		const releaseCapture = vi.fn();
		Object.assign(root, {
			setPointerCapture: capture,
			releasePointerCapture: releaseCapture,
		});
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 300, 500);
		// 500 px to the left of a 1000 px half, over 60 s: half the loop.
		expect(tween.time()).toBeCloseTo(30);
		expect(root).toHaveAttribute("data-dragging");
		expect(capture).toHaveBeenCalled();
		pointer(root, "pointerup", 300, 2000);
		expect(root).not.toHaveAttribute("data-dragging");
		expect(releaseCapture).toHaveBeenCalled();
	});

	it("moves the right lane the same way: toward the pointer", () => {
		const { root, tween, track } = lane("right");
		pointer(root, "pointerdown", 300, 0);
		pointer(root, "pointermove", 800, 500);
		expect(tween.time()).toBeCloseTo(30);
		// the track went from -50 % to -25 %: 500 px to the right.
		expect(gsap.getProperty(track, "xPercent")).toBeCloseTo(-25);
	});

	it("wraps around instead of stopping at the start of the loop", () => {
		const { root, tween } = lane("left");
		pointer(root, "pointerdown", 100, 0);
		pointer(root, "pointermove", 200, 500); // 100 px backwards from 0
		expect(tween.time()).toBeCloseTo(54);
	});

	it("does not take a press that barely moved", () => {
		const { root, tween } = lane("left");
		pointer(root, "pointerdown", 500, 0);
		pointer(root, "pointermove", 500 - MOTION.marquee.dragStart + 1, 50);
		expect(tween.time()).toBe(0);
		expect(root).not.toHaveAttribute("data-dragging");
	});

	it("ignores any button but the main one", () => {
		const { root, tween } = lane("left");
		pointer(root, "pointerdown", 800, 0, { button: 2 });
		pointer(root, "pointermove", 300, 500);
		expect(tween.time()).toBe(0);
	});

	it("ignores moves with nothing pressed", () => {
		const { root, tween } = lane("left");
		pointer(root, "pointermove", 300, 500);
		expect(tween.time()).toBe(0);
	});

	it("cannot drag a lane that has no width yet", () => {
		const { root, tween } = lane("left", 0);
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 300, 500);
		expect(tween.time()).toBe(0);
	});

	it("ends the drag when the browser cancels it (a vertical scroll)", () => {
		const { root } = lane("left");
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 600, 100);
		expect(root).toHaveAttribute("data-dragging");
		pointer(root, "pointercancel", 600, 200);
		expect(root).not.toHaveAttribute("data-dragging");
	});

	it("lets go without drama when the press was never a drag", () => {
		const { root } = lane("left");
		pointer(root, "pointerdown", 800, 0);
		expect(() => pointer(root, "pointerup", 800, 10)).not.toThrow();
		expect(root).not.toHaveAttribute("data-dragging");
	});

	it("holds the lane still while it is dragged, whatever the scroll does", () => {
		const { root, tween } = lane("left");
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 700, 50);
		trigger().vars.onUpdate?.(
			fakeSelf({ getVelocity: () => 100000, direction: 1 }),
		);
		gsap.ticker.tick();
		expect(tween.timeScale()).toBe(0);
	});

	it("keeps the speed of a flick and settles back to the calm drift", () => {
		const { root, tween } = lane("left");
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 600, 16);
		pointer(root, "pointermove", 400, 32);
		pointer(root, "pointerup", 400, 40);
		gsap.ticker.tick();
		expect(tween.timeScale()).toBeGreaterThan(4);
		expect(tween.timeScale()).toBeLessThanOrEqual(MOTION.marquee.maxFlick);
		for (let i = 0; i < 400; i++) gsap.ticker.tick();
		expect(tween.timeScale()).toBeCloseTo(1, 1);
	});

	it("gives no momentum to a pointer that stopped before letting go", () => {
		const { root, tween } = lane("left");
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 400, 16);
		pointer(root, "pointerup", 400, 1000);
		gsap.ticker.tick();
		expect(tween.timeScale()).toBeCloseTo(1, 0);
	});

	it("coasts to a stop under a pointer that is still over it", () => {
		const { root, tween } = lane("left");
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		root.dispatchEvent(new Event("pointerenter"));
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 600, 16);
		pointer(root, "pointerup", 600, 20);
		gsap.ticker.tick();
		expect(tween.timeScale()).toBeGreaterThan(1);
		for (let i = 0; i < 600; i++) gsap.ticker.tick();
		expect(tween.timeScale()).toBe(0);
	});

	it("stops the browser's own image drag", () => {
		const { root } = lane("left");
		const e = new Event("dragstart", { bubbles: true, cancelable: true });
		root.dispatchEvent(e);
		expect(e.defaultPrevented).toBe(true);
	});

	it("takes its listeners with it when the scene stops", () => {
		const { root, tween } = lane("left");
		stop?.();
		stop = undefined;
		pointer(root, "pointerdown", 800, 0);
		pointer(root, "pointermove", 300, 500);
		expect(tween.time()).toBe(0);
		expect(root).not.toHaveAttribute("data-dragging");
	});
});
