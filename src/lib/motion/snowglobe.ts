/**
 * The particle of the intro gate (IntroGate.astro): the primordial particle, drawn
 * entirely on one small 2D canvas and driven by the GSAP ticker (it only exists while
 * the gate is up, so it costs nothing afterwards).
 *
 * What is inside: a hot, dense plasma. The flakes are not snow settling to the bottom:
 * they are atoms of a universe about to go off, jittering at random (thermal motion),
 * held toward the centre by a spring and bouncing off the glass. The hotter it is, the
 * wilder they move and the more they fill the sphere. No gravity: nothing piles up.
 *
 * What the cursor does to it. The sphere reads the time the cursor has been ON it
 * (`dwell`) and goes through five states, each one a little more than the last:
 *   1. it is a ferrofluid: the edge of the circle swells into liquid lumps and spikes
 *      (the way Google's loaders morph a circle);
 *   2. the contour shivers: fast, small waves run around it;
 *   3. it inflates on ONE side, like a bubble of gum being blown: the energy gathers in
 *      a bulge with a hot spot in it, not all around;
 *   4. it heats up: rim, glow and flakes travel the whole spectrum from violet to red;
 *   5. let go and it cools back down, in the reverse order.
 * A cursor merely NEAR it only lifts the temperature a little: the particle stays calm.
 *
 * Everything that is arithmetic (`stepFlakes`, `phasesAt`, `hueAt`, `radiusAt`) is pure
 * so it can be tested without a canvas.
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

const TAU = Math.PI * 2;

export const smooth = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

/* ---------------- the plasma inside ---------------- */

/** Flakes are denser toward the middle: a hot core, not an even cloud. */
export const makeFlakes = (count: number, rnd: () => number = Math.random) =>
	Array.from({ length: count }, (): Flake => {
		const r = rnd() ** 1.6 * GLASS * 0.9;
		const a = rnd() * TAU;
		return {
			x: Math.cos(a) * r,
			y: Math.sin(a) * r,
			vx: 0,
			vy: 0,
			z: rnd(),
			phase: rnd() * TAU,
		};
	});

/**
 * One step of thermal motion. `temperature` (0 = barely warm, 1 = hot, 2+ = about to go
 * off) scales the random kicks; there is a spring toward the centre and no gravity.
 */
export const stepFlakes = (
	flakes: Flake[],
	dt: number,
	temperature: number,
	mode: GlobeMode,
	rnd: () => number = Math.random,
) => {
	const drag = Math.exp(-2.4 * dt);
	const kick = 40 * temperature;
	for (const f of flakes) {
		let ax = -f.x * 0.9 + (rnd() - 0.5) * kick;
		let ay = -f.y * 0.9 + (rnd() - 0.5) * kick;
		// A slow turn around the centre, faster when hot: a plasma, not a still cloud.
		ax += -f.y * temperature * 0.35;
		ay += f.x * temperature * 0.35;

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
				f.vx -= 1.8 * into * nx;
				f.vy -= 1.8 * into * ny;
			}
		}
	}
};

/* ---------------- the states the cursor takes it through ---------------- */

export interface Phases {
	/** 0..1: sharp, long spikes pulled out of the edge, as if by invisible hands. */
	spikes: number;
	/** 0..1: edge of the circle turned liquid (ferrofluid lumps and spikes). */
	ferro: number;
	/** 0..1: small fast waves running around the contour. */
	shiver: number;
	/** 0..1: a bubble blown out on one side. */
	inflate: number;
	/** 0..1: violet -> red through the whole spectrum. */
	heat: number;
}

/**
 * `dwell`: seconds the cursor has been on the sphere (it drains when it leaves).
 * `energy`: 0..1, how close the cursor is (1 = on it). Near only gives a hint of the
 * first state: the particle stays calm.
 */
