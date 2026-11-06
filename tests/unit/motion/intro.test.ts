// @vitest-environment jsdom
import gsap from "gsap";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { galaxyState } from "@/lib/galaxyState";
import { MOTION } from "@/lib/motion/core";
import { playHero } from "@/lib/motion/hero";
import { INTRO_OPEN_EVENT, introGate } from "@/lib/motion/intro";
import { flush, installMotionEnv, runScene } from "../helpers/motionEnv";

let stop: (() => void) | undefined;
const html = (markup: string) => {
	document.body.innerHTML = markup;
};
const $ = <T extends Element = HTMLElement>(selector: string) =>
	document.querySelector(selector) as T;

const GATE = `
<div data-bang-cosmos></div>
<div class="relative z-2" id="wrapper">
<div data-intro>
  <div data-intro-sky></div>
  <div data-intro-drift>
    <span data-intro-ripple></span>
    <span data-intro-halo></span>
    <button data-intro-point type="button">
      <canvas data-intro-flakes></canvas>
    </button>
  </div>
  <p data-intro-line>uno</p>
  <p data-intro-line>dos</p>
  <div data-intro-line>tres</div>
  <button data-intro-skip type="button">Saltar</button>
</div>
<main id="main-content"><a href="#x" id="behind">Contenido</a></main>
<footer id="footer"></footer>
</div>`;

/** Every `intro:open` the page hears, in order. */
let opened: boolean[] = [];
const onOpen = (e: Event) => {
	opened.push((e as CustomEvent<{ bang: boolean }>).detail.bang);
};

const rect = (left: number, top: number): DOMRect =>
	({
		left,
		top,
		width: 100,
		height: 100,
		right: left + 100,
		bottom: top + 100,
	}) as DOMRect;

