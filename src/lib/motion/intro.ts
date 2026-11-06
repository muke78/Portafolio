import { galaxyState } from "@/lib/galaxyState";
import { markIntroSeen } from "@/lib/introPrefs";
import { type Cleanup, MOTION, type MotionTools, safeRefresh } from "./core";
import { createSnowglobe } from "./snowglobe";

/**
 * Event the intro fires when the gate opens. The hero listens to it (hero.ts) to play
 * its entrance: `detail.bang` is true when the portfolio is blown out of the centre by
 * the Big Bang, false when the introduction was skipped.
 */
export const INTRO_OPEN_EVENT = "intro:open";

const GATE = "intro-on";

/**
 * Introduction - the origin of the universe. While <html> has `intro-on` (set before the
 * first paint by INTRO_GATE_SCRIPT) a fixed gate covers the page (IntroGate.astro): a
 * single purple particle in the dark.
 *
 *  1. It beats like a heart (lub-dub). The pointer perturbs it: it leans toward the
 *     cursor on an elastic spring (one quickTo pair, never a tween per event), beats
 *     faster the closer the cursor gets and sends out a ripple. Without a mouse it
 *     drifts on its own.
 *  2. A story appears line by line, ending in the invitation to click it.
 *  3. Click: the particle draws in its breath, a shock wave and a flash cover the
 *     screen, and everything explodes - the starfield (galaxyState.bang) and the cosmos
 *     layer fly out of the centre and the portfolio itself is thrown out of it (the
 *     hero listens to INTRO_OPEN_EVENT). Then the gate is removed.
 *
 * Skip (button or Escape) opens the gate at once with no explosion. Everything behind
 * the gate is `inert` while it is up, the page does not scroll, and the page is still in
 * the DOM underneath (crawlers, Lighthouse and screen readers without the gate see it).
 */
