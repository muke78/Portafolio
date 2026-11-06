import { galaxyState } from "@/lib/galaxyState";
import { markIntroSeen } from "@/lib/introPrefs";
import { createBigBang, heatUp } from "./bigbang";
import { type Cleanup, MOTION, type MotionTools, safeRefresh } from "./core";
import { corruptLabel } from "./corrupt";
import { createSnowglobe, smooth } from "./snowglobe";

/**
 * Event the intro fires when the gate opens. The hero listens to it (hero.ts) to play
 * its entrance: `detail.bang` is true when the portfolio is blown out of the centre by
 * the Big Bang, false when the introduction was skipped.
 */
export const INTRO_OPEN_EVENT = "intro:open";

const ORBITS = 3;
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
 *  3. Click: the particle does not blow up at once. It circles a few times in a slow
 *     ellipse that returns to where it started, shrinking, and the explosion happens right
 *     there (bigbang.ts: white-hot core, rays of radiation, red haze, fragments). The page
 *     is simply THERE in that instant (no spinning in from the centre): the starfield
 *     (galaxyState.bang) flies out and everything is hot - red and yellow - for about 7
 *     seconds, then cools to violet (heatUp). The hero listens to INTRO_OPEN_EVENT.
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
	const flakes = root?.querySelector<HTMLCanvasElement>("[data-intro-flakes]");
	const halo = root?.querySelector<HTMLElement>("[data-intro-halo]");
	const ripple = root?.querySelector<HTMLElement>("[data-intro-ripple]");
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
		!flakes ||
		!halo ||
		!ripple ||
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
	// The gate is NOT a child of <body> (the Layout wraps the page in a div), so walk up from
	// it and mark the siblings at every level: marking a wrapper that CONTAINS the gate
	// would make the gate itself inert and no real mouse or finger could reach it.
	const behind: Element[] = [];
	for (let node: Element = root; node !== document.body; ) {
		const parent: Element | null = node.parentElement;
		if (!parent) break;
		for (const sibling of Array.from(parent.children)) {
			if (
				sibling !== node &&
				sibling.tagName !== "SCRIPT" &&
				sibling.tagName !== "STYLE"
			) {
				behind.push(sibling);
			}
		}
		node = parent;
	}
	for (const el of behind) el.setAttribute("inert", "");
	point.focus({ preventScroll: true });

	let opened = false;
	const killables: { kill: () => unknown }[] = [];
	const track = <T extends { kill: () => unknown }>(t: T): T => {
		killables.push(t);
		return t;
	};

	/* ---------- 1. the particle: heartbeat, drift, perturbation ---------- */

	// The primordial particle (snowglobe.ts draws it all on one canvas): a hot, dense
	// plasma in a glass sphere. A cursor NEAR it only lifts the temperature a little (it
	// stays calm); the cursor ON it takes it through the states (liquid edge, shivers, a
	// bubble blown on one side, heat from violet to red). Here: a smoothed "energy" and a
	// slow breath, written every frame by ONE ticker callback (no tween per event).
	const globe = createSnowglobe(flakes, gsap.ticker);
	const energy = { target: 0, value: 0 };
	let phase = 0;
	let lastRim = "";
	const setGlow = gsap.quickSetter(halo, "opacity") as (v: number) => void;
	const setGlowSize = gsap.quickSetter(halo, "scale") as (v: number) => void;
	const breathe = (_time: number, deltaTime: number) => {
		const dt = Math.min(deltaTime / 1000, 0.05);
		energy.value += (energy.target - energy.value) * (1 - Math.exp(-3.5 * dt));
		const e = energy.value;
		// One slow breath every five seconds; the cursor quickens it, never to a flutter.
		phase += dt * Math.PI * 2 * (0.2 + 0.9 * e);
		const pulse = Math.sin(phase);
		globe.setBreath(1 + (0.014 + 0.02 * e) * pulse);
		globe.setEnergy(e);
		setGlow(0.22 + 0.04 * pulse + 0.4 * e);
		setGlowSize(1 + 0.5 * e);
		// The glow behind the sphere follows its colour as it heats up.
		const rim = globe.rim();
		if (rim && rim !== lastRim) {
			lastRim = rim;
			halo.style.backgroundColor = rim;
			ripple.style.borderColor = rim;
		}
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
		globe.setHover(true);
	});
	point.addEventListener("pointerleave", () => {
		hovering = false;
		energy.target = 0;
		globe.setHover(false);
	});

	let near = false;
	let lastRipple = 0;
	const calm = track(
		gsap.delayedCall(1.8, () => {
			leanX(0);
			leanY(0);
			globe.setLean(0, 0);
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
		globe.setLean(dx / dist, dy / dist);
		// The closer the cursor, the more energy (over the sphere: all of it); a fast
		// cursor also shakes the flakes.
		energy.target = hovering ? 1 : pull * 0.6;
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

	/* ---------- the skip button: it floats and, when touched, corrupts ---------- */
	killables.push({ kill: corruptLabel(gsap, skip) });

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

	// The page behind the gate comes back: it does so in the instant of the blast.
	const reveal = () => {
		markIntroSeen();
		galaxyState.bang = 1;
		html.classList.remove(GATE);
		for (const el of behind) el.removeAttribute("inert");
		const main = document.getElementById("main-content");
		if (main) {
			main.setAttribute("tabindex", "-1");
			main.focus({ preventScroll: true });
		}
		safeRefresh(ScrollTrigger);
	};

	// What is left of the gate once everything has been shown.
	const cleanup = () => {
		globe.destroy();
		if (cosmos) gsap.set(cosmos, { clearProps: "all" });
		root.remove();
	};

	const finish = () => {
		reveal();
		cleanup();
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

	// Effects that outlive the gate (the explosion, the cooling): stopped if the engine is.
	const effects: Cleanup[] = [];

	const open = (mode: "bang" | "skip") => {
		if (opened) return;
		opened = true;
		stopListening();

		if (mode === "skip") {
			announce(false);
			finish();
			return;
		}

		// The click: the sphere does NOT blow up at once. It circles a few times in an
		// ellipse that comes back to where it started, getting smaller and smaller, and the
		// explosion happens right there. `t` is 0..1 along the whole approach.
		const { orbit, heat, bang: stars } = MOTION.intro;
		gsap.killTweensOf(point);
		const reach = Math.min(window.innerWidth * 0.26, 300);
		const tilt = -0.35;
		const course = { t: 0 };
		const place = () => {
			const t = course.t;
			// Swing out gently, then tighten; the envelope is 0 at both ends so it leaves
			// from the centre and returns to exactly the same point.
			const swing = smooth(0, 0.14, t) * (1 - t) ** 0.7;
			const turn = Math.PI * 2 * ORBITS * t;
			const lx = reach * swing * Math.sin(turn);
			const ly = reach * 0.42 * swing * (Math.cos(turn) - 1) * 0.5;
			const x = lx * Math.cos(tilt) - ly * Math.sin(tilt);
			const y = lx * Math.sin(tilt) + ly * Math.cos(tilt);
			const scale = 1 - 0.78 * smooth(0.08, 1, t);
			gsap.set(point, { x, y, scale });
			gsap.set(halo, { x, y });
		};

		const boom = () => {
			const r = point.getBoundingClientRect();
			const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
			// Behind the flash: the void goes away and the page is simply THERE.
			gsap.set([sky, point, halo, drift, ripple], { autoAlpha: 0 });
			const cooling = heatUp(gsap, heat);
			effects.push(() => cooling.kill());
			gsap.fromTo(
				galaxyState,
				{ bang: 0 },
				{ bang: 1, duration: stars, ease: "none" },
			);
			if (cosmos) {
				// No spinning, no growing from the middle: it was there all along.
				gsap.set(cosmos, { autoAlpha: 1, scale: 1 });
			}
			const blast = createBigBang(gsap.ticker);
			effects.push(blast.destroy);
			blast.play(origin, () => {
				blast.destroy();
				cleanup();
			});
			announce(true);
			reveal();
		};

		const tl = gsap.timeline({ onComplete: boom });
		killables.push(tl);
		tl.to(lines, { autoAlpha: 0, duration: 0.4 }, 0)
			.to(skip, { autoAlpha: 0, duration: 0.4 }, 0)
			.to(
				course,
				{ t: 1, duration: orbit, ease: "power1.inOut", onUpdate: place },
				0,
			)
			// The plasma is drawn into the centre while it keeps circling...
			.add(() => globe.setMode("collapse"), orbit * 0.5)
			// ...and the glow around it swells with the pressure.
			.to(
				halo,
				{ opacity: 1, scale: 1.8, duration: orbit, ease: "power2.in" },
				0,
			);
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
		for (const stop of effects.splice(0)) stop();
	};
};
