// @vitest-environment jsdom
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { galaxyState } from "@/lib/galaxyState";
import { REVEALED } from "@/lib/motion/core";
import { projectDetail } from "@/lib/motion/detail";
import { dialogs } from "@/lib/motion/dialogs";
import { galaxyScene } from "@/lib/motion/galaxy";
import { playHero } from "@/lib/motion/hero";
import { stackScenes } from "@/lib/motion/layers";
import { maskReveals, staggerGroups } from "@/lib/motion/masks";
import { cardImageParallax, marquees, setupParallax } from "@/lib/motion/media";
import { scrollProgress } from "@/lib/motion/page";
import { observeReveals } from "@/lib/motion/reveals";
import { manifestoScene } from "@/lib/motion/scenes";
import { skillFlights, snakeLine } from "@/lib/motion/skills";
import { splitTitles } from "@/lib/motion/split";
import { scrubText } from "@/lib/motion/text";
import {
	FakeIntersectionObserver,
	flush,
	installMotionEnv,
	runScene,
} from "../helpers/motionEnv";

const DESKTOP = "(min-width: 768px)";
const MOBILE = "(max-width: 767px)";

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

/** Every timeline GSAP is running, most recent last. */
const timelines = () =>
	gsap.globalTimeline.getChildren(false, false, true) as gsap.core.Timeline[];