export const introGate = ({ gsap, ScrollTrigger }: MotionTools): Cleanup => {
	const html = document.documentElement;
	const root = document.querySelector<HTMLElement>("[data-intro]");

	const sky = root?.querySelector<HTMLElement>("[data-intro-sky]");
	const drift = root?.querySelector<HTMLElement>("[data-intro-drift]");
	const point = root?.querySelector<HTMLButtonElement>("[data-intro-point]");
	const globeEl = root?.querySelector<HTMLElement>("[data-intro-globe]");
	const flakes = root?.querySelector<HTMLCanvasElement>("[data-intro-flakes]");
	const heat = root?.querySelector<HTMLElement>("[data-intro-heat]");
	const shine = root?.querySelector<HTMLElement>("[data-intro-shine]");
	const halo = root?.querySelector<HTMLElement>("[data-intro-halo]");
	const ripple = root?.querySelector<HTMLElement>("[data-intro-ripple]");
	const wave = root?.querySelector<HTMLElement>("[data-intro-wave]");
	const flash = root?.querySelector<HTMLElement>("[data-intro-flash]");
	const skip = root?.querySelector<HTMLElement>("[data-intro-skip]");
	const lines = root
		? Array.from(root.querySelectorAll<HTMLElement>("[data-intro-line]"))
		: [];
	const cosmos = document.querySelector<HTMLElement>("[data-bang-cosmos]");

	// No gate (not the Home, skipped, returning visitor, deep link): the sky is
	// already scattered. Nothing to do.
	if (
		!root ||
		!sky ||
		!drift ||
		!point ||
		!globeEl ||
		!flakes ||
		!shine ||
		!halo ||
		!ripple ||
		!wave ||
		!flash ||
		!skip ||
		!html.classList.contains(GATE)
	) {
		galaxyState.bang = 1;
		return () => {};
	}

	galaxyState.bang = 0;
	if (cosmos) gsap.set(cosmos, { autoAlpha: 0 });
	window.scrollTo(0, 0);

	// Everything behind the gate is out of reach of the keyboard and of screen readers.
	const behind = Array.from(document.body.children).filter(
		(el) => el !== root && el.tagName !== "SCRIPT",
	);
	for (const el of behind) el.setAttribute("inert", "");
	point.focus({ preventScroll: true });

	let opened = false;
	const killables: { kill: () => unknown }[] = [];
	const track = <T extends { kill: () => unknown }>(t: T): T => {
		killables.push(t);
		return t;
	};

	/* ---------- 1. the particle: heartbeat, drift, perturbation ---------- */

	// The primordial particle: almost still, with a slow breath and a faint shimmer of
	// heat at its core. It does not beat on its own. ENERGY is what quickens it: the cursor
	// coming close, and most of all the cursor over the sphere, speed up the breath, heat
	// the core, brighten the glow and stir the flakes (snowglobe.ts). Every frame, one
	// ticker callback with quickSetters: no tween per event.
	const globe = createSnowglobe(flakes, gsap.ticker);
	const energy = { target: 0, value: 0 };
	let phase = 0;
	const setScale = gsap.quickSetter(globeEl, "scale") as (v: number) => void;
	const setGlow = gsap.quickSetter(halo, "opacity") as (v: number) => void;
	const setGlowSize = gsap.quickSetter(halo, "scale") as (v: number) => void;
	const setHeat = heat
		? (gsap.quickSetter(heat, "opacity") as (v: number) => void)
		: () => {};
	const breathe = (_time: number, deltaTime: number) => {
		const dt = Math.min(deltaTime / 1000, 0.05);
		energy.value += (energy.target - energy.value) * (1 - Math.exp(-3.5 * dt));
		const e = energy.value;
		// 0.2 Hz at rest (one breath every five seconds) up to about 2.8 Hz excited.
		phase += dt * Math.PI * 2 * (0.2 + 2.6 * e);
		const wave = Math.sin(phase);
		setScale(1 + (0.016 + 0.05 * e) * wave + 0.05 * e);
		setGlow(0.24 + 0.04 * wave + 0.5 * e * (0.65 + 0.35 * wave));
		setGlowSize(1 + 0.6 * e + 0.05 * wave);
		setHeat(0.16 + 0.1 * wave + 0.74 * e);
		globe.hold(e * 0.95);
	};
	gsap.ticker.add(breathe);
	killables.push({ kill: () => gsap.ticker.remove(breathe) });

	// On its own it floats a little (two slow, unequal sines: no visible loop).
	track(
		gsap.to(drift, {
			x: 7,
			duration: 3.1,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		}),
	);
	track(
		gsap.to(drift, {
			y: -6,
			duration: 4.3,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		}),
	);

	const spring = { duration: 1.2, ease: "elastic.out(1, 0.35)" } as const;
	const leanX = gsap.quickTo(point, "x", spring);
	const leanY = gsap.quickTo(point, "y", spring);
	// The highlight on the glass slides a little against the lean: it reads as a surface.
	const shineX = gsap.quickTo(shine, "x", spring);
	const shineY = gsap.quickTo(shine, "y", spring);

	let center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	const measure = () => {
		const r = drift.getBoundingClientRect();
		center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	};
	measure();
	const ro = new ResizeObserver(measure);
	ro.observe(root);

	// Over the sphere itself it reads as something you can press: full energy (and the
	// pointer cursor, from the markup).
	let hovering = false;
	point.addEventListener("pointerenter", () => {
		hovering = true;
		energy.target = 1;
	});
	point.addEventListener("pointerleave", () => {
		hovering = false;
		energy.target = 0;
	});

	let near = false;
	let lastRipple = 0;
	const calm = track(
		gsap.delayedCall(1.8, () => {
			leanX(0);
			leanY(0);
			shineX(0);
			shineY(0);
			energy.target = hovering ? 1 : 0;
			near = false;
		}),
	);
	calm.pause();

	const onMove = (e: PointerEvent) => {
		const dx = e.clientX - center.x;
		const dy = e.clientY - center.y;
		const dist = Math.hypot(dx, dy) || 1;
		const reach = Math.min(window.innerWidth, window.innerHeight) * 0.6;
		const pull = gsap.utils.clamp(0, 1, 1 - dist / reach);
		// It leans toward the cursor, more the closer it is (never past 56 px).
		const lean =
			Math.min(dist * 0.18, MOTION.intro.lean) * (0.35 + 0.65 * pull);
		leanX((dx / dist) * lean);
		leanY((dy / dist) * lean);
		shineX((-dx / dist) * lean * 0.12);
		shineY((-dy / dist) * lean * 0.12);
		// The closer the cursor, the more energy (over the sphere: all of it); a fast
		// cursor also shakes the flakes.
		energy.target = hovering ? 1 : pull * 0.85;
		globe.kick(Math.min(Math.hypot(e.movementX, e.movementY) / 60, 1) * pull);

		// A ripple each time the cursor comes close (not while it stays there).
		const isNear = pull > 0.55;
		const now = performance.now();
		if (isNear && !near && now - lastRipple > 700) {
			lastRipple = now;
			gsap.fromTo(
				ripple,
				{ scale: 1, opacity: 0.6 },
				{ scale: 9, opacity: 0, duration: 1.3, ease: "power2.out" },
			);
		}
		near = isNear;
		calm.restart(true);
	};
	window.addEventListener("pointermove", onMove, { passive: true });

	/* ---------- 2. the story ---------- */

	const [first, second, third] = lines;
	// Two lines, each on screen long enough to read, then a pause with NOTHING on screen,
	// then the invitation ("¿Comenzamos?") at MOTION.intro.invite seconds.
	const { invite, first: t1, firstOut, second: t2, secondOut } = MOTION.intro;
	const story = track(gsap.timeline());
	story
		.fromTo(
			first,
			{ autoAlpha: 0, y: 14 },
			{ autoAlpha: 1, y: 0, duration: 0.8 },
			t1,
		)
		.to(first, { autoAlpha: 0, y: -10, duration: 0.5 }, firstOut)
		.fromTo(
			second,
			{ autoAlpha: 0, y: 14 },
			{ autoAlpha: 1, y: 0, duration: 0.8 },
			t2,
		)
		.to(second, { autoAlpha: 0, y: -10, duration: 0.5 }, secondOut)
		.fromTo(
			third,
			{ autoAlpha: 0, y: 14 },
			{ autoAlpha: 1, y: 0, duration: 1 },
			invite,
		);

	/* ---------- 3. opening the gate ---------- */

	const finish = () => {
		markIntroSeen();
		globe.destroy();
		galaxyState.bang = 1;
		if (cosmos) gsap.set(cosmos, { clearProps: "all" });
		html.classList.remove(GATE);
		for (const el of behind) el.removeAttribute("inert");
		root.remove();
		const main = document.getElementById("main-content");
		if (main) {
			main.setAttribute("tabindex", "-1");
			main.focus({ preventScroll: true });
		}
		safeRefresh(ScrollTrigger);
	};

	const stopListening = () => {
		window.removeEventListener("pointermove", onMove);
		document.removeEventListener("keydown", onKey);
		ro.disconnect();
		for (const t of killables.splice(0)) t.kill();
	};

	const announce = (bang: boolean) =>
		window.dispatchEvent(
			new CustomEvent(INTRO_OPEN_EVENT, { detail: { bang } }),
		);

	// The nav links are thrown out of the centre too (skipped while React hydrates them).
	const burstNav = () => {
		const items = Array.from(
			document.querySelectorAll<HTMLElement>("[data-nav] a, [data-nav] button"),
		).filter((el) => !el.closest("astro-island[ssr]"));
		if (items.length === 0) return;
		const vx = window.innerWidth / 2;
		const vy = window.innerHeight / 2;
		gsap.fromTo(
			items,
			{
				x: (_i: number, el: HTMLElement) => {
					const r = el.getBoundingClientRect();
					return vx - (r.left + r.width / 2);
				},
				y: (_i: number, el: HTMLElement) => {
					const r = el.getBoundingClientRect();
					return vy - (r.top + r.height / 2);
				},
				scale: 0,
				rotation: () => gsap.utils.random(-120, 120),
				autoAlpha: 0,
			},
			{
				x: 0,
				y: 0,
				scale: 1,
				rotation: 0,
				autoAlpha: 1,
				duration: 1.5,
				ease: "power4.out",
				stagger: { amount: 0.4, from: "center" },
				clearProps: "all",
			},
		);
	};

	const open = (mode: "bang" | "skip") => {
		if (opened) return;
		opened = true;
		stopListening();

		if (mode === "skip") {
			announce(false);
			finish();
			return;
		}

		const cover =
			(2 * Math.hypot(window.innerWidth, window.innerHeight)) / 16 + 8;
		// The flakes are drawn into the centre while the sphere draws in its breath.
		globe.setMode("collapse");
		const tl = gsap.timeline({ onComplete: finish });
		killables.push(tl);
		tl.to(lines, { autoAlpha: 0, duration: 0.3 }, 0)
			.to(skip, { autoAlpha: 0, duration: 0.3 }, 0)
			// It draws in its breath...
			.to(
				point,
				{ scale: 0.3, x: 0, y: 0, duration: 0.5, ease: "power3.in" },
				0,
			)
			.to(halo, { opacity: 1, scale: 2.4, duration: 0.5, ease: "power2.in" }, 0)
			// ...and the shock wave expands until it covers the screen.
			.set(wave, { autoAlpha: 1 }, 0.5)
			.to(
				wave,
				{ scale: cover, duration: MOTION.intro.wave, ease: "power4.in" },
				0.5,
			)
			.to(flash, { autoAlpha: 0.8, duration: 0.12, ease: "none" }, 1.0)
			.add(() => {
				// Behind the flash: the void goes away and the universe is thrown out.
				gsap.set([sky, point, halo, drift, ripple], { autoAlpha: 0 });
				gsap.fromTo(
					galaxyState,
					{ bang: 0 },
					{ bang: 1, duration: MOTION.intro.bang, ease: "none" },
				);
				if (cosmos) {
					gsap.fromTo(
						cosmos,
						{ scale: 0.25, autoAlpha: 0, transformOrigin: "50% 50%" },
						{
							scale: 1,
							autoAlpha: 1,
							duration: 2.6,
							ease: "expo.out",
							clearProps: "all",
						},
					);
				}
				announce(true);
				burstNav();
			}, 1.05)
			.to(flash, { autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 1.12)
			.to(wave, { autoAlpha: 0, duration: 1, ease: "power2.out" }, 1.12);
	};

	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") open("skip");
	};
	document.addEventListener("keydown", onKey);
	point.addEventListener("click", () => open("bang"));
	skip.addEventListener("click", () => open("skip"));

	return () => {
		// The engine stopped (reduced motion was switched on) or the page is leaving.
		if (!opened) {
			opened = true;
			stopListening();
			announce(false);
			finish();
		}
	};
};