export const phasesAt = (dwell: number, energy: number): Phases => ({
	// First the spikes: they rise one by one, hold, then let go as the edge turns liquid.
	spikes: smooth(0, 2, dwell) * (1 - smooth(3.6, 4.8, dwell)),
	ferro: Math.max(smooth(3.2, 4.4, dwell), energy * 0.35),
	shiver: smooth(5, 6.2, dwell),
	inflate: smooth(6.8, 8.8, dwell),
	heat: smooth(8.2, 13.2, dwell),
});

/** Violet (the --primary hue) down through blue, cyan, green, yellow and orange to red. */
export const HUE_VIOLET = 292;
export const HUE_RED = 25;
export const hueAt = (heat: number) =>
	HUE_VIOLET + (HUE_RED - HUE_VIOLET) * heat;

/** Where on the contour the bubble is blown (radians), drifting a little. */
export const bulgeAngle = (time: number) => -0.9 + 0.35 * Math.sin(time * 0.5);

const SPIKES = 7;
const SPIKE_WIDTH = 0.2;

const angleDiff = (a: number, b: number) => {
	let d = a - b;
	while (d > Math.PI) d -= TAU;
	while (d < -Math.PI) d += TAU;
	return d;
};

/**
 * Radius of the contour at angle `theta`, for a sphere of radius `R`. A circle that the
 * states deform: lumps and spikes (ferro), shivers, and one big one-sided bulge.
 */
export const radiusAt = (
	theta: number,
	time: number,
	ph: Phases,
	R: number,
): number => {
	let r = 1;

	// Spikes: SPIKES sharp triangles (cartoon spikes), each pulled out in turn and a bit
	// longer or shorter than its neighbours; the tips tremble as if being tugged.
	if (ph.spikes > 0) {
		for (let k = 0; k < SPIKES; k++) {
			const at = (k / SPIKES) * TAU + time * 0.22 + 0.35 * Math.sin(k * 1.7);
			const d = Math.abs(angleDiff(theta, at));
			const tri = Math.max(0, 1 - d / SPIKE_WIDTH);
			if (tri === 0) continue;
			// each one starts a little after the previous (staggered pull)
			const rise = smooth(
				k * 0.09,
				k * 0.09 + 0.55,
				ph.spikes * (1 + SPIKES * 0.09),
			);
			const len = 0.5 + 0.4 * (((k * 37) % 5) / 5);
			const tremble = 1 + 0.07 * Math.sin(time * 9 + k * 2.3);
			r += ph.spikes * rise * len * tremble * tri ** 1.1;
		}
	}

	// Ferrofluid: three slow harmonics, the crests sharpened into spikes.
	if (ph.ferro > 0) {
		const n =
			Math.sin(3 * theta + time * 1.1) * 0.5 +
			Math.sin(5 * theta - time * 1.7 + 1.3) * 0.3 +
			Math.sin(8 * theta + time * 2.3 + 2.1) * 0.2;
		const spiky = n > 0 ? n ** 1.5 : n * 0.45;
		r += 0.14 * ph.ferro * spiky;
	}

	// Shivers: small waves running around the edge.
	if (ph.shiver > 0) {
		r +=
			ph.shiver *
			(0.032 * Math.sin(17 * theta - time * 15) +
				0.018 * Math.sin(26 * theta + time * 21));
	}

	// The bubble: one-sided, round, and a touch of neck where it leaves the sphere.
	if (ph.inflate > 0) {
		const d = angleDiff(theta, bulgeAngle(time));
		const sigma = 0.62;
		const g = Math.exp(-(d * d) / (2 * sigma * sigma));
		r +=
			ph.inflate *
			(0.62 * g - 0.05 * Math.exp(-((Math.abs(d) - 1.3) ** 2) / 0.18));
	}

	return R * r;
};

/* ---------------- drawing ---------------- */

