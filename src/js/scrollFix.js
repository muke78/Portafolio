/**
 * Anchor-scroll stabilizer.
 *
 * Sections already carry `scroll-mt-[88px]` so a hash jump lands below
 * the fixed nav correctly - that part works. The actual bug: the jump
 * itself (native hash navigation, or a click on a `#section` link)
 * fires immediately, using whatever the page's layout is at that exact
 * instant. Below/around the target, lazy images, client:visible React
 * islands (Opinions, Contacto, etc.) and the three.js canvas are all
 * still loading and resizing the page. Once they settle, the target
 * has moved - usually further down - and the viewport is left short of
 * it. Two situations trigger this in practice: clicking a nav link
 * while the page is still loading, and switching language (a full
 * page reload to a URL that keeps the current #hash), where the
 * browser's initial hash-scroll fires before everything is loaded.
 *
 * Fix: after a jump (native or click-triggered), keep re-snapping to
 * the target via scrollIntoView() while the document's height is still
 * changing, for a bounded window - then stop. scrollIntoView() honors
 * both scroll-margin-top and the global `scroll-smooth` on <html>, so
 * corrections land in the same place a normal jump would and animate
 * the same way.
 */
(function () {
	const SETTLE_WINDOW_MS = 4000;

	function stabilizeScrollTo(hash) {
		let target;
		try {
			target = document.querySelector(hash);
		} catch {
			return;
		}
		if (!target) return;

		const resnap = () => target.scrollIntoView({ block: "start" });
		resnap();

		if (!("ResizeObserver" in window)) return;

		// If the user scrolls/swipes/keys away on their own during the
		// settle window, that's a deliberate override - stop correcting
		// instead of yanking them back on the next layout shift.
		let interrupted = false;
		const onUserScroll = () => {
			interrupted = true;
		};
		const interruptEvents = ["wheel", "touchstart", "keydown"];
		for (const evt of interruptEvents) {
			window.addEventListener(evt, onUserScroll, { passive: true });
		}

		const ro = new ResizeObserver(() => {
			if (!interrupted && location.hash === hash) resnap();
		});
		ro.observe(document.body);

		window.setTimeout(() => {
			ro.disconnect();
			for (const evt of interruptEvents) {
				window.removeEventListener(evt, onUserScroll);
			}
		}, SETTLE_WINDOW_MS);
	}

	function onNavClick(e) {
		const link = e.target.closest?.("a[href*='#']");
		if (!link) return;

		let url;
		try {
			url = new URL(link.href, location.href);
		} catch {
			return;
		}
		if (url.pathname !== location.pathname || !url.hash) return;

		// Let the native/CSS smooth-scroll jump happen first, then start
		// correcting once the browser has acted on it.
		requestAnimationFrame(() => stabilizeScrollTo(url.hash));
	}

	if (location.hash) stabilizeScrollTo(location.hash);
	document.addEventListener("click", onNavClick);
})();
