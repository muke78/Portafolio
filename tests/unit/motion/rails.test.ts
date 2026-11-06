// @vitest-environment jsdom
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOTION } from "@/lib/motion/core";
import { RAIL_QUERY, railScenes } from "@/lib/motion/rails";
import {
	FakeIntersectionObserver,
	flush,
	installMotionEnv,
	runScene,
} from "../helpers/motionEnv";

let stop: (() => void) | undefined;
const run = () => {
	stop = runScene(railScenes);
	return stop;
};
const html = (markup: string) => {
	document.body.innerHTML = markup;
};
const $ = <T extends Element = HTMLElement>(selector: string) =>
	document.querySelector(selector) as T;

const rail = (cards = 6) => `
<div data-hscroll>
  <div data-hscroll-viewport>
    <ul data-hscroll-track>
      ${Array.from(
				{ length: cards },
				(_, i) =>
					`<li data-rail-card><article><figure><img loading="lazy" alt=""></figure><a id="c${i}" href="#">c${i}</a></article></li>`,
			).join("")}
    </ul>
  </div>
  <p><span data-hscroll-current>1</span> / ${cards}</p>
  <div data-hscroll-progress></div>
</div>`;

/** jsdom has no layout: give the viewport and the track a width. */
const size = (viewport: number, track: number) => {
	Object.defineProperty($("[data-hscroll-viewport]"), "clientWidth", {
		configurable: true,
		value: viewport,
	});
	Object.defineProperty($("[data-hscroll-track]"), "scrollWidth", {
		configurable: true,
		value: track,
	});
};

const onlyRailQuery = () => installMotionEnv("no-preference", [RAIL_QUERY]);

beforeEach(() => {
	onlyRailQuery();
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

describe("horizontalRails", () => {
	it("pins the wrapper with ONE trigger per rail, however many cards it holds", async () => {
		html(rail(25));
		run();
		await flush();
		const triggers = ScrollTrigger.getAll();
		expect(triggers).toHaveLength(1);
		expect(triggers[0].vars.pin).toBe(true);
		expect(triggers[0].trigger).toBe($("[data-hscroll]"));
	});

	it("does not pin a phone-sized screen: the row stays a native swipe", async () => {
		installMotionEnv("no-preference", []);
		html(rail());
		run();
		await flush();
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});

	it("caps the scroll length at maxScreens whatever the content width", async () => {
		html(rail(25));
		size(1000, 100_000);
		run();
		await flush();
		const end = (ScrollTrigger.getAll()[0].vars.end as () => string)();
		const px = Number(end.replace("+=", ""));
		expect(px).toBe(Math.round(window.innerHeight * MOTION.hscroll.maxScreens));
	});

	it("follows the content when it is short (no empty scroll)", async () => {
		html(rail(3));
		size(1000, 1400);
		run();
		await flush();
		const end = (ScrollTrigger.getAll()[0].vars.end as () => string)();
		expect(end).toBe("+=400");
	});

	it("slides the track with the progress, fills the bar and clears on stop", async () => {
		html(rail(10));
		size(1000, 3000);
		const stopAll = run();
		await flush();
		const track = $("[data-hscroll-track]");
		const bar = $("[data-hscroll-progress]");

		ScrollTrigger.getAll()[0].vars.onUpdate?.({
			progress: 0.5,
			getVelocity: () => 0,
		} as unknown as ScrollTrigger);
		gsap.globalTimeline.progress(1);
		expect(gsap.getProperty(track, "x")).toBe(-1000);
		expect(gsap.getProperty(bar, "scaleX")).toBe(0.5);

		stopAll();
		stop = undefined;
		expect(track.style.transform).toBe("");
	});

	it("leans with the scroll speed but never past the limit", async () => {
		html(rail(10));
		size(1000, 3000);
		run();
		await flush();
		ScrollTrigger.getAll()[0].vars.onUpdate?.({
			progress: 0.2,
			getVelocity: () => 99_999,
		} as unknown as ScrollTrigger);
		const lean = gsap.getTweensOf($("[data-hscroll-track]"))[0];
		lean.progress(1);
		expect(
			Math.abs(Number(gsap.getProperty($("[data-hscroll-track]"), "skewX"))),
		).toBeLessThanOrEqual(MOTION.hscroll.skew);
	});

	it("counts from 1 at the start to the last card at the end, in step with the progress", async () => {
		html(rail(6));
		size(1000, 3000);
		run();
		await flush();
		const trigger = ScrollTrigger.getAll()[0];
		const at = (progress: number) => {
			trigger.vars.onUpdate?.({
				progress,
				getVelocity: () => 0,
			} as unknown as ScrollTrigger);
			gsap.globalTimeline.progress(1);
			return $("[data-hscroll-current]").textContent;
		};
		// Arriving at the rail it reads 1 (not 2: the first card sits left of centre).
		expect(at(0)).toBe("1");
		expect(at(0.5)).toBe("4");
		expect(at(1)).toBe("6");
		expect(at(0)).toBe("1");
	});

	it("loads the rail's pictures only once the rail is near, and also the late ones", async () => {
		html(rail(3));
		run();
		await flush();
		const imgs = [...document.querySelectorAll<HTMLImageElement>("img")];
		expect(imgs.every((i) => i.getAttribute("loading") === "lazy")).toBe(true);

		FakeIntersectionObserver.fireAll($("[data-hscroll]"));
		expect(imgs.every((i) => i.getAttribute("loading") === "eager")).toBe(true);

		// Data arrived after the rail was already near.
		const late = document.createElement("li");
		late.setAttribute("data-rail-card", "");
		late.innerHTML = `<img loading="lazy" alt="">`;
		$("[data-hscroll-track]").append(late);
		await new Promise((r) => setTimeout(r, 200));
		expect(late.querySelector("img")?.getAttribute("loading")).toBe("eager");
	});

	it("keyboard focus on a card that is out of view moves the page scroll, not the clipped row", async () => {
		html(rail(10));
		size(1000, 3000);
		run();
		await flush();
		const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
		const link = $("#c9");
		link.matches = ((sel: string) => sel === ":focus-visible") as never;
		const track = $("[data-hscroll-track]");
		const card = link.closest("[data-rail-card]") as HTMLElement;
		track.getBoundingClientRect = () => ({ left: 0 }) as DOMRect;
		card.getBoundingClientRect = () => ({ left: 2600, right: 2900 }) as DOMRect;
		$("[data-hscroll-viewport]").getBoundingClientRect = () =>
			({ left: 0, right: 1000 }) as DOMRect;

		link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		expect(scrollTo).toHaveBeenCalledTimes(1);
		expect(scrollTo.mock.calls[0][0]).toMatchObject({ behavior: "auto" });
	});

	it("leaves a mouse click alone (only keyboard focus travels)", async () => {
		html(rail(10));
		size(1000, 3000);
		run();
		await flush();
		const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
		const link = $("#c9");
		link.matches = (() => false) as never;
		link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		expect(scrollTo).not.toHaveBeenCalled();
	});
});