beforeEach(() => {
	installMotionEnv("no-preference", [
		DESKTOP,
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

describe("playHero", () => {
	const hero = `
		<section data-hero>
			<p data-hero-label>Hola</p>
			<h1><span data-hero-line>Erick</span><span data-hero-line>González</span></h1>
			<p data-hero-lead>Lead</p>
			<div data-hero-cta><a>Uno</a><a>Dos</a></div>
			<figure data-hero-portrait><img alt="" src="x.png" /><div data-hero-cover></div></figure>
			<svg data-hero-rings><circle data-hero-ring-solid /><circle data-hero-ring-accent /></svg>
			<div data-hero-bar></div>
		</section>`;

	it("does nothing on a page without a hero", () => {
		html("<main></main>");
		expect(run(playHero)).toBeTypeOf("function");
		expect(timelines()).toHaveLength(0);
	});

	it("plays the load sequence, settles every part, then arms the scrubbed exit", () => {
		html(hero);
		run(playHero);
		const [load] = timelines();
		expect(load).toBeDefined();

		load.totalProgress(1);

		for (const el of document.querySelectorAll(
			"[data-hero-label], [data-hero-line], [data-hero-lead], [data-hero-cta] > *, [data-hero-portrait], [data-hero-rings], [data-hero-ring-accent], [data-hero-bar]",
		)) {
			expect(el).toHaveAttribute(REVEALED);
		}
		// The cover that hid the photo is gone, the photo was never clipped.
		expect(document.querySelector("[data-hero-cover]")).toBeNull();
		expect($("[data-hero-portrait] img").style.clipPath).toBe("");
		// The exit scrub only starts after the sequence ended.
		expect(ScrollTrigger.getAll().length).toBeGreaterThan(0);
	});

	it("leaves nothing running once stopped", () => {
		html(hero);
		const stopHero = run(playHero);
		timelines()[0].totalProgress(1);
		stopHero();
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});
});

describe("manifestoScene", () => {
	const manifesto = `
		<section data-manifesto>
			<p data-manifesto-text>Una frase que se enciende palabra por palabra</p>
			<div data-manifesto-track></div><div data-manifesto-track></div>
			<span data-manifesto-chip>GSAP</span><span data-manifesto-chip>Astro</span>
			<div data-manifesto-progress></div>
		</section>`;

	it("needs both the section and its text", () => {
		html("<section data-manifesto></section>");
		run(manifestoScene);
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});

	it("builds one pinned, scrubbed timeline and leaves the sentence as plain text", () => {
		html(manifesto);
		run(manifestoScene);
		expect(ScrollTrigger.getAll()).toHaveLength(1);
		const trigger = ScrollTrigger.getAll()[0];
		expect(trigger.pin).toBe($("[data-manifesto]"));
		// aria-label is not allowed on a <p>.
		expect($("[data-manifesto-text]")).not.toHaveAttribute("aria-label");
		expect($("[data-manifesto-text]").textContent).toContain("Una frase");
	});

	it("uses the shorter scene on a phone", () => {
		installMotionEnv("no-preference", [MOBILE, "(max-width: 767px)"]);
		html(manifesto);
		run(manifestoScene);
		expect(ScrollTrigger.getAll()).toHaveLength(1);
	});

	it("reverts the split text when stopped", () => {
		html(manifesto);
		const stopScene = run(manifestoScene);
		const words = document.querySelectorAll("[data-manifesto-text] div").length;
		expect(words).toBeGreaterThan(0);
		stopScene();
		expect(document.querySelectorAll("[data-manifesto-text] div")).toHaveLength(
			0,
		);
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});
});

describe("splitTitles", () => {
	it("marks the heading revealed and plays the lines once it is seen", () => {
		html("<h2 data-split>Un título largo que baja</h2>");
		run(splitTitles);
		const title = $("[data-split]");
		expect(title).toHaveAttribute(REVEALED);

		const io = FakeIntersectionObserver.instances.at(-1);
		expect(io?.targets.has(title)).toBe(true);
		io?.fire(title);
		expect(
			timelines().length + gsap.globalTimeline.getChildren().length,
		).toBeGreaterThan(0);
	});

	it("restores the original markup when stopped", () => {
		html("<h2 data-split>Título</h2>");
		const stopScene = run(splitTitles);
		stopScene();
		expect($("[data-split]").textContent).toBe("Título");
	});
});

describe("scrubText", () => {
	it("splits the paragraph into words and scrubs them with the scroll", () => {
		html("<p data-scrub-text>Tres palabras aquí</p>");
		run(scrubText);
		expect(ScrollTrigger.getAll().length).toBeGreaterThanOrEqual(1);
		expect($("[data-scrub-text]")).not.toHaveAttribute("aria-label");
	});

	it("never starts below the legibility floor", () => {
		html('<p data-scrub-text style="font-size: 30px">Texto grande</p>');
		run(scrubText);
		const words = [...document.querySelectorAll("[data-scrub-text] div")];
		expect(words.length).toBeGreaterThan(0);
		for (const w of words) {
			expect(Number(getComputedStyle(w).opacity)).toBeGreaterThanOrEqual(0.5);
		}
	});

	it("reverts when stopped", () => {
		html("<p data-scrub-text>Uno dos</p>");
		const stopScene = run(scrubText);
		stopScene();
		expect($("[data-scrub-text]").textContent).toBe("Uno dos");
	});
});

describe("observeReveals", () => {
	it("reveals an element once it enters the viewport and settles it", () => {
		vi.useFakeTimers();
		html("<p data-reveal>Hola</p>");
		run(observeReveals);
		const el = $("[data-reveal]");
		const io = FakeIntersectionObserver.instances.at(-1);
		expect(io?.targets.has(el)).toBe(true);

		io?.fire(el);
		// The batch tween ends and settles the element.
		gsap.globalTimeline.getChildren().at(-1)?.totalProgress(1);
		expect(el).toHaveAttribute(REVEALED);
		expect(io?.targets.has(el)).toBe(false);
	});

	it("leaves hero parts to the hero scene and already revealed ones alone", () => {
		html(
			`<section data-hero><p data-reveal>En el hero</p></section>
			 <p data-reveal ${REVEALED}>Ya listo</p>`,
		);
		run(observeReveals);
		const io = FakeIntersectionObserver.instances.at(-1);
		expect(io?.targets.size).toBe(0);
	});

	it("picks up elements added later", async () => {
		html("<main></main>");
		run(observeReveals);
		const el = document.createElement("p");
		el.setAttribute("data-reveal", "");
		$("main").append(el);
		await flush();
		expect(FakeIntersectionObserver.instances.at(-1)?.targets.has(el)).toBe(
			true,
		);
	});

	it("shows everything when the engine stops (reduced motion turned on)", () => {
		html("<p data-reveal>Hola</p>");
		const stopScene = run(observeReveals);
		stopScene();
		expect($("[data-reveal]")).toHaveAttribute(REVEALED);
	});

	it("holds back content in an island that has not hydrated, then reveals it after the grace period", async () => {
		vi.useFakeTimers({ toFake: ["setTimeout", "performance"] });
		html("<astro-island ssr><p data-reveal>Dentro</p></astro-island>");
		run(observeReveals);
		const el = $("[data-reveal]");
		const io = FakeIntersectionObserver.instances.at(-1);
		io?.fire(el);
		expect(el).not.toHaveAttribute(REVEALED);
		await vi.advanceTimersByTimeAsync(2600);
		gsap.globalTimeline.getChildren().at(-1)?.totalProgress(1);
		expect(el).toHaveAttribute(REVEALED);
	});
});

describe("maskReveals", () => {
	it("marks the frame, then opens it when seen", () => {
		html('<figure data-mask><img data-mask-img alt="" src="x.png" /></figure>');
		run(maskReveals);
		const frame = $("[data-mask]");
		expect(frame).toHaveAttribute(REVEALED);
		FakeIntersectionObserver.fireAll(frame);
		const tl = timelines().at(-1);
		expect(tl?.paused()).toBe(false);
	});

	it("opens sideways for data-mask=left and honours the delay", () => {
		html('<figure data-mask="left" data-mask-delay="0.3"></figure>');
		run(maskReveals);
		expect($("[data-mask]")).toHaveAttribute(REVEALED);
	});

	it("clears the clip-path when stopped", () => {
		html("<figure data-mask></figure>");
		const stopScene = run(maskReveals);
		stopScene();
		expect($("[data-mask]").style.clipPath).toBe("");
	});
});

describe("staggerGroups", () => {
	it("settles every item after the group is seen and the tween ends", () => {
		html(
			`<ul data-stagger="pop"><li data-stagger-item>1</li><li data-stagger-item>2</li></ul>`,
		);
		run(staggerGroups);
		const group = $("[data-stagger]");
		FakeIntersectionObserver.fireAll(group);
		gsap.globalTimeline.getChildren().at(-1)?.totalProgress(1);
		for (const item of document.querySelectorAll("[data-stagger-item]")) {
			expect(item).toHaveAttribute(REVEALED);
		}
	});

	it("waits for the enclosing mask frame when there is one", () => {
		html(
			`<div data-mask><div data-stagger><i data-stagger-item></i></div></div>`,
		);
		run(staggerGroups);
		const frame = $("[data-mask]");
		const watched = FakeIntersectionObserver.instances.some((io) =>
			io.targets.has(frame),
		);
		expect(watched).toBe(true);
	});

	it("ignores a group with no items", () => {
		html("<div data-stagger></div>");
		run(staggerGroups);
		expect(FakeIntersectionObserver.instances.at(-1)?.targets.size ?? 0).toBe(
			0,
		);
	});

	it("leaves the items visible when stopped", () => {
		html(`<ul data-stagger><li data-stagger-item>1</li></ul>`);
		const stopScene = run(staggerGroups);
		stopScene();
		expect($("[data-stagger-item]")).toHaveAttribute(REVEALED);
	});
});

describe("parallax", () => {
	it("scrubs each [data-parallax] element, using its amplitude", () => {
		html('<div data-parallax="10"></div><div data-parallax></div>');
		run(setupParallax);
		expect(ScrollTrigger.getAll()).toHaveLength(2);
	});

	it("drifts card images inside their frame", () => {
		html('<figure><img data-parallax-img alt="" src="x.png" /></figure>');
		run(cardImageParallax);
		expect(ScrollTrigger.getAll()).toHaveLength(1);
		expect(ScrollTrigger.getAll()[0].trigger).toBe($("figure"));
	});

	it("cleans up its triggers", () => {
		html("<div data-parallax></div>");
		const stopScene = run(setupParallax);
		stopScene();
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});
});

describe("marquees", () => {
	const marquee = `<div data-marquee><div data-marquee-track><span>a</span><span>a</span></div></div>`;

	it("creates a trigger that starts and stops the loop with visibility", () => {
		html(marquee);
		run(marquees);
		expect(ScrollTrigger.getAll()).toHaveLength(1);
		expect($("[data-marquee-track]").style.animation).toBe("none");
	});

	it("needs a track", () => {
		html("<div data-marquee></div>");
		run(marquees);
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});

	it("pauses on hover and focus without throwing", () => {
		html(marquee);
		run(marquees);
		const root = $("[data-marquee]");
		for (const type of [
			"pointerenter",
			"focusin",
			"pointerleave",
			"focusout",
		]) {
			expect(() => root.dispatchEvent(new Event(type))).not.toThrow();
		}
	});

	it("gives the track back its own animation when stopped", () => {
		html(marquee);
		const stopScene = run(marquees);
		stopScene();
		expect($("[data-marquee-track]").style.animation).toBe("");
	});
});

describe("scrollProgress", () => {
	it("does nothing without the hairline", () => {
		html("<main></main>");
		run(scrollProgress);
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});

	it("fills the hairline with the page scroll", () => {
		html("<div data-scroll-progress></div>");
		run(scrollProgress);
		expect(ScrollTrigger.getAll()).toHaveLength(1);
		expect(ScrollTrigger.getAll()[0].vars.end).toBe("max");
	});
});

describe("galaxyScene", () => {
	it("scrubs the story over the WHOLE page with a single trigger (no pin)", () => {
		run(galaxyScene);
		const triggers = ScrollTrigger.getAll();
		expect(triggers).toHaveLength(1);
		expect(triggers[0].vars.start).toBe(0);
		expect(typeof triggers[0].vars.end).toBe("function");
		expect(triggers[0].vars.pin).toBeUndefined();
	});

	it("with an epilogue it scrubs the story and the closing, each phrase after its scene", () => {
		html(
			`<section data-epilogue>${[1, 2, 3, 4, 5, 6].map(() => "<p data-epilogue-line></p>").join("")}</section>`,
		);
		run(galaxyScene);
		// the walk to the epilogue, the story + closing timeline and the phrases
		expect(ScrollTrigger.getAll()).toHaveLength(3);
		const lines = Array.from(
			document.querySelectorAll<HTMLElement>("[data-epilogue-line]"),
		);
		const tl = gsap.globalTimeline
			.getChildren(false, false, true)
			.filter(
				(t) => (t as gsap.core.Timeline).getChildren?.().length > 2,
			) as gsap.core.Timeline[];
		const phrases = tl.find((t) =>
			t
				.getChildren(false)
				.some((c) => (c as gsap.core.Tween).targets?.()[0] === lines[0]),
		);
		expect(phrases).toBeDefined();
		const startOf = (el: HTMLElement) =>
			(phrases as gsap.core.Timeline)
				.getChildren(false)
				.filter((c) => (c as gsap.core.Tween).targets?.()[0] === el)
				.map(
					(c) => c.startTime() / (phrases as gsap.core.Timeline).duration(),
				)[0];
		const starts = lines.map(startOf);
		// in order, and the merge (over by .20) is finished before its phrase comes in
		expect(starts[0]).toBeGreaterThan(0.2);
		for (let i = 1; i < starts.length; i++)
			expect(starts[i]).toBeGreaterThan(starts[i - 1] + 0.05);
		// the black hole alone waits for the stars to be gone (.43); falling in comes after
		// it has swelled (.60) and the white hole's phrase after the tunnel begins (.76)
		expect(starts[3]).toBeGreaterThan(0.43);
		expect(starts[4]).toBeGreaterThan(0.6);
		expect(starts[5]).toBeGreaterThan(0.76);
		galaxyState.hole = 1;
	});

	it("leaves the galaxy at its healthy peak when stopped (reduced motion)", () => {
		const stopScene = run(galaxyScene);
		galaxyState.story = 0;
		stopScene();
		expect(galaxyState.story).toBe(0.72);
		expect(galaxyState.hole).toBe(0);
		galaxyState.story = 0;
	});
});

describe("dialogs", () => {
	it("animates the panel and its items when React mounts the dialog", async () => {
		html("<main></main>");
		run(dialogs);
		const panel = document.createElement("div");
		panel.setAttribute("data-dialog", "");
		panel.innerHTML = "<p data-dialog-item>a</p><p data-dialog-item>b</p>";
		$("main").append(panel);
		await flush();
		const tl = timelines().at(-1);
		expect(tl).toBeDefined();
		tl?.totalProgress(1);
		expect(panel.style.transform).toBe("");
		expect(panel.style.opacity).toBe("");
	});

	it("pops the launcher in and settles it", () => {
		html("<button data-fab>?</button>");
		run(dialogs);
		const fab = $("[data-fab]");
		gsap.globalTimeline.getChildren().at(-1)?.totalProgress(1);
		expect(fab).toHaveAttribute(REVEALED);
	});

	it("shows the launcher right away if the engine stops first", () => {
		html("<button data-fab>?</button>");
		const stopScene = run(dialogs);
		stopScene();
		expect($("[data-fab]")).toHaveAttribute(REVEALED);
	});
});

describe("projectDetail", () => {
	const detail = `
		<main data-detail>
			<a data-detail-back>Volver</a>
			<p data-detail-meta>Web</p>
			<h1 data-detail-title>Nombre del proyecto</h1>
			<figure data-detail-figure></figure>
		</main>`;

	it("does nothing outside the detail page", () => {
		html("<main></main>");
		run(projectDetail);
		expect(timelines()).toHaveLength(0);
	});

	it("plays the intro and settles the header parts", () => {
		html(detail);
		run(projectDetail);
		for (const sel of [
			"[data-detail-back]",
			"[data-detail-meta]",
			"[data-detail-title]",
			"[data-detail-figure]",
		]) {
			expect($(sel)).toHaveAttribute(REVEALED);
		}
		timelines()[0].totalProgress(1);
		expect($("[data-detail-title]").textContent).toBe("Nombre del proyecto");
		expect($("[data-detail-figure]").style.clipPath).toBe("");
	});

	it("adds scroll-linked depth to the figure only: the pictures never zoom or drift", () => {
		html(detail);
		run(projectDetail);
		expect(ScrollTrigger.getAll()).toHaveLength(1);
	});
});

describe("stackScenes", () => {
	const stack = `<div data-stack><div data-stack-card>1</div><div data-stack-card>2</div><div data-stack-card>3</div></div>`;

	it("scrubs every card except the last one (the next card covers it)", () => {
		html(stack);
		run(stackScenes);
		expect(ScrollTrigger.getAll()).toHaveLength(2);
	});

	it("only runs on wide screens", () => {
		installMotionEnv("no-preference", []);
		html(stack);
		run(stackScenes);
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});
});

describe("skillFlights", () => {
	const group = `
		<ul data-fly-group>
			<li data-fly-chip><span data-fly-body>Astro</span></li>
			<li data-fly-chip><span data-fly-body>GSAP</span></li>
		</ul>`;

	it("sends chips along a path with the scroll on desktop", () => {
		html(group);
		run(skillFlights);
		expect(ScrollTrigger.getAll().length).toBeGreaterThanOrEqual(2);
		for (const chip of document.querySelectorAll("[data-fly-chip]")) {
			expect(chip).toHaveAttribute(REVEALED);
		}
	});

	it("gives phones a quiet fade-up once the group is seen", () => {
		installMotionEnv("no-preference", [MOBILE]);
		html(group);
		run(skillFlights);
		const list = $("[data-fly-group]");
		expect(ScrollTrigger.getAll()).toHaveLength(0);
		FakeIntersectionObserver.fireAll(list);
		gsap.globalTimeline.getChildren().at(-1)?.totalProgress(1);
		for (const chip of document.querySelectorAll("[data-fly-chip]")) {
			expect(chip).toHaveAttribute(REVEALED);
		}
	});

	it("ignores a group without chips", () => {
		html("<ul data-fly-group></ul>");
		run(skillFlights);
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});

	it("leaves the chips visible when stopped", () => {
		html(group);
		const stopScene = run(skillFlights);
		stopScene();
		for (const chip of document.querySelectorAll("[data-fly-chip]")) {
			expect(chip).toHaveAttribute(REVEALED);
		}
	});
});

describe("snakeLine", () => {
	it("needs the trace and the dot", () => {
		html(
			'<div><svg data-snake><path data-snake-trace d="M0 0L10 10" /></svg></div>',
		);
		run(snakeLine);
		expect(ScrollTrigger.getAll()).toHaveLength(0);
	});

	it("draws the trace with the scroll when everything is there", () => {
		html(
			'<div><svg data-snake><path data-snake-trace d="M0 0L10 10" /></svg><i data-snake-dot></i></div>',
		);
		// jsdom has no SVG geometry; MotionPath only needs these to exist.
		const proto = SVGElement.prototype as unknown as Record<string, unknown>;
		proto.getBBox ??= () => ({ x: 0, y: 0, width: 10, height: 10 });
		proto.getTotalLength ??= () => 10;
		proto.getPointAtLength ??= () => ({ x: 0, y: 0 });
		run(snakeLine);
		expect(console.warn).not.toHaveBeenCalledWith(
			expect.stringContaining("snake"),
			expect.anything(),
		);
	});
});
