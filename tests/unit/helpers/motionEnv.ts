import { vi } from "vitest";
import {
	type Cleanup,
	MOTION_OK,
	type MotionTools,
	withMotion,
} from "@/lib/motion/core";

/**
 * Test double for IntersectionObserver that tests can fire by hand, so the
 * "when seen" entrances run deterministically instead of waiting for layout.
 */
export class FakeIntersectionObserver {
	static instances: FakeIntersectionObserver[] = [];
	readonly targets = new Set<Element>();
	constructor(
		readonly callback: IntersectionObserverCallback,
		readonly options?: IntersectionObserverInit,
	) {
		FakeIntersectionObserver.instances.push(this);
	}
	observe(el: Element) {
		this.targets.add(el);
	}
	unobserve(el: Element) {
		this.targets.delete(el);
	}
	disconnect() {
		this.targets.clear();
	}
	takeRecords() {
		return [];
	}
	/** Reports `el` as seen (or as already scrolled past, with `above`). */
	fire(el: Element, state: { intersecting?: boolean; above?: boolean } = {}) {
		const intersecting = state.intersecting ?? !state.above;
		this.callback(
			[
				{
					target: el,
					isIntersecting: intersecting,
					boundingClientRect: { bottom: state.above ? -10 : 100 },
				} as IntersectionObserverEntry,
			],
			this as unknown as IntersectionObserver,
		);
	}
	static reset() {
		FakeIntersectionObserver.instances = [];
	}
	/** Fires every observer that watches `el`. */
	static fireAll(
		el: Element,
		state?: { intersecting?: boolean; above?: boolean },
	) {
		for (const io of FakeIntersectionObserver.instances) {
			if (io.targets.has(el)) io.fire(el, state);
		}
	}
}

/** Makes `window.matchMedia` answer for the reduced-motion queries. */
export const setMotionPreference = (
	preference: "no-preference" | "reduce",
	// Other media queries that should match (viewport size checks).
	matching: string[] = [],
) => {
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches:
			query === MOTION_OK
				? preference === "no-preference"
				: matching.includes(query),
		media: query,
		onchange: null,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {},
		dispatchEvent: () => false,
	}));
	window.matchMedia = globalThis.matchMedia;
};

/** Sets up the browser stand-ins every motion scene test needs. */
export const installMotionEnv = (
	preference: "no-preference" | "reduce" = "no-preference",
	matching: string[] = [],
) => {
	FakeIntersectionObserver.reset();
	vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
	setMotionPreference(preference, matching);
	document.body.innerHTML = "";
	document.documentElement.className = "";
};

/**
 * Runs one scene through the real `withMotion` (plugins registered, motion
 * allowed) and returns a function that stops it.
 */
export const runScene = (
	scene: (tools: MotionTools) => Cleanup | undefined,
): Cleanup => withMotion(scene);

/** Lets MutationObserver callbacks and microtasks flush. */
export const flush = () => new Promise<void>((r) => setTimeout(r, 0));