export interface Snowglobe {
	/** A burst of stirring that dies away (a fast cursor). 0..1. */
	kick: (amount: number) => void;
	/** How close the cursor is (0 = far, 1 = on it): raises the temperature. */
	setEnergy: (energy: number) => void;
	/** The cursor is over the sphere: the states start (and keep going while it stays). */
	setHover: (hover: boolean) => void;
	/** Slow breathing, around 1. */
	setBreath: (scale: number) => void;
	/** The highlight on the glass slides against the lean (-1..1). */
	setLean: (x: number, y: number) => void;
	setMode: (mode: GlobeMode) => void;
	/** CSS colour of the rim right now, so the glow behind it can follow. */
	rim: () => string;
	destroy: () => void;
}

interface Ticker {
	add: (fn: (time: number, deltaTime: number) => void) => unknown;
	remove: (fn: (time: number, deltaTime: number) => void) => unknown;
}

const NOOP: Snowglobe = {
	kick: () => {},
	setEnergy: () => {},
	setHover: () => {},
	setBreath: () => {},
	setLean: () => {},
	setMode: () => {},
	rim: () => "",
	destroy: () => {},
};

/** Colours of the glass: L and C of --primary, the hue is what travels. */
const L = 0.64;
const C = 0.2;
const color = (hue: number, l = L, c = C, a = 1) =>
	`oklch(${l} ${c} ${hue.toFixed(1)} / ${a})`;

const POINTS = 260;

