import { type Cleanup, type MotionTools, safeRefresh } from "./core";

/**
 * Anchor links (#about, #projects...) on a page with pinned sections.
 *
 * Pins add scroll length and lazy islands change heights while the page
 * loads, so the position of a section is not known until layout settles. A
 * plain hash jump lands short. Here every jump:
 *   1. recomputes the pins (ScrollTrigger.refresh) before measuring,
 *   2. scrolls with GSAP (ScrollToPlugin), not the browser,
 *   3. keeps re-measuring after it arrives (every 250 ms, up to 8 s) and
 *      corrects while the page is still growing; it stops early once the
 *      position held for 2 s with the page height unchanged.
 * A deliberate wheel/touch/key during the trip cancels it. The initial
 * location.hash (language switch, shared link) takes the same route once the
 * engine is up.
 */
const WATCH_MS = 8000;
const CHECK_MS = 250;
const HOLD_CHECKS = 8;

export const anchorScroll = ({ gsap, ScrollTrigger }: MotionTools): Cleanup => {
	let current: gsap.core.Tween | undefined;
	let watcher: number | undefined;

	const offsetOf = (el: Element) =>
		Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
	const yOf = (el: Element) =>
		Math.max(0, el.getBoundingClientRect().top + window.scrollY - offsetOf(el));

	const stop = () => {
		current?.kill();
		current = undefined;
		window.clearTimeout(watcher);
	};

	const watchArrival = (hash: string, since: number) => {
		let held = 0;
		let height = document.documentElement.scrollHeight;
		const check = () => {
			const t = document.querySelector(hash);
			if (!t || performance.now() - since > WATCH_MS) return;
			const grew = document.documentElement.scrollHeight !== height;
			height = document.documentElement.scrollHeight;
			if (Math.abs(yOf(t) - window.scrollY) > 6) {
				goTo(hash, since, true, true);
				return;
			}
			held = grew ? 0 : held + 1;
			if (held >= HOLD_CHECKS) return;
			watcher = window.setTimeout(check, CHECK_MS);
		};
		watcher = window.setTimeout(check, CHECK_MS);
	};

	const goTo = (
		hash: string,
		since = performance.now(),
		instant = false,
		correction = false,
	) => {
		let target: Element | null = null;
		try {
			target = document.querySelector(hash);
		} catch {
			return;
		}
		if (!target) return;

		if (!correction) safeRefresh(ScrollTrigger);
		const y = yOf(target);
		stop();
		const distance = Math.abs(y - window.scrollY);
		current = gsap.to(window, {
			// No autoKill: a deliberate wheel/touch/key already cancels (see below);
			// the plugin's own check mistakes layout-driven scroll for a user scroll.
			// (html has no CSS smooth scrolling while the engine runs: app.css.)
			scrollTo: { y, autoKill: false },
			duration: instant ? 0 : Math.min(1.8, 0.5 + distance / 4500),
			ease: "power3.inOut",
			onComplete: () => watchArrival(hash, since),
		});
	};

	const onClick = (e: MouseEvent) => {
		if (e.defaultPrevented || e.button !== 0) return;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		const link = (e.target as Element | null)?.closest<HTMLAnchorElement>(
			"a[href*='#']",
		);
		if (!link || link.target === "_blank") return;
		let url: URL;
		try {
			url = new URL(link.href, location.href);
		} catch {
			return;
		}
		if (url.pathname !== location.pathname || !url.hash) return;
		if (!document.querySelector(url.hash)) return;
		e.preventDefault();
		history.pushState(null, "", url.hash);
		goTo(url.hash);
	};
	document.addEventListener("click", onClick);

	// A deliberate scroll gesture wins over the trip.
	const cancel = () => stop();
	for (const evt of ["wheel", "touchstart", "keydown"] as const) {
		window.addEventListener(evt, cancel, { passive: true });
	}

	// Page opened (or language switched) with a hash: wait for fonts, then go.
	if (location.hash) {
		void document.fonts?.ready.then(() =>
			goTo(location.hash, performance.now(), true),
		);
	}

	return () => {
		document.removeEventListener("click", onClick);
		for (const evt of ["wheel", "touchstart", "keydown"] as const) {
			window.removeEventListener(evt, cancel);
		}
		stop();
	};
};
