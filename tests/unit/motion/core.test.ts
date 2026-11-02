// @vitest-environment jsdom
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	byVisualOrder,
	dimFloor,
	HYDRATION_SETTLE_MS,
	isBrowser,
	isHydrating,
	isRegistered,
	MOTION,
	MOTION_CLASS,
	REVEALED,
	safeRefresh,
	settle,
	trackIslands,
	watch,
	whenSeen,
	withMotion,
} from "@/lib/motion/core";
import {
	FakeIntersectionObserver,
	flush,
	installMotionEnv,
} from "../helpers/motionEnv";

beforeEach(() => installMotionEnv());
afterEach(() => vi.restoreAllMocks());

describe("MOTION constants", () => {
	it("keeps the dimmed-text floors inside 0..1, stronger for body text", () => {
		for (const theme of ["light", "dark"] as const) {
			expect(MOTION.dim.large[theme]).toBeGreaterThan(0);
			expect(MOTION.dim.body[theme]).toBeLessThan(1);
			expect(MOTION.dim.body[theme]).toBeGreaterThan(MOTION.dim.large[theme]);
		}
	});

	it("bounds the pinned scenes", () => {
		expect(MOTION.hscroll.maxScreens).toBeLessThanOrEqual(2.5);
		expect(MOTION.manifesto.screens).toBeLessThanOrEqual(2.5);
	});
});

describe("byVisualOrder", () => {
	it("orders top to bottom, then left to right", () => {
		const items = [
			{ top: 10, left: 50 },
			{ top: 0, left: 90 },
			{ top: 10, left: 5 },
		];
		expect([...items].sort(byVisualOrder)).toEqual([
			{ top: 0, left: 90 },
			{ top: 10, left: 5 },
			{ top: 10, left: 50 },
		]);
	});
});

describe("dimFloor", () => {
	const textOf = (size: string) => {
		const el = document.createElement("p");
		el.style.fontSize = size;
		document.body.append(el);
		return el;
	};

	it("uses the large-text floor from 24px up and the body floor below", () => {
		expect(dimFloor(textOf("30px"))).toBe(MOTION.dim.large.light);
		expect(dimFloor(textOf("24px"))).toBe(MOTION.dim.large.light);
		expect(dimFloor(textOf("17px"))).toBe(MOTION.dim.body.light);
	});

	it("follows the theme class on <html>", () => {
		document.documentElement.classList.add("dark");
		expect(dimFloor(textOf("30px"))).toBe(MOTION.dim.large.dark);
		expect(dimFloor(textOf("17px"))).toBe(MOTION.dim.body.dark);
	});
});

describe("settle", () => {
	it("marks the element revealed and wipes GSAP's inline styles", () => {
		const el = document.createElement("div");
		el.style.opacity = "0";
		el.style.transform = "translateY(20px)";
		settle(el);
		expect(el).toHaveAttribute(REVEALED);
		expect(el.style.opacity).toBe("");
		expect(el.style.transform).toBe("");
	});
});

describe("withMotion", () => {
	it("runs the setup with the tools when motion is allowed", () => {
		const setup = vi.fn();
		const stop = withMotion(setup);
		expect(isBrowser()).toBe(true);
		expect(isRegistered()).toBe(true);
		expect(setup).toHaveBeenCalledTimes(1);
		const tools = setup.mock.calls[0][0];
		expect(tools.gsap).toBeDefined();
		expect(tools.ScrollTrigger).toBeDefined();
		expect(tools.SplitText).toBeDefined();
		stop();
	});

	it("does not run the setup under prefers-reduced-motion: reduce", () => {
		installMotionEnv("reduce");
		const setup = vi.fn();
		withMotion(setup)();
		expect(setup).not.toHaveBeenCalled();
	});

	it("runs the scene's cleanup when stopped", () => {
		const cleanup = vi.fn();
		const stop = withMotion(() => cleanup);
		expect(cleanup).not.toHaveBeenCalled();
		stop();
		expect(cleanup).toHaveBeenCalledTimes(1);
	});

	it("exposes the class that lets CSS hide initial states", () => {
		expect(MOTION_CLASS).toBe("motion-ok");
	});
});

describe("whenSeen", () => {
	const seen = (rootMargin?: string) => {
		const el = document.createElement("div");
		const run = vi.fn();
		const stop = whenSeen(el, run, rootMargin);
		const io = FakeIntersectionObserver.instances.at(-1);
		if (!io) throw new Error("no observer");
		return { el, run, stop, io };
	};

	it("runs once when the element enters the viewport", () => {
		const { el, run, io } = seen();
		io.fire(el, { intersecting: true });
		io.fire(el, { intersecting: true });
		expect(run).toHaveBeenCalledTimes(1);
	});

	it("also runs when the reader already jumped past it", () => {
		const { el, run, io } = seen();
		io.fire(el, { above: true });
		expect(run).toHaveBeenCalledTimes(1);
	});

	it("waits while the element is below the viewport", () => {
		const { el, run, io } = seen();
		io.fire(el, { intersecting: false });
		expect(run).not.toHaveBeenCalled();
	});

	it("passes the root margin to the observer", () => {
		const { io } = seen("0px 0px -5% 0px");
		expect(io.options?.rootMargin).toBe("0px 0px -5% 0px");
	});

	it("never runs after being cancelled", () => {
		const { el, run, io, stop } = seen();
		stop();
		io.fire(el, { intersecting: true });
		expect(run).not.toHaveBeenCalled();
	});
});

