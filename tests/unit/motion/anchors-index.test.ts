// @vitest-environment jsdom
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { anchorScroll } from "@/lib/motion/anchors";
import { MOTION_CLASS } from "@/lib/motion/core";
import { initMotion, refreshScrollTriggers } from "@/lib/motion/index";
import { installMotionEnv, runScene } from "../helpers/motionEnv";

let stop: (() => void) | undefined;

const page = (extra = "") => {
	document.body.innerHTML = `
		<nav><a id="go" href="/es/home#projects">Proyectos</a>
		<a id="other" href="/en/home#projects">Otro idioma</a>
		<a id="missing" href="/es/home#nope">Nada</a>
		<a id="blank" href="/es/home#projects" target="_blank">Nueva</a></nav>
		<section id="projects">Proyectos</section>${extra}`;
};

/** Where `#projects` sits in the (fake) layout: top of the section in the page. */
const placeSection = (top: number) => {
	const section = document.getElementById("projects") as HTMLElement;
	section.getBoundingClientRect = () =>
		({ top: top - window.scrollY, bottom: 0, left: 0, right: 0 }) as DOMRect;
	return section;
};

/** Finishes the scroll tween that goTo() started. */
const finishScroll = () => {
	for (const child of gsap.globalTimeline.getChildren(false, true, false)) {
		child.totalProgress(1);
	}
};

beforeEach(() => {
	installMotionEnv();
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
	history.replaceState(null, "", "/es/home");
});

afterEach(() => {
	stop?.();
	stop = undefined;
	gsap.globalTimeline.clear();
	for (const t of ScrollTrigger.getAll()) t.kill();
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe("anchorScroll", () => {
	it("takes over a click on an in-page anchor: no browser jump, URL updated, GSAP scroll", () => {
		page();
		placeSection(1200);
		stop = runScene(anchorScroll);

		const click = new MouseEvent("click", { bubbles: true, cancelable: true });
		document.getElementById("go")?.dispatchEvent(click);

		expect(click.defaultPrevented).toBe(true);
		expect(location.hash).toBe("#projects");
		finishScroll();
		expect(window.scrollTo).toHaveBeenCalled();
	});

	it.each([
		["a link to another page", "other"],
		["a missing target", "missing"],
		["a link that opens a new tab", "blank"],
	])("leaves %s to the browser", (_name, id) => {
		page();
		stop = runScene(anchorScroll);
		const click = new MouseEvent("click", { bubbles: true, cancelable: true });
		document.getElementById(id)?.dispatchEvent(click);
		expect(click.defaultPrevented).toBe(false);
	});

	it.each([
		["ctrl", { ctrlKey: true }],
		["meta", { metaKey: true }],
		["shift", { shiftKey: true }],
		["alt", { altKey: true }],
		["a right click", { button: 2 }],
	])("ignores %s clicks", (_name, init) => {
		page();
		stop = runScene(anchorScroll);
		const click = new MouseEvent("click", {
			bubbles: true,
			cancelable: true,
			...init,
		});
		document.getElementById("go")?.dispatchEvent(click);
		expect(click.defaultPrevented).toBe(false);
	});

	it("cancels the trip when the reader scrolls on purpose", () => {
		page();
		placeSection(5000);
		stop = runScene(anchorScroll);
		document
			.getElementById("go")
			?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true }),
			);
		const running = gsap.globalTimeline.getChildren(false, true, false);
		expect(running.length).toBeGreaterThan(0);

		window.dispatchEvent(new Event("wheel"));
		expect(
			gsap.globalTimeline
				.getChildren(false, true, false)
				.filter((t) => !t.paused() && t.isActive()),
		).toHaveLength(0);
	});

	it("keeps correcting while the page is still growing, then stops", () => {
		vi.useFakeTimers({ toFake: ["setTimeout", "performance"] });
		page();
		const section = placeSection(1000);
		stop = runScene(anchorScroll);

		document
			.getElementById("go")
			?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true }),
			);
		finishScroll();

		// A lazy island pushes the section further down after the first arrival.
		section.getBoundingClientRect = () =>
			({ top: 1800 - window.scrollY, bottom: 0, left: 0, right: 0 }) as DOMRect;
		vi.advanceTimersByTime(300);
		finishScroll();

		const calls = (window.scrollTo as unknown as ReturnType<typeof vi.fn>).mock
			.calls;
		expect(calls.length).toBeGreaterThan(1);
	});

	it("follows the location hash on load, after fonts are ready", async () => {
		history.replaceState(null, "", "/es/home#projects");
		page();
		placeSection(900);
		Object.defineProperty(document, "fonts", {
			value: { ready: Promise.resolve() },
			configurable: true,
		});
		stop = runScene(anchorScroll);
		await Promise.resolve();
		await Promise.resolve();
		finishScroll();
		expect(window.scrollTo).toHaveBeenCalled();
	});

	it("removes its listeners when stopped", () => {
		page();
		const stopScene = runScene(anchorScroll);
		stopScene();
		const click = new MouseEvent("click", { bubbles: true, cancelable: true });
		document.getElementById("go")?.dispatchEvent(click);
		expect(click.defaultPrevented).toBe(false);
	});
});

describe("initMotion", () => {
	it("starts the engine: html class, ready flag, and a stop that undoes both", () => {
		page();
		const stopEngine = initMotion();
		expect(document.documentElement.classList.contains(MOTION_CLASS)).toBe(
			true,
		);
		expect(window.__motionReady).toBe(true);

		stopEngine();
		expect(document.documentElement.classList.contains(MOTION_CLASS)).toBe(
			false,
		);
		window.__motionReady = undefined;
	});

	it("stays off under prefers-reduced-motion: reduce", () => {
		installMotionEnv("reduce");
		window.__motionReady = undefined;
		const stopEngine = initMotion();
		expect(document.documentElement.classList.contains(MOTION_CLASS)).toBe(
			false,
		);
		expect(window.__motionReady).toBeUndefined();
		stopEngine();
	});

	it("refreshes the triggers without throwing once the engine is registered", async () => {
		const stopEngine = initMotion();
		Object.defineProperty(document, "fonts", {
			value: { ready: Promise.resolve() },
			configurable: true,
		});
		await expect(refreshScrollTriggers()).resolves.toBeUndefined();
		stopEngine();
		window.__motionReady = undefined;
	});
});
