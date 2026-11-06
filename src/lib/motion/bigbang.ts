import type { Cleanup, MotionTools } from "./core";

/**
 * The Big Bang itself, drawn on a full-screen canvas (no purple circle growing from the
 * middle): a white-hot core that blooms into yellow and red, long rays of radiation, a
 * shock ring, a red haze that lingers, and fragments (little stars and sparks) thrown out
 * in every direction that cool from white to yellow to red as they fly and fade.
 *
 * Colours come from the --bang-* tokens. Everything is time-driven by one ticker callback;
 * `shardsAt`, `shardColour` and `coreAt` are pure so they can be tested without a canvas.
 */

export const BANG_SECONDS = 4;
const TAU = Math.PI * 2;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - (1 - clamp(t)) ** 3;

export interface Shard {
	angle: number;
	/** Initial speed, as a share of the screen diagonal per second. */
	speed: number;
	size: number;
	/** Seconds it lives. */
	life: number;
	/** 4-point star (true) or a spark with a trail (false). */
	star: boolean;
	spin: number;
}

export const makeShards = (count: number, rnd: () => number): Shard[] =>
	Array.from({ length: count }, () => {
		const star = rnd() < 0.4;
		return {
			angle: rnd() * TAU,
			// Most are fast, a few are slow: a ball of debris, not a ring.
			speed: 0.18 + rnd() ** 1.6 * 1.1,
			size: star ? 3 + rnd() * 8 : 1 + rnd() * 2.2,
			life: 1.6 + rnd() * 2.2,
			star,
			spin: (rnd() - 0.5) * 8,
		};
	});

/** Distance travelled after `t` seconds with drag: it flies out quickly and coasts. */
export const shardDistance = (s: Shard, t: number, diagonal: number) => {
	const k = 1.7; // drag
	return s.speed * diagonal * ((1 - Math.exp(-k * t)) / k);
};

/** How hot a fragment is, 0 (white) .. 1 (red, nearly out), from its age as a share of life. */
export const shardColour = (age: number): "white" | "yellow" | "red" =>
	age < 0.18 ? "white" : age < 0.5 ? "yellow" : "red";

/** The core's radius (share of the diagonal) and brightness over time. */
export const coreAt = (t: number) => ({
	radius: 0.04 + 0.4 * easeOut(t / 0.9),
	alpha: t < 0.06 ? t / 0.06 : clamp(1 - (t - 0.06) / 1.9),
});

interface Tokens {
	white: string;
	yellow: string;
	red: string;
}

const readTokens = (): Tokens => {
	const style = getComputedStyle(document.documentElement);
	const get = (name: string, fallback: string) =>
		style.getPropertyValue(name).trim() || fallback;
	return {
		white: get("--bang-white", "oklch(97% 0.03 90)"),
		yellow: get("--bang-yellow", "oklch(88% 0.17 92)"),
		red: get("--bang-red", "oklch(60% 0.23 27)"),
	};
};

/** A colour with an opacity, as a CSS colour string the canvas accepts. */
const withAlpha = (colour: string, alpha: number) =>
	`color-mix(in oklch, ${colour} ${Math.round(clamp(alpha) * 100)}%, transparent)`;

export interface BigBang {
	/** Start the explosion at a point (client px). Calls `done` when it has died out. */
	play: (origin: { x: number; y: number }, done?: () => void) => void;
	destroy: Cleanup;
}

