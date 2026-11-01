import {
	byVisualOrder,
	type Cleanup,
	MOTION,
	type MotionTools,
	REVEALED,
	settle,
	UNHYDRATED,
} from "./core";

/**
 * Scroll reveals: every [data-reveal] fades up once when it enters the
 * viewport; elements entering together stagger as a batch (rows of cards
 * cascade in reading order).
 *
 * Elements appear after load too (islands hydrating, tab switches, data
 * arriving), so the DOM is watched. Anything inside an Astro island that
 * has not hydrated yet is held back (GSAP's inline styles would read as a
 * hydration mismatch to React) and revealed after hydration, or after a
 * grace period if the island never gets there: content must never stay
 * invisible.
 */
const HYDRATION_GRACE_MS = 2500;
const SELECTOR = "[data-reveal]";

export const observeReveals = ({ gsap }: MotionTools): Cleanup => {
	const tracked = new WeakSet<Element>();
	const pending = new Set<Element>();
	const waiting = new Set<HTMLElement>();
	const timers = new Set<number>();

	const run = (els: HTMLElement[]) => {
		els.sort((a, b) =>
			byVisualOrder(a.getBoundingClientRect(), b.getBoundingClientRect()),
		);
		gsap.fromTo(
			els,
			{ autoAlpha: 0, y: MOTION.reveal.distance },
			{
				autoAlpha: 1,
				y: 0,
				duration: MOTION.reveal.duration,
				ease: MOTION.ease,
				stagger: MOTION.reveal.stagger,
				onComplete: () => {
					for (const el of els) settle(el);
				},
			},
		);
	};

	const flush = () => {
		const ready = [...waiting].filter((el) => !el.closest(UNHYDRATED));
		for (const el of ready) waiting.delete(el);
		if (ready.length) run(ready);
	};

	const io = new IntersectionObserver(
		(entries) => {
			const hits = entries
				.filter((e) => e.isIntersecting)
				.map((e) => e.target as HTMLElement);
			if (!hits.length) return;
			for (const el of hits) {
				io.unobserve(el);
				pending.delete(el);
			}
			const ready = hits.filter((el) => !el.closest(UNHYDRATED));
			if (ready.length) run(ready);
			for (const el of hits) {
				if (ready.includes(el)) continue;
				waiting.add(el);
				const t = window.setTimeout(() => {
					timers.delete(t);
					if (waiting.delete(el)) run([el]);
				}, HYDRATION_GRACE_MS);
				timers.add(t);
			}
		},
		{ rootMargin: MOTION.reveal.rootMargin },
	);

	const add = (el: Element) => {
		if (
			tracked.has(el) ||
			el.hasAttribute(REVEALED) ||
			el.closest("[data-hero]")
		) {
			return;
		}
		tracked.add(el);
		pending.add(el);
		io.observe(el);
	};

	const scan = (root: ParentNode) => {
		if (root instanceof Element && root.matches(SELECTOR)) add(root);
		for (const el of root.querySelectorAll(SELECTOR)) add(el);
	};

	const mo = new MutationObserver((mutations) => {
		let hydrated = false;
		for (const m of mutations) {
			if (m.type === "attributes") {
				hydrated = true;
				continue;
			}
			for (const node of m.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) scan(node as Element);
			}
		}
		if (hydrated) flush();
	});
	mo.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["ssr"],
	});
	scan(document);

	return () => {
		io.disconnect();
		mo.disconnect();
		for (const t of timers) window.clearTimeout(t);
		timers.clear();
		// Never leave anything hidden if the engine stops (reduced motion on).
		for (const el of pending) settle(el);
		for (const el of waiting) settle(el);
		pending.clear();
		waiting.clear();
	};
};
