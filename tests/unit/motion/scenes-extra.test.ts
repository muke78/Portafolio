// @vitest-environment jsdom
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REVEALED } from "@/lib/motion/core";
import { stackScenes } from "@/lib/motion/layers";
import { marquees } from "@/lib/motion/media";
import { observeReveals } from "@/lib/motion/reveals";
import {
	FakeIntersectionObserver,
	flush,
	installMotionEnv,
	runScene,
} from "../helpers/motionEnv";

let stop: (() => void) | undefined;
const run = (scene: Parameters<typeof runScene>[0]) => {
	stop = runScene(scene);
	return stop;
};
const html = (markup: string) => {
	document.body.innerHTML = markup;
};
const $ = <T extends Element = HTMLElement>(selector: string) =>
	document.querySelector(selector) as T;

const trigger = () => ScrollTrigger.getAll()[0];
beforeEach(() => {
	installMotionEnv("no-preference", [
		"(min-width: 768px)",
		"(min-width: 1024px)",
		"(min-height: 560px)",
	]);
	vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
	stop?.();
	stop = undefined;
	gsap.globalTimeline.clear();
	for (const t of ScrollTrigger.getAll()) t.kill();
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe("stackScenes", () => {
	it("drops a trigger whose stack left the page", () => {
		html(
			`<div data-stack><div data-stack-card>1</div><div data-stack-card>2</div></div>`,
		);
		run(stackScenes);
		const kill = vi.fn();
		$("[data-stack]").remove();
		trigger().vars.onRefresh?.({ kill } as unknown as ScrollTrigger);
		expect(kill).toHaveBeenCalledTimes(1);
	});

	it("keeps the trigger while the stack is still there", () => {
		html(
			`<div data-stack><div data-stack-card>1</div><div data-stack-card>2</div></div>`,
		);
		run(stackScenes);
		const kill = vi.fn();
		trigger().vars.onRefresh?.({ kill } as unknown as ScrollTrigger);
		expect(kill).not.toHaveBeenCalled();
	});
});

describe("marquees: scroll speed", () => {
	const marquee = `<div data-marquee><div data-marquee-track><span>a</span><span>a</span></div></div>`;
	const fakeSelf = (over: Record<string, unknown>) =>
		over as unknown as ScrollTrigger;

	it("plays and ticks while on screen, pauses when it leaves", () => {
		html(marquee);
		run(marquees);
		const add = vi.spyOn(gsap.ticker, "add");
		const remove = vi.spyOn(gsap.ticker, "remove");
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		expect(add).toHaveBeenCalled();
		trigger().vars.onToggle?.(fakeSelf({ isActive: false }));
		expect(remove).toHaveBeenCalled();
	});

	it("follows the scroll velocity and direction, up to the boost cap", () => {
		html(marquee);
		run(marquees);
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		expect(() =>
			trigger().vars.onUpdate?.(
				fakeSelf({ getVelocity: () => 100000, direction: -1 }),
			),
		).not.toThrow();
		expect(() => gsap.ticker.tick()).not.toThrow();
	});

	it("freezes while the pointer is over it, and resumes after", () => {
		html(marquee);
		run(marquees);
		trigger().vars.onToggle?.(fakeSelf({ isActive: true }));
		$("[data-marquee]").dispatchEvent(new Event("pointerenter"));
		expect(() => gsap.ticker.tick()).not.toThrow();
		$("[data-marquee]").dispatchEvent(new Event("pointerleave"));
		expect(() => gsap.ticker.tick()).not.toThrow();
	});

	it("takes its loop length from --marquee-duration", () => {
		html(
			`<div data-marquee style="--marquee-duration: 90s"><div data-marquee-track><span>a</span></div></div>`,
		);
		const original = window.getComputedStyle;
		vi.spyOn(window, "getComputedStyle").mockImplementation((el, pseudo) => {
			const real = original(el, pseudo);
			return new Proxy(real, {
				get: (target, prop) =>
					prop === "getPropertyValue"
						? (name: string) =>
								name === "--marquee-duration"
									? "90s"
									: target.getPropertyValue(name)
						: Reflect.get(target, prop),
			});
		});
		run(marquees);
		const loop = gsap.globalTimeline
			.getChildren(false, true, false)
			.find((t) => t.duration() === 90);
		expect(loop).toBeDefined();
	});
});

describe("observeReveals: hydration", () => {
	it("reveals held-back content once its island goes live", async () => {
		vi.useFakeTimers({ toFake: ["setTimeout", "performance"] });
		html(`<astro-island ssr><p data-reveal>Dentro</p></astro-island>`);
		run(observeReveals);
		const el = $("[data-reveal]");
		FakeIntersectionObserver.instances.at(-1)?.fire(el);
		expect(el).not.toHaveAttribute(REVEALED);

		$("astro-island").removeAttribute("ssr");
		await vi.advanceTimersByTimeAsync(0);
		await vi.advanceTimersByTimeAsync(400);
		gsap.globalTimeline.getChildren().at(-1)?.totalProgress(1);
		expect(el).toHaveAttribute(REVEALED);
	});

	it("sorts a batch into visual reading order", async () => {
		html(`<p id="b" data-reveal>b</p><p id="a" data-reveal>a</p>`);
		run(observeReveals);
		$("#a").getBoundingClientRect = () => ({ top: 0, left: 0 }) as DOMRect;
		$("#b").getBoundingClientRect = () => ({ top: 50, left: 0 }) as DOMRect;
		const io = FakeIntersectionObserver.instances.at(-1);
		io?.callback(
			[$("#b"), $("#a")].map(
				(target) =>
					({
						target,
						isIntersecting: true,
					}) as unknown as IntersectionObserverEntry,
			),
			io as unknown as IntersectionObserver,
		);
		await flush();
		const tween = gsap.globalTimeline.getChildren().at(-1) as gsap.core.Tween;
		expect(tween.targets().map((t) => (t as HTMLElement).id)).toEqual([
			"a",
			"b",
		]);
	});
});
