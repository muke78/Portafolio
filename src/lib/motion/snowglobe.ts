/**
 * The particle of the intro gate (IntroGate.astro): a glass sphere with violet flakes
 * floating inside, like a snow globe. A tiny 2D canvas, a few dozen flakes, driven by the
 * GSAP ticker - cheap and it only exists while the gate is up.
 *
 * Physics (`stepFlakes`, pure so it can be tested): the flakes sink very slowly and sway;
 * agitation (the pointer coming close, the heartbeat) stirs them into a swirl around the
 * centre plus random jitter, then it dies away and they drift down again. Mode
 * "collapse" pulls every flake into the centre (the instant before the Big Bang). The
 * glass is a circle: a flake that reaches it bounces back.
 */

export interface Flake {
	/** Position inside the unit disc (y grows downward). */
	x: number;
	y: number;
	vx: number;
	vy: number;
	/** Depth 0 (far, small, dim) .. 1 (near, big, bright). */
	z: number;
	phase: number;
}

export type GlobeMode = "calm" | "collapse";

/** How close to the glass (share of the radius) a flake may get. */
export const GLASS = 0.9;

export const makeFlakes = (count: number, rnd: () => number = Math.random) =>
	Array.from({ length: count }, (): Flake => {
		const r = Math.sqrt(rnd()) * GLASS * 0.95;
		const a = rnd() * Math.PI * 2;
		return {
			x: Math.cos(a) * r,
			y: Math.sin(a) * r,
			vx: 0,
			vy: 0,
			z: rnd(),
			phase: rnd() * Math.PI * 2,
		};
	});

export const stepFlakes = (
	flakes: Flake[],
	dt: number,
	agitation: number,
	mode: GlobeMode,
	time: number,
	rnd: () => number = Math.random,
) => {
	const drag = Math.exp(-(1.6 + agitation * 0.4) * dt);
	for (const f of flakes) {
		// A slow sink and a gentle sway: alive even when nobody touches it.
		let ax = Math.sin(time * 0.7 + f.phase) * 0.05;
		let ay = 0.045 + Math.cos(time * 0.5 + f.phase * 2) * 0.02;

		// Stirred: swirl around the centre (faster near it) and jitter.
		ax += -f.y * agitation * 1.1 + (rnd() - 0.5) * agitation * 2.4;
		ay += f.x * agitation * 1.1 + (rnd() - 0.5) * agitation * 2.4;

		if (mode === "collapse") {
			ax += -f.x * 16;
			ay += -f.y * 16;
		}

		f.vx = (f.vx + ax * dt) * drag;
		f.vy = (f.vy + ay * dt) * drag;
		f.x += f.vx * dt;
		f.y += f.vy * dt;

		// The glass: back inside, losing the part of the speed that went into it.
		const r = Math.hypot(f.x, f.y);
		if (r > GLASS) {
			const nx = f.x / r;
			const ny = f.y / r;
			f.x = nx * GLASS;
			f.y = ny * GLASS;
			const into = f.vx * nx + f.vy * ny;
			if (into > 0) {
				f.vx -= 1.5 * into * nx;
				f.vy -= 1.5 * into * ny;
			}
		}
	}
};

export interface Snowglobe {
	/** A burst of stirring that dies away (heartbeat, a fast cursor). 0..1. */
	kick: (amount: number) => void;
	/** Constant stirring while something holds it (the cursor near). 0..1. */
	hold: (amount: number) => void;
	setMode: (mode: GlobeMode) => void;
	destroy: () => void;
}

type Rgb = [number, number, number];

const readRgb = (
	ctx: CanvasRenderingContext2D,
	token: string,
	fallback: Rgb,
): Rgb => {
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(token)
		.trim();
	if (!raw) return fallback;
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = raw;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return [r, g, b];
};

/** One soft violet dot, drawn once and stamped for every flake. */
const makeSprite = (inner: Rgb, outer: Rgb) => {
	const size = 32;
	const sprite = document.createElement("canvas");
	sprite.width = sprite.height = size;
	const c = sprite.getContext("2d");
	if (!c) return null;
	const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
	g.addColorStop(0, `rgba(${inner.join(",")},1)`);
	g.addColorStop(0.35, `rgba(${outer.join(",")},0.85)`);
	g.addColorStop(1, `rgba(${outer.join(",")},0)`);
	c.fillStyle = g;
	c.fillRect(0, 0, size, size);
	return sprite;
};

interface Ticker {
	add: (fn: (time: number, deltaTime: number) => void) => unknown;
	remove: (fn: (time: number, deltaTime: number) => void) => unknown;
}

const NOOP: Snowglobe = {
	kick: () => {},
	hold: () => {},
	setMode: () => {},
	destroy: () => {},
};

export const createSnowglobe = (
	canvas: HTMLCanvasElement,
	ticker: Ticker,
	count = 70,
): Snowglobe => {
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return NOOP;

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const side = Math.max(1, Math.round(canvas.clientWidth || 72));
	canvas.width = canvas.height = Math.round(side * dpr);

	const sprite = makeSprite(
		readRgb(ctx, "--galaxy-hot", [238, 226, 255]),
		readRgb(ctx, "--primary", [140, 90, 255]),
	);
	if (!sprite) return NOOP;

	const flakes = makeFlakes(count);
	let agitation = 0;
	let held = 0;
	let mode: GlobeMode = "calm";
	let clock = 0;

	const tick = (_time: number, deltaTime: number) => {
		const dt = Math.min(deltaTime / 1000, 0.05);
		clock += dt;
		agitation *= Math.exp(-1.5 * dt);
		const stir = Math.max(agitation, held);
		stepFlakes(flakes, dt, stir, mode, clock);

		const half = canvas.width / 2;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.globalCompositeOperation = "lighter";
		for (const f of flakes) {
			const twinkle = 0.6 + 0.4 * Math.sin(clock * 3 + f.phase * 3);
			const px = half + f.x * half;
			const py = half + f.y * half;
			const s = (3 + f.z * 7) * dpr;
			ctx.globalAlpha = Math.min(1, (0.3 + 0.7 * f.z) * twinkle);
			ctx.drawImage(sprite, px - s / 2, py - s / 2, s, s);
		}
		ctx.globalAlpha = 1;
	};
	ticker.add(tick);

	return {
		kick: (amount) => {
			agitation = Math.max(agitation, amount);
		},
		hold: (amount) => {
			held = amount;
		},
		setMode: (next) => {
			mode = next;
		},
		destroy: () => {
			ticker.remove(tick);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		},
	};
};
