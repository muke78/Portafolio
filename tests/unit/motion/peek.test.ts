// @vitest-environment jsdom
import gsap from "gsap";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PEEK_QUERY, peekScenes } from "@/lib/motion/peek";
import { flush, installMotionEnv, runScene } from "../helpers/motionEnv";

let stop: (() => void) | undefined;
const run = () => {
	stop = runScene(peekScenes);
	return stop;
};
const $ = <T extends Element = HTMLElement>(selector: string) =>
	document.querySelector(selector) as T;

const list = (rows = 2) => `
<ul data-peek>
  ${Array.from(
		{ length: rows },
		(_, i) => `<li data-peek-row id="r${i}">
      <a href="#" id="a${i}">Proyecto ${i}</a>
      <img data-peek-img class="invisible" alt="" />
    </li>`,
	).join("")}
</ul>`;

const rect = (width = 800, height = 90): DOMRect =>
	({ left: 0, top: 0, width, height, right: width, bottom: height }) as DOMRect;

const pointer = (type: string, x: number, y: number) =>
	new MouseEvent(type, { clientX: x, clientY: y, bubbles: false });

beforeEach(() => {
	installMotionEnv("no-preference", [PEEK_QUERY]);
	document.body.innerHTML = list();
	for (const row of document.querySelectorAll<HTMLElement>("[data-peek-row]")) {
		row.getBoundingClientRect = () => rect();
	}
	for (const img of document.querySelectorAll<HTMLElement>("[data-peek-img]")) {
		Object.defineProperty(img, "offsetHeight", { value: 300 });
	}
	vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
	stop?.();
	stop = undefined;
	gsap.globalTimeline.clear();
	vi.restoreAllMocks();
});

describe("peekScenes", () => {
	it("shows the row's picture next to the cursor when the pointer enters", async () => {
		run();
		await flush();
		const img = $("#r0 [data-peek-img]");
		$("#r0").dispatchEvent(pointer("pointerenter", 200, 40));
		gsap.globalTimeline.progress(1);

		expect(gsap.getProperty(img, "opacity")).toBe(1);
		expect(img.style.visibility).toBe("inherit");
		// Cursor x + gap, centred on the cursor's y.
		expect(gsap.getProperty(img, "x")).toBe(228);
		expect(gsap.getProperty(img, "y")).toBe(-110);
		// jsdom 31 serializa el recorte en su forma corta (inset(0%)); antes salia con los cuatro lados.
		expect(img.style.clipPath).toMatch(/^inset\(0%( 0% 0% 0%)?\)$/);
	});

	it("never scales the picture (it enters whole)", async () => {
		run();
		await flush();
		$("#r0").dispatchEvent(pointer("pointerenter", 200, 40));
		gsap.globalTimeline.progress(1);
		expect(gsap.getProperty($("#r0 [data-peek-img]"), "scale")).toBe(1);
	});

	it("hides it again when the pointer leaves", async () => {
		run();
		await flush();
		const img = $("#r0 [data-peek-img]");
		$("#r0").dispatchEvent(pointer("pointerenter", 200, 40));
		gsap.globalTimeline.progress(1);
		$("#r0").dispatchEvent(pointer("pointerleave", 0, 0));
		gsap.globalTimeline.progress(1);
		expect(gsap.getProperty(img, "opacity")).toBe(0);
	});

	it("keyboard focus shows the preview too, so it is not mouse-only", async () => {
		run();
		await flush();
		const img = $("#r1 [data-peek-img]");
		const link = $("#a1");
		link.matches = ((sel: string) => sel === ":focus-visible") as never;
		link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		gsap.globalTimeline.progress(1);
		expect(gsap.getProperty(img, "opacity")).toBe(1);

		link.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
		gsap.globalTimeline.progress(1);
		expect(gsap.getProperty(img, "opacity")).toBe(0);
	});

	it("ignores focus that came from a mouse click", async () => {
		run();
		await flush();
		const link = $("#a0");
		link.matches = (() => false) as never;
		link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		gsap.globalTimeline.progress(1);
		expect($("#r0 [data-peek-img]").getAttribute("style") ?? "").toBe("");
	});

	it("does nothing on touch (no hover): the rows keep their thumbnail", async () => {
		installMotionEnv("no-preference", []);
		document.body.innerHTML = list();
		run();
		await flush();
		const img = $("#r0 [data-peek-img]");
		$("#r0").dispatchEvent(pointer("pointerenter", 200, 40));
		gsap.globalTimeline.progress(1);
		expect(img.getAttribute("style") ?? "").toBe("");
	});

	it("leaves no inline styles behind on stop", async () => {
		const stopAll = run();
		await flush();
		const img = $("#r0 [data-peek-img]");
		$("#r0").dispatchEvent(pointer("pointerenter", 200, 40));
		stopAll();
		stop = undefined;
		expect(img.getAttribute("style") ?? "").toBe("");
	});
});