export const createBigBang = (
	ticker: MotionTools["gsap"]["ticker"],
	rnd: () => number = Math.random,
): BigBang => {
	const canvas = document.createElement("canvas");
	canvas.className = "bang-fx";
	canvas.setAttribute("aria-hidden", "true");
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		// No 2D canvas (old browser, jsdom): the explosion is simply skipped.
		return {
			play: (_o, done) => done?.(),
			destroy: () => {},
		};
	}
	document.body.append(canvas);

	const tokens = readTokens();
	const colour = {
		white: tokens.white,
		yellow: tokens.yellow,
		red: tokens.red,
	};
	const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	const resize = () => {
		canvas.width = Math.round(window.innerWidth * dpr);
		canvas.height = Math.round(window.innerHeight * dpr);
	};
	resize();

	const shards = makeShards(window.innerWidth < 640 ? 150 : 260, rnd);
	// Long thin rays of radiation (a fixed fan, each a different length).
	const rays = Array.from({ length: 56 }, (_, i) => ({
		angle: (i / 56) * TAU + (rnd() - 0.5) * 0.08,
		length: 0.35 + rnd() * 0.75,
		width: 0.012 + rnd() * 0.03,
		delay: rnd() * 0.12,
	}));

	let start = 0;
	let origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	let done: (() => void) | undefined;
	let running = false;

	const draw = (t: number) => {
		const w = window.innerWidth;
		const h = window.innerHeight;
		const diag = Math.hypot(w, h);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		ctx.globalCompositeOperation = "lighter";

		// 0. The first instant is a white flash that hides the cut from the void to the page.
		const flash = clamp(1 - t / 0.5) ** 1.5;
		if (flash > 0) {
			ctx.fillStyle = withAlpha(colour.white, flash * 0.9);
			ctx.fillRect(0, 0, w, h);
		}

		// 1. The haze: a big red glow that stays after the flash and slowly goes out.
		const haze = clamp(1 - t / BANG_SECONDS) * clamp(t / 0.15);
		if (haze > 0) {
			const r = diag * (0.25 + 0.5 * easeOut(t / 2));
			const g = ctx.createRadialGradient(
				origin.x,
				origin.y,
				0,
				origin.x,
				origin.y,
				r,
			);
			g.addColorStop(0, withAlpha(colour.red, 0.55 * haze));
			g.addColorStop(0.6, withAlpha(colour.red, 0.22 * haze));
			g.addColorStop(1, withAlpha(colour.red, 0));
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}

		// 2. The core: white in the middle, then yellow, then red at the edge.
		const core = coreAt(t);
		if (core.alpha > 0) {
			const r = diag * core.radius;
			const g = ctx.createRadialGradient(
				origin.x,
				origin.y,
				0,
				origin.x,
				origin.y,
				r,
			);
			g.addColorStop(0, withAlpha(colour.white, core.alpha));
			g.addColorStop(0.25, withAlpha(colour.white, core.alpha * 0.9));
			g.addColorStop(0.5, withAlpha(colour.yellow, core.alpha * 0.7));
			g.addColorStop(0.8, withAlpha(colour.red, core.alpha * 0.4));
			g.addColorStop(1, withAlpha(colour.red, 0));
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}

		// 3. Radiation: long rays, white at the root, yellow then red toward the tip.
		for (const ray of rays) {
			const rt = t - ray.delay;
			if (rt <= 0) continue;
			const reach = diag * ray.length * easeOut(rt / 0.7);
			const alpha = clamp(1 - rt / 1.6) * 0.9;
			if (alpha <= 0) continue;
			const dx = Math.cos(ray.angle);
			const dy = Math.sin(ray.angle);
			const half = diag * ray.width * 0.5 * (0.5 + 0.5 * clamp(1 - rt / 1.6));
			const g = ctx.createLinearGradient(
				origin.x,
				origin.y,
				origin.x + dx * reach,
				origin.y + dy * reach,
			);
			g.addColorStop(0, withAlpha(colour.white, alpha));
			g.addColorStop(0.35, withAlpha(colour.yellow, alpha * 0.7));
			g.addColorStop(0.75, withAlpha(colour.red, alpha * 0.35));
			g.addColorStop(1, withAlpha(colour.red, 0));
			ctx.fillStyle = g;
			ctx.beginPath();
			// A thin triangle: wide at the root, a point at the tip.
			ctx.moveTo(origin.x - dy * half * 0.15, origin.y + dx * half * 0.15);
			ctx.lineTo(origin.x + dx * reach, origin.y + dy * reach);
			ctx.lineTo(origin.x + dy * half * 0.15, origin.y - dx * half * 0.15);
			ctx.closePath();
			ctx.fill();
		}

		// 4. The shock ring.
		const ringT = t / 2.4;
		if (ringT < 1) {
			ctx.lineWidth = 2 + 16 * (1 - ringT);
			ctx.strokeStyle = withAlpha(colour.yellow, 0.7 * (1 - ringT));
			ctx.beginPath();
			ctx.arc(origin.x, origin.y, diag * 0.75 * easeOut(ringT), 0, TAU);
			ctx.stroke();
		}

		// 5. The fragments: little stars and sparks, white -> yellow -> red -> gone.
		ctx.globalCompositeOperation = "source-over";
		for (const s of shards) {
			if (t >= s.life) continue;
			const age = t / s.life;
			const d = shardDistance(s, t, diag);
			const x = origin.x + Math.cos(s.angle) * d;
			const y = origin.y + Math.sin(s.angle) * d;
			const alpha = clamp(1 - age) ** 0.7;
			const fill = colour[shardColour(age)];
			if (s.star) {
				const r = s.size * (1 - age * 0.5);
				const turn = s.spin * t;
				ctx.fillStyle = withAlpha(fill, alpha);
				ctx.beginPath();
				// Four-point star: points at r, waist at r * 0.28.
				for (let i = 0; i < 8; i++) {
					const a = turn + (i / 8) * TAU;
					const rr = i % 2 === 0 ? r : r * 0.28;
					const px = x + Math.cos(a) * rr;
					const py = y + Math.sin(a) * rr;
					if (i === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.closePath();
				ctx.fill();
			} else {
				// A spark with a trail along its path.
				const back = shardDistance(s, Math.max(0, t - 0.07), diag);
				ctx.strokeStyle = withAlpha(fill, alpha);
				ctx.lineWidth = s.size;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(
					origin.x + Math.cos(s.angle) * back,
					origin.y + Math.sin(s.angle) * back,
				);
				ctx.lineTo(x, y);
				ctx.stroke();
			}
		}
	};

	const tick = () => {
		const t = (performance.now() - start) / 1000;
		if (t >= BANG_SECONDS) {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			stop();
			done?.();
			return;
		}
		draw(t);
	};

	const stop = () => {
		if (!running) return;
		running = false;
		ticker.remove(tick);
	};

	return {
		play: (at, onDone) => {
			origin = at;
			done = onDone;
			start = performance.now();
			running = true;
			draw(0);
			ticker.add(tick);
		},
		destroy: () => {
			stop();
			canvas.remove();
		},
	};
};

/**
 * After the explosion everything is hot. A layer over the page tints what is below it
 * (text, buttons, photo, icons, stars) with the `color` blend: yellow-white first, then
 * red, then violet as it cools, and it finally lets go so the page shows its own colours.
 * `seconds` is the whole cooling. Returns the timeline (kill it to remove the layer).
 */
export const heatUp = (
	gsap: MotionTools["gsap"],
	seconds: number,
	onDone?: () => void,
): gsap.core.Timeline => {
	const layer = document.createElement("div");
	layer.className = "bang-heat";
	layer.setAttribute("aria-hidden", "true");
	const tints = ["--bang-yellow", "--bang-red", "--primary"].map((token) => {
		const span = document.createElement("span");
		span.style.background = `var(${token})`;
		layer.append(span);
		return span;
	});
	const [yellow, red, violet] = tints;
	document.body.append(layer);

	const s = seconds;
	const remove = () => {
		layer.remove();
		onDone?.();
	};
	return (
		gsap
			.timeline({ onComplete: remove })
			// It is white-yellow in the instant of the blast...
			.set(layer, { opacity: 1 }, 0)
			.set(yellow, { opacity: 1 }, 0)
			// ...goes orange and red...
			.to(
				red,
				{ opacity: 1, duration: s * 0.3, ease: "power1.inOut" },
				s * 0.08,
			)
			.to(
				yellow,
				{ opacity: 0, duration: s * 0.3, ease: "power1.inOut" },
				s * 0.12,
			)
			// ...cools to violet...
			.to(
				violet,
				{ opacity: 1, duration: s * 0.3, ease: "power1.inOut" },
				s * 0.48,
			)
			.to(
				red,
				{ opacity: 0, duration: s * 0.3, ease: "power1.inOut" },
				s * 0.52,
			)
			// ...and the page recovers its own colours.
			.to(
				layer,
				{ opacity: 0, duration: s * 0.22, ease: "power1.inOut" },
				s * 0.78,
			)
	);
};