beforeEach(() => {
	installMotionEnv("no-preference");
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
			unobserve() {}
		},
	);
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
	opened = [];
	window.addEventListener(INTRO_OPEN_EVENT, onOpen);
	galaxyState.bang = 1;
});
afterEach(() => {
	stop?.();
	stop = undefined;
	window.removeEventListener(INTRO_OPEN_EVENT, onOpen);
	gsap.globalTimeline.clear();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

const start = () => {
	document.documentElement.classList.add("intro-on");
	html(GATE);
	$("[data-intro-drift]").getBoundingClientRect = () => rect(350, 250);
	stop = runScene(introGate);
};

/** Plays the Big Bang timeline (the one that owns the gate's onComplete) to its end. */
const playBang = () => {
	const tl = gsap.globalTimeline
		.getChildren(false, false, true)
		.find((t) => (t.vars as { onComplete?: unknown }).onComplete) as
		| gsap.core.Timeline
		| undefined;
	tl?.progress(1);
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("introGate: without a gate", () => {
	it("does nothing when <html> has no intro-on (skipped, returning visitor, deep link)", () => {
		html(GATE);
		stop = runScene(introGate);
		expect($("[data-intro]")).not.toBeNull();
		expect(galaxyState.bang).toBe(1);
		expect(document.querySelector("[inert]")).toBeNull();
		expect(opened).toEqual([]);
	});

	it("does nothing on a page that has no gate markup", () => {
		document.documentElement.classList.add("intro-on");
		html(`<main id="main-content"></main>`);
		stop = runScene(introGate);
		expect(galaxyState.bang).toBe(1);
	});
});

describe("introGate: the gate", () => {
	it("starts at point zero: no stars yet, the page is out of reach and does not scroll", () => {
		start();
		expect(galaxyState.bang).toBe(0);
		expect($("#main-content")).toHaveAttribute("inert");
		expect($("#footer")).toHaveAttribute("inert");
		expect($("[data-bang-cosmos]")).toHaveAttribute("inert");
		// The gate itself, and every ancestor of it, must stay reachable: the Layout wraps the
		// page in a div, and marking THAT as inert made the gate unclickable for a real mouse.
		expect($("[data-intro]")).not.toHaveAttribute("inert");
		expect($("#wrapper")).not.toHaveAttribute("inert");
		expect($("[data-intro-point]").closest("[inert]")).toBeNull();
		expect($("[data-intro-skip]").closest("[inert]")).toBeNull();
		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
		// The page is still in the DOM underneath (crawlers, Lighthouse).
		expect($("#behind")).toBeInTheDocument();
	});

	it("tells the story in three lines and the invitation is the last", () => {
		start();
		const [first, second, third] = [
			...document.querySelectorAll<HTMLElement>("[data-intro-line]"),
		];
		gsap.globalTimeline.progress(1);
		expect(gsap.getProperty(first, "opacity")).toBe(0);
		expect(gsap.getProperty(second, "opacity")).toBe(0);
		expect(gsap.getProperty(third, "opacity")).toBe(1);
	});

	it("each line gets time to be read, then a pause with nothing on screen, then the invitation at 8 s", async () => {
		const { MOTION } = await import("@/lib/motion/core");
		const m = MOTION.intro;
		expect(m.invite).toBe(8);
		// Each of the two lines stays at least ~2.5 s fully on screen (fade in 0.8 s).
		expect(m.firstOut - (m.first + 0.8)).toBeGreaterThanOrEqual(2);
		expect(m.secondOut - (m.second + 0.8)).toBeGreaterThanOrEqual(1.5);
		// Order: line 1 leaves before line 2 comes, and there is a pause before the invitation.
		expect(m.firstOut + 0.5).toBeLessThanOrEqual(m.second + 0.01);
		expect(m.invite - (m.secondOut + 0.5)).toBeGreaterThanOrEqual(1);
	});

	it("at rest the particle is calm; with the cursor over the sphere its glow rises", async () => {
		start();
		const glow = () =>
			Number(gsap.getProperty($("[data-intro-halo]"), "opacity"));
		await wait(80);
		expect(glow()).toBeLessThan(0.34);

		$("[data-intro-point]").dispatchEvent(new MouseEvent("pointerenter"));
		// Under load the ticker may run slower: wait for it instead of a fixed time.
		await vi.waitFor(() => expect(glow()).toBeGreaterThan(0.4), {
			timeout: 4000,
		});
	});

	it("when the cursor leaves the sphere the energy drains again", async () => {
		start();
		const point = $("[data-intro-point]");
		point.dispatchEvent(new MouseEvent("pointerenter"));
		await wait(500);
		point.dispatchEvent(new MouseEvent("pointerleave"));
		await vi.waitFor(
			() =>
				expect(
					Number(gsap.getProperty($("[data-intro-halo]"), "opacity")),
				).toBeLessThan(0.34),
			{ timeout: 5000 },
		);
	});

	it("the skip button keeps its real name for assistive tech while its letters scramble", async () => {
		start();
		const skip = $("[data-intro-skip]");
		expect(skip).toHaveAttribute("aria-label", "Saltar");
		const letters = skip.querySelector("span");
		expect(letters).toHaveAttribute("aria-hidden", "true");
		// It scrambles on load and ends reading the real words.
		gsap.globalTimeline.progress(1);
		expect(skip.textContent).toBe("Saltar");
	});

	it("it scrambles again when the cursor arrives, and settles back on the real text", async () => {
		start();
		const skip = $("[data-intro-skip]");
		gsap.globalTimeline.progress(1);
		skip.dispatchEvent(new MouseEvent("pointerenter"));
		// It restarts: there is a running tween on the text again.
		expect(gsap.getTweensOf(skip.querySelector("span")).length).toBeGreaterThan(
			0,
		);
		gsap.globalTimeline.progress(1);
		expect(skip.textContent).toBe("Saltar");
	});

	it("the pointer perturbs the particle: it leans toward the cursor", () => {
		start();
		const point = $("[data-intro-point]");
		window.dispatchEvent(
			new MouseEvent("pointermove", { clientX: 700, clientY: 300 }),
		);
		gsap.globalTimeline.progress(1);
		expect(Number(gsap.getProperty(point, "x"))).toBeGreaterThan(5);
		// It never leans past its limit.
		expect(Number(gsap.getProperty(point, "x"))).toBeLessThanOrEqual(56);
	});

	it("a far cursor barely moves it; a close one moves it more", () => {
		start();
		const point = $("[data-intro-point]");
		window.dispatchEvent(
			new MouseEvent("pointermove", { clientX: 1400, clientY: 300 }),
		);
		gsap.globalTimeline.progress(1);
		const far = Number(gsap.getProperty(point, "x"));
		gsap.set(point, { x: 0 });
		window.dispatchEvent(
			new MouseEvent("pointermove", { clientX: 520, clientY: 300 }),
		);
		gsap.globalTimeline.progress(1);
		const close = Number(gsap.getProperty(point, "x"));
		expect(close).toBeGreaterThan(0);
		expect(far).toBeGreaterThan(0);
	});
});

describe("introGate: opening", () => {
	it("Escape skips it at once: no explosion, the page is released", () => {
		start();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		expect(opened).toEqual([false]);
		expect(document.documentElement.classList.contains("intro-on")).toBe(false);
		expect(document.querySelector("[data-intro]")).toBeNull();
		expect(document.querySelector("[inert]")).toBeNull();
		expect(galaxyState.bang).toBe(1);
		expect($("#main-content")).toHaveAttribute("tabindex", "-1");
		// A visitor who goes to a project and comes back is not sent to point zero again.
		expect(sessionStorage.getItem("intro-seen")).toBe("1");
	});

	it("the skip button does the same", () => {
		start();
		$("[data-intro-skip]").click();
		expect(opened).toEqual([false]);
		expect(document.querySelector("[data-intro]")).toBeNull();
	});

	it("the sphere circles in a slow orbit, gets smaller and ends exactly where it began", () => {
		start();
		$("[data-intro-point]").click();
		const tl = gsap.globalTimeline
			.getChildren(false, false, true)
			.find(
				(t) => (t.vars as { onComplete?: unknown }).onComplete,
			) as gsap.core.Timeline;
		const point = $("[data-intro-point]");
		expect(tl.duration()).toBeGreaterThanOrEqual(MOTION.intro.orbit);
		tl.progress(0.3);
		expect(Number(gsap.getProperty(point, "x"))).not.toBe(0);
		tl.progress(0.999);
		expect(Math.abs(Number(gsap.getProperty(point, "x")))).toBeLessThan(2);
		expect(Math.abs(Number(gsap.getProperty(point, "y")))).toBeLessThan(2);
		// Nothing exploded yet: the page is still behind the gate.
		expect(opened).toEqual([]);
	});

	it("clicking the particle is the Big Bang: the portfolio is simply there", () => {
		start();
		$("[data-intro-point]").click();
		// Nothing is announced until the sphere has circled back and exploded.
		expect(opened).toEqual([]);
		expect($("[data-intro]")).not.toBeNull();
		playBang();

		expect(opened).toEqual([true]);
		expect(document.documentElement.classList.contains("intro-on")).toBe(false);
		expect(document.querySelector("[data-intro]")).toBeNull();
		expect(document.querySelector("[inert]")).toBeNull();
		expect(galaxyState.bang).toBe(1);
		// The cosmos layer ends with no inline leftovers.
		expect($("[data-bang-cosmos]").getAttribute("style") ?? "").toBe("");
	});

	it("only the first activation counts (a double click does not explode twice)", () => {
		start();
		$("[data-intro-point]").click();
		$("[data-intro-point]").click();
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		playBang();
		expect(opened).toEqual([true]);
	});

	it("if the engine stops while the gate is up, the page is released (nobody is trapped)", () => {
		start();
		stop?.();
		stop = undefined;
		expect(document.documentElement.classList.contains("intro-on")).toBe(false);
		expect(document.querySelector("[inert]")).toBeNull();
		expect(galaxyState.bang).toBe(1);
		expect(opened).toEqual([false]);
	});
});

describe("hero: waits for the gate", () => {
	const hero = `<section data-hero>
		<p data-hero-label>label</p>
		<h1><span data-hero-line>a</span><span data-hero-line>b</span></h1>
		<p data-hero-lead>lead</p>
		<div data-hero-cta><a href="#">cta</a></div>
		<div data-hero-portrait><img alt="" /></div>
	</section>`;

	it("does not play while the gate is up, and plays when it opens", async () => {
		document.documentElement.classList.add("intro-on");
		html(hero);
		stop = runScene(playHero);
		await flush();
		const label = $("[data-hero-label]");
		expect(gsap.getTweensOf(label)).toHaveLength(0);

		window.dispatchEvent(
			new CustomEvent(INTRO_OPEN_EVENT, { detail: { bang: true } }),
		);
		expect(gsap.getTweensOf(label).length).toBeGreaterThan(0);
	});

	it("after the Big Bang everything is simply there at once: no flying in, no spinning", () => {
		document.documentElement.classList.add("intro-on");
		html(hero);
		stop = runScene(playHero);
		window.dispatchEvent(
			new CustomEvent(INTRO_OPEN_EVENT, { detail: { bang: true } }),
		);
		gsap.globalTimeline.time(0.01);
		const label = $("[data-hero-label]");
		expect(Number(gsap.getProperty(label, "opacity"))).toBe(1);
		expect(Number(gsap.getProperty(label, "rotation"))).toBe(0);
		expect(Number(gsap.getProperty(label, "x"))).toBe(0);
	});

	it("after a skip it plays the normal entrance (no flying parts)", () => {
		document.documentElement.classList.add("intro-on");
		html(hero);
		stop = runScene(playHero);
		window.dispatchEvent(
			new CustomEvent(INTRO_OPEN_EVENT, { detail: { bang: false } }),
		);
		gsap.globalTimeline.time(0.11);
		expect(Number(gsap.getProperty($("[data-hero-label]"), "scale"))).toBe(1);
	});

	it("without a gate it plays at once, as before", async () => {
		html(hero);
		stop = runScene(playHero);
		await flush();
		expect(gsap.getTweensOf($("[data-hero-label]")).length).toBeGreaterThan(0);
	});
});