export const createSnowglobe = (
	canvas: HTMLCanvasElement,
	ticker: Ticker,
	count = 110,
): Snowglobe => {
	const ctx = canvas.getContext("2d");
	if (!ctx) return NOOP;

	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const side = Math.max(1, Math.round(canvas.clientWidth || 224));
	canvas.width = canvas.height = Math.round(side * dpr);
	// The sphere takes the middle ~43 % of the canvas; the rest is room for lumps, spikes,
	// the bubble and the glow.
	const R = canvas.width * 0.215;
	const mid = canvas.width / 2;

	const flakes = makeFlakes(count);
	let kicked = 0;
	let energy = 0;
	let hovering = false;
	let dwell = 0;
	let breath = 1;
	let leanX = 0;
	let leanY = 0;
	let mode: GlobeMode = "calm";
	let clock = 0;
	let rimNow = color(HUE_VIOLET);

	const tick = (_time: number, deltaTime: number) => {
		const dt = Math.min(deltaTime / 1000, 0.05);
		clock += dt;
		kicked *= Math.exp(-2 * dt);
		dwell = Math.min(15, Math.max(0, dwell + (hovering ? dt : -dt * 1.6)));

		const ph = phasesAt(dwell, energy);
		const hue = hueAt(ph.heat);
		const hot = Math.min(1, energy * 0.5 + ph.heat * 0.5 + ph.inflate * 0.3);
		// Hot and dense, always: a baseline of jitter that the cursor and the heat raise.
		const temperature =
			0.55 +
			energy * 0.7 +
			kicked * 0.8 +
			ph.heat * 1.1 +
			ph.inflate * 0.5 +
			ph.spikes * 0.6;
		stepFlakes(flakes, dt, temperature, mode);

		// ---- the contour: a circle the states deform ----
		const path = new Path2D();
		for (let i = 0; i <= POINTS; i++) {
			const theta = (i / POINTS) * TAU;
			const r = radiusAt(theta, clock, ph, R * breath);
			const x = mid + Math.cos(theta) * r;
			const y = mid + Math.sin(theta) * r;
			if (i === 0) path.moveTo(x, y);
			else path.lineTo(x, y);
		}
		path.closePath();

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// ---- body of glass, with its glow ----
		rimNow = color(hue, L + 0.12 * ph.heat, C);
		ctx.save();
		ctx.shadowColor = color(hue, L, C, 0.55 + 0.35 * hot);
		ctx.shadowBlur = (16 + 26 * hot) * dpr;
		const body = ctx.createRadialGradient(
			mid,
			mid + R * 0.15,
			0,
			mid,
			mid,
			R * 1.5,
		);
		body.addColorStop(0, color(hue, L, C, 0.5));
		body.addColorStop(0.55, color(hue, L, C, 0.18));
		// The edge of the glass: the night (--night) with the colour showing through.
		body.addColorStop(1, "oklch(0.145 0.012 270 / 0.6)");
		ctx.fillStyle = body;
		ctx.fill(path);
		ctx.restore();

		// ---- inside the glass ----
		ctx.save();
		ctx.clip(path);

		// The core of the plasma. On the bulging side, the energy gathers there.
		const bulge = bulgeAngle(clock);
		const gx = mid + Math.cos(bulge) * R * 0.8 * ph.inflate;
		const gy = mid + Math.sin(bulge) * R * 0.8 * ph.inflate;
		const core = ctx.createRadialGradient(
			mid + (gx - mid) * 0.5,
			mid + (gy - mid) * 0.5,
			0,
			mid + (gx - mid) * 0.5,
			mid + (gy - mid) * 0.5,
			R * (0.75 + 0.5 * ph.inflate),
		);
		core.addColorStop(0, color(hue, 0.97, 0.05, 0.14 + 0.5 * hot));
		core.addColorStop(0.35, color(hue, 0.85, 0.16, 0.12 + 0.3 * hot));
		core.addColorStop(1, color(hue, L, C, 0));
		ctx.fillStyle = core;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		if (ph.inflate > 0.05) {
			const hotSpot = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * 0.55);
			hotSpot.addColorStop(0, color(hue + 12, 0.98, 0.1, 0.85 * ph.inflate));
			hotSpot.addColorStop(1, color(hue, 0.8, 0.2, 0));
			ctx.fillStyle = hotSpot;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		// The flakes (hot atoms): a soft halo and a bright core each.
		ctx.globalCompositeOperation = "lighter";
		const flakeColor = color(hue, 0.86, 0.13);
		ctx.fillStyle = flakeColor;
		for (const f of flakes) {
			const twinkle = 0.65 + 0.35 * Math.sin(clock * 5 + f.phase * 3);
			const px = mid + f.x * R * breath;
			const py = mid + f.y * R * breath;
			const s = (0.8 + f.z * 1.7) * dpr;
			ctx.globalAlpha = (0.12 + 0.12 * hot) * twinkle;
			ctx.beginPath();
			ctx.arc(px, py, s * 2.6, 0, TAU);
			ctx.fill();
			ctx.globalAlpha = Math.min(1, (0.35 + 0.65 * f.z) * twinkle);
			ctx.beginPath();
			ctx.arc(px, py, s, 0, TAU);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";

		// Highlight on the glass (slides against the lean): it reads as a surface.
		const sx = mid - R * 0.34 - leanX * R * 0.18;
		const sy = mid - R * 0.42 - leanY * R * 0.18;
		const shine = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.5);
		shine.addColorStop(0, "oklch(0.94 0.004 270 / 0.55)");
		shine.addColorStop(1, "oklch(0.94 0.004 270 / 0)");
		ctx.fillStyle = shine;
		ctx.beginPath();
		ctx.ellipse(sx, sy, R * 0.34, R * 0.2, -0.5, 0, TAU);
		ctx.fill();
		ctx.restore();

		// ---- the rim ----
		ctx.lineWidth = (1.3 + 0.9 * hot) * dpr;
		ctx.strokeStyle = color(hue, L + 0.14 + 0.1 * ph.heat, C, 0.9);
		ctx.stroke(path);
	};
	ticker.add(tick);

	return {
		kick: (amount) => {
			kicked = Math.max(kicked, amount);
		},
		setEnergy: (e) => {
			energy = e;
		},
		setHover: (h) => {
			hovering = h;
		},
		setBreath: (b) => {
			breath = b;
		},
		setLean: (x, y) => {
			leanX = x;
			leanY = y;
		},
		setMode: (next) => {
			mode = next;
		},
		rim: () => rimNow,
		destroy: () => {
			ticker.remove(tick);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		},
	};
};