describe("safeRefresh", () => {
	it("kills triggers whose element left the DOM, then refreshes", () => {
		const el = document.createElement("div");
		document.body.append(el);
		const kill = vi.fn();
		const refresh = vi.fn();
		const fake = {
			getAll: () => [{ trigger: el, kill }],
			refresh,
		} as unknown as typeof ScrollTrigger;

		safeRefresh(fake);
		expect(kill).not.toHaveBeenCalled();
		expect(refresh).toHaveBeenCalledTimes(1);

		el.remove();
		safeRefresh(fake);
		expect(kill).toHaveBeenCalledTimes(1);
	});

	it("swallows a failing refresh with a warning", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const fake = {
			getAll: () => [],
			refresh: () => {
				throw new Error("boom");
			},
		} as unknown as typeof ScrollTrigger;
		expect(() => safeRefresh(fake)).not.toThrow();
		expect(warn).toHaveBeenCalled();
	});
});

describe("island hydration", () => {
	const island = (ssr: boolean) => {
		const host = document.createElement("astro-island");
		if (ssr) host.setAttribute("ssr", "");
		const child = document.createElement("span");
		host.append(child);
		document.body.append(host);
		return { host, child };
	};

	it("is never hydrating outside an island", () => {
		const el = document.createElement("div");
		document.body.append(el);
		expect(isHydrating(el)).toBe(false);
	});

	it("is hydrating while the island still has the ssr attribute", () => {
		expect(isHydrating(island(true).child)).toBe(true);
	});

	it("stays hydrating for a few frames after the island went live", async () => {
		vi.useFakeTimers({ toFake: ["performance", "setTimeout"] });
		const stop = trackIslands();
		const { host, child } = island(true);
		host.removeAttribute("ssr");
		await vi.advanceTimersByTimeAsync(0);
		expect(isHydrating(child)).toBe(true);
		await vi.advanceTimersByTimeAsync(HYDRATION_SETTLE_MS + 5);
		expect(isHydrating(child)).toBe(false);
		stop();
		vi.useRealTimers();
	});
});

describe("watch", () => {
	it("runs the handler for elements already on the page", () => {
		document.body.innerHTML = '<p class="x"></p><p class="x"></p>';
		const handler = vi.fn();
		const stop = watch(".x", handler);
		expect(handler).toHaveBeenCalledTimes(2);
		stop();
	});

	it("runs for elements added later, once each", async () => {
		const handler = vi.fn();
		const stop = watch(".late", handler);
		const el = document.createElement("div");
		el.className = "late";
		document.body.append(el);
		await flush();
		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler).toHaveBeenCalledWith(el);
		stop();
	});

	it("also matches a subtree that arrives with its root", async () => {
		const handler = vi.fn();
		const stop = watch(".deep", handler);
		const wrap = document.createElement("section");
		wrap.innerHTML = '<div><i class="deep"></i></div>';
		document.body.append(wrap);
		await flush();
		expect(handler).toHaveBeenCalledTimes(1);
		stop();
	});

	it("skips elements inside an island that has not hydrated, then picks them up", async () => {
		vi.useFakeTimers({ toFake: ["performance", "setTimeout"] });
		const handler = vi.fn();
		document.body.innerHTML =
			'<astro-island ssr><p class="inside"></p></astro-island>';
		const stop = watch(".inside", handler);
		expect(handler).not.toHaveBeenCalled();

		const host = document.querySelector("astro-island") as Element;
		trackIslands();
		host.removeAttribute("ssr");
		await vi.advanceTimersByTimeAsync(0);
		await vi.advanceTimersByTimeAsync(HYDRATION_SETTLE_MS + 5);
		expect(handler).toHaveBeenCalledTimes(1);
		stop();
		vi.useRealTimers();
	});

	it("keeps going when one handler throws", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		document.body.innerHTML = '<p class="y"></p><p class="y"></p>';
		const handler = vi
			.fn()
			.mockImplementationOnce(() => {
				throw new Error("scene failed");
			})
			.mockImplementation(() => undefined);
		const stop = watch(".y", handler);
		expect(handler).toHaveBeenCalledTimes(2);
		expect(warn).toHaveBeenCalledTimes(1);
		stop();
	});

	it("runs every handler cleanup when stopped, and stops watching", async () => {
		document.body.innerHTML = '<p class="z"></p>';
		const cleanup = vi.fn();
		const handler = vi.fn(() => cleanup);
		const stop = watch(".z", handler);
		stop();
		expect(cleanup).toHaveBeenCalledTimes(1);

		const el = document.createElement("p");
		el.className = "z";
		document.body.append(el);
		await flush();
		expect(handler).toHaveBeenCalledTimes(1);
	});
});
