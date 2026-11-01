import type { Cleanup, MotionTools } from "./core";

/**
 * Anchor links (#about, #projects...) on a page with pinned sections.
 *
 * Pins add scroll length and lazy islands change heights while the page
 * loads, so the position of a section is not known until layout settles. A
 * plain hash jump lands short. Here every jump:
 *   1. recomputes the pins (ScrollTrigger.refresh) before measuring,
 *   2. scrolls with GSAP (ScrollToPlugin), not the browser,
 *   3. re-measures when it arrives and corrects up to three times while the
 *      page is still growing.
 * A deliberate wheel/touch/key during the trip cancels it. The initial
 * location.hash (language switch, shared link) takes the same route once the
 * engine is up.
 */
const MAX_FIXES = 3;

export const anchorScroll = ({ gsap, ScrollTrigger }: MotionTools): Cleanup => {
	const html = document.documentElement;
	let current: gsap.core.Tween | undefined;

	const offsetOf = (el: Element) =>
		Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
	const yOf = (el: Element) =>
		Math.max(0, el.getBoundingClientRect().top + window.scrollY - offsetOf(el));

	const stop = () => {
		current?.kill();
		current = undefined;
		html.style.scrollBehavior = "";
	};

	const goTo = (hash: string, fixes = 0, instant = false) => {
		let target: Element | null = null;
		try {
			target = document.querySelector(hash);
		} catch {
			return;
		}
		if (!target) return;

		if (fixes === 0) ScrollTrigger.refresh();
		const y = yOf(target);
		stop();
		// The page's CSS smooth scrolling would fight the tween frame by frame.
		html.style.scrollBehavior = "auto";
		const distance = Math.abs(y - window.scrollY);
		current = gsap.to(window, {
			scrollTo: { y, autoKill: true },
			duration: instant ? 0 : Math.min(1.8, 0.5 + distance / 4500),
			ease: "power3.inOut",
			onComplete: () => {
				html.style.scrollBehavior = "";
				const t = document.querySelector(hash);
				if (t && fixes < MAX_FIXES && Math.abs(yOf(t) - window.scrollY) > 6) {
					window.setTimeout(() => goTo(hash, fixes + 1, true), 350);
				}
			},
			onInterrupt: () => {
				html.style.scrollBehavior = "";
			},
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
		void document.fonts?.ready.then(() => goTo(location.hash, 0, true));
	}

	return () => {
		document.removeEventListener("click", onClick);
		for (const evt of ["wheel", "touchstart", "keydown"] as const) {
			window.removeEventListener(evt, cancel);
		}
		stop();
	};
};
