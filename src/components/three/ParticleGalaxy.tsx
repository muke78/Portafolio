import { useEffect, useRef } from "react";
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	Group,
	LineSegments,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";
import {
	EPILOGUE_FROM,
	galaxyState,
	PEAK,
	penroseView,
} from "@/lib/galaxyState";

/**
 * PARTICLE GALAXY - an original particle system (no third-party model,
 * texture or code). It tells how a galaxy is born, lives and dies as the page
 * scrolls (galaxyState.story, 0..1 over the whole page, scrubbed by
 * src/lib/motion/galaxy.ts).
 *
 * One draw call of GPU points; every position is computed in the vertex shader
 * from stored layouts per particle:
 *
 *   dust    a loose cloud of stars around the viewer (after the intro's Big
 *           Bang, galaxyState.bang: every particle starts as one point at the
 *           centre of the screen and is thrown out to the sky)
 *   clump   a few enormous clouds the dust is gathered into by gravity
 *   galaxy  a three-armed logarithmic spiral with a dense bulge and a thin
 *           disc, generated here from a seeded random sequence
 *
 * The story, by progress:
 *   .08-.26  the stars gather into clouds
 *   .26-.40  the gas falls to the centre of the halo (hot, then cooling)
 *   .40-.54  angular momentum: it spins and flattens into a disc
 *   .44-.56  the first stars ignite (each one flashes as it lights)
 *   .54-.70  the spiral arms wind up; the centre darkens around a bright ring
 *            (the black hole and its glowing disc)
 *   .70-.86  growth by mergers: a smaller galaxy spirals in, with a tidal lift
 *   .86-1    the end: the gas is gone, the light turns to embers, the stars go
 *            out one by one and only the black hole's ring is left
 *
 * Colours are read from the --galaxy-* tokens in app.css and re-read when the
 * theme class on <html> changes. With prefers-reduced-motion the galaxy is drawn
 * still at its healthy peak (no loop). The loop also stops while the tab is
 * hidden.
 */

const CAMERA_Z = 7;
const FOV = 50;
const GALAXY_RADIUS = 3.3;
const ARMS = 3;
const smooth = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

type Rgb = [number, number, number];

/* ---------- seeded randomness (mulberry32) ---------- */
const seeded = (seed: number) => {
	let state = seed;
	return () => {
		state += 0x6d2b79f5;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Roughly normal, in about [-1, 1]. */
const gauss = (rnd: () => number) => (rnd() + rnd() + rnd() - 1.5) / 1.5;

/* ---------- palette from CSS tokens ---------- */
let probe: CanvasRenderingContext2D | null | undefined;
const getProbe = () => {
	if (probe === undefined) {
		const c = document.createElement("canvas");
		c.width = c.height = 1;
		probe = c.getContext("2d", { willReadFrequently: true });
	}
	return probe;
};

const readToken = (name: string, fallback: Rgb): Rgb => {
	const ctx = getProbe();
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
	if (!ctx || !raw) return fallback;
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = raw;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return [r / 255, g / 255, b / 255];
};

const applyPalette = (material: ShaderMaterial) => {
	const u = material.uniforms;
	u.uCore.value = new Color(...readToken("--galaxy-core", [0.84, 0.67, 0.94]));
	u.uArm.value = new Color(...readToken("--galaxy-arm", [0.55, 0.36, 1]));
	u.uHot.value = new Color(...readToken("--galaxy-hot", [0.94, 0.93, 0.98]));
	u.uStar.value = new Color(...readToken("--galaxy-star", [0.84, 0.85, 0.98]));
	u.uEmber.value = new Color(...readToken("--galaxy-ember", [0.9, 0.45, 0.3]));
	u.uPortal.value = new Color(
		...readToken("--galaxy-portal", [0.5, 0.8, 0.95]),
	);
};

/* ---------- geometry ---------- */
/** Where the great clouds sit (in the same units as the dust shell). */
const CLOUDS: [number, number, number][] = [
	[-3.4, 1.5, -0.8],
	[-1.2, -1.9, 0.6],
	[1.0, 1.9, -0.6],
	[3.3, -0.4, 0.2],
	[0.2, -0.1, 1.4],
];

const buildGeometry = (count: number, seed = 20251101) => {
	const rnd = seeded(seed);
	const dust = new Float32Array(count * 3);
	const gal = new Float32Array(count * 3);
	const clump = new Float32Array(count * 3);
	// x: seed, y: size, z: colour mix (0 core .. 1 rim), w: twinkle phase
	const rand = new Float32Array(count * 4);

	for (let i = 0; i < count; i++) {
		// Dust: a thick shell around the origin, never inside the camera.
		const u = rnd();
		const v = rnd() * 2 - 1;
		const phi = rnd() * Math.PI * 2;
		const rd = 0.8 + 5.4 * Math.cbrt(u);
		const s = Math.sqrt(1 - v * v);
		dust.set([rd * s * Math.cos(phi), rd * v, rd * s * Math.sin(phi)], i * 3);

		// Cloud: a blob around one of the centres, stretched a little (filaments).
		const c = CLOUDS[Math.floor(rnd() * CLOUDS.length)];
		const sigma = 0.55 + 0.5 * rnd();
		clump.set(
			[
				c[0] + gauss(rnd) * sigma * 1.3,
				c[1] + gauss(rnd) * sigma,
				c[2] + gauss(rnd) * sigma,
			],
			i * 3,
		);

		// Galaxy: ~16 % bulge, the rest spread along the spiral arms.
		const bulge = rnd() < 0.16;
		let x: number;
		let y: number;
		let z: number;
		let mix: number;
		if (bulge) {
			const r = 0.75 * rnd() ** 1.8;
			const a = rnd() * Math.PI * 2;
			const b = Math.acos(rnd() * 2 - 1);
			x = r * Math.sin(b) * Math.cos(a);
			y = r * Math.cos(b) * 0.7;
			z = r * Math.sin(b) * Math.sin(a);
			mix = 0.05 * rnd();
		} else {
			const t = rnd() ** 0.62;
			const r = GALAXY_RADIUS * t;
			const arm = Math.floor(rnd() * ARMS);
			const angle =
				(arm / ARMS) * Math.PI * 2 +
				t * 4.6 +
				gauss(rnd) * 0.42 * (1.15 - t * 0.6);
			x = Math.cos(angle) * r;
			z = Math.sin(angle) * r;
			y = gauss(rnd) * 0.2 * Math.exp(-t * 1.3);
			mix = 0.15 + 0.85 * t;
		}
		gal.set([x, y, z], i * 3);

		const bright = rnd() < 0.05;
		rand.set(
			[rnd(), bright ? 2.4 + rnd() * 1.2 : 0.7 + rnd() * 1.1, mix, rnd()],
			i * 4,
		);
	}

	const geometry = new BufferGeometry();
	geometry.setAttribute("aDust", new BufferAttribute(dust, 3));
	geometry.setAttribute("aGal", new BufferAttribute(gal, 3));
	geometry.setAttribute("aClump", new BufferAttribute(clump, 3));
	geometry.setAttribute("aRand", new BufferAttribute(rand, 4));
	// position is required by three even though the shader ignores it.
	geometry.setAttribute(
		"position",
		new BufferAttribute(new Float32Array(count * 3), 3),
	);
	return geometry;
};

/* ---------- the wormhole (embedding diagram) ---------- */
/**
 * The throat of an Einstein-Rosen bridge as a wireframe, like the embedding diagrams that
 * explain it: rings and meridians of a surface whose radius flares from a narrow throat toward
 * both mouths along the tube coordinate l. One end (l < 0) is the black hole's mouth (warm), the other (l > 0)
 * the white hole's (cold). `position` is (x, y, l); the vertex shader places it in front
 * of the camera so that flying through it is just moving the camera coordinate uLc.
 */
const WORM_L = 10;
const buildWormhole = (rings: number, spokes: number) => {
	const ls: number[] = [];
	for (let i = 0; i <= rings; i++) {
		const u = (i / rings) * 2 - 1;
		// denser near the throat, where the surface bends the most
		ls.push(WORM_L * Math.sign(u) * Math.abs(u) ** 1.6);
	}
	// A throat that flares gently at both mouths (a real sqrt(b^2 + l^2) would open faster
	// than the camera's view cone and leave nothing to see from inside).
	const radius = (l: number) => 0.8 + 1.4 * Math.tanh((l * l) / 18);
	const verts: number[] = [];
	const seg = (a: number[], b: number[]) => verts.push(...a, ...b);
	const at = (l: number, k: number): number[] => {
		const a = (k / spokes) * Math.PI * 2;
		return [Math.cos(a) * radius(l), Math.sin(a) * radius(l), l];
	};
	// rings
	for (let i = 0; i <= rings; i++)
		for (let k = 0; k < spokes; k++) seg(at(ls[i], k), at(ls[i], k + 1));
	// meridians
	for (let k = 0; k < spokes; k++)
		for (let i = 0; i < rings; i++) seg(at(ls[i], k), at(ls[i + 1], k));
	const geometry = new BufferGeometry();
	geometry.setAttribute(
		"position",
		new BufferAttribute(new Float32Array(verts), 3),
	);
	return geometry;
};

const WORM_VERTEX = /* glsl */ `
uniform float uWorm;
uniform float uLc;
varying float vL;
varying float vFade;
void main() {
	vL = position.z;
	// the camera is at z = 7 (CAMERA_Z) and looks down -z: what is ahead has l > uLc
	vec3 p = vec3(position.xy, 7.0 - (position.z - uLc));
	vec4 mv = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * mv;
	float ahead = position.z - uLc;
	// near the camera it dissolves, far ahead it fades into the dark
	vFade = smoothstep(0.05, 0.8, ahead) * exp(-ahead * 0.06) * (1.0 + 1.8 * exp(-position.z * position.z * 0.35));
}
`;

const WORM_FRAGMENT = /* glsl */ `
uniform vec3 uWarm;
uniform vec3 uCold;
uniform vec3 uHot;
uniform float uWorm;
varying float vL;
varying float vFade;
void main() {
	vec3 col = mix(uWarm, uCold, smoothstep(-1.6, 1.6, vL));
	col = mix(col, uHot, exp(-vL * vL * 0.5) * 0.6);
	float fadeIn = smoothstep(0.0, 0.12, uWorm) * (1.0 - smoothstep(0.93, 1.0, uWorm));
	gl_FragColor = vec4(col, vFade * fadeIn * 1.1);
}
`;

/* ---------- the Penrose diagram ---------- */
/**
 * The conformal diagram of a charged black hole, drawn the way Penrose draws it: diamonds
 * that touch at their corners (every light ray is a 45 degree line, so every diamond edge
 * is a horizon), each with its lens-shaped grid of constant time and radius, a fan of light
 * from its left and right tips (teal in the upper rows, violet in the lower ones, as in the
 * classic print), the saw-tooth line of the singularity, and the wavy path of whoever falls
 * through it all. The diamond at the centre is the black hole's interior; the ones around
 * it are universes. Units are diamonds (half-diagonal 1); the vertex shader scales them to
 * the screen. `aKind`: 0 grid, 1 edge or singularity, 2 the path, 3 fan of light.
 * `aTone` (-1 below .. 1 above) picks the colour and `aT` (0 at the tip .. 1) fades a fan.
 */
const PENROSE_RINGS = 4;
const buildPenrose = () => {
	const pos: number[] = [];
	const kind: number[] = [];
	const tone: number[] = [];
	const along: number[] = [];
	const seg = (
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		k: number,
		tn: number,
		t1 = 0,
		t2 = 0,
	) => {
		// edges and the path are drawn five times, nudged a hair, so they read as thick lines
		const nudges =
			k === 0 || k === 3
				? [[0, 0]]
				: [
						[0, 0],
						[0.007, 0],
						[-0.007, 0],
						[0, 0.007],
						[0, -0.007],
					];
		for (const [dx, dy] of nudges) {
			pos.push(x1 + dx, y1 + dy, x2 + dx, y2 + dy);
			kind.push(k, k);
			tone.push(tn, tn);
			along.push(t1, t2);
		}
	};
	const R = PENROSE_RINGS;
	const STEPS = 16;
	for (let i = -R; i <= R; i++) {
		for (let j = -R; j <= R; j++) {
			if ((i + j) % 2 !== 0) continue;
			const tn = Math.max(-1, Math.min(1, j / 2));
			// the four edges (horizons)
			seg(i - 1, j, i, j + 1, 1, tn);
			seg(i, j + 1, i + 1, j, 1, tn);
			seg(i + 1, j, i, j - 1, 1, tn);
			seg(i, j - 1, i - 1, j, 1, tn);
			// the axes
			seg(i - 1, j, i + 1, j, 0, tn);
			seg(i, j - 1, i, j + 1, 0, tn);
			// lens-shaped arcs: constant radius (bulging sideways) and constant time (up/down)
			for (const s of [-0.7, -0.35, 0.35, 0.7]) {
				for (let n = 0; n < STEPS; n++) {
					const a = -1 + (2 * n) / STEPS;
					const b = -1 + (2 * (n + 1)) / STEPS;
					const f = (u: number) => s * Math.cos((Math.PI * u) / 2);
					seg(i + f(a), j + a, i + f(b), j + b, 0, tn);
					seg(i + a, j + f(a), i + b, j + f(b), 0, tn);
				}
			}
			// fans of light from the left and right tips toward the far edges
			for (const side of [-1, 1]) {
				const tipX = i + side;
				for (const up of [-1, 1]) {
					for (let m = 1; m <= 6; m++) {
						const sMid = (m - 0.5) / 6;
						// the far edge runs from the opposite tip (i - side, j) to the top/bottom vertex (i, j + up)
						const ex = i - side + side * sMid;
						const ey = j + up * sMid;
						seg(tipX, j, ex, ey, 3, tn, 0, 1);
					}
				}
			}
		}
	}
	// the saw-tooth singularity lines (the "wormhole" of the print)
	for (const x of [-1, 1]) {
		const TEETH = 12;
		for (let n = 0; n < TEETH * 2; n++) {
			const y1 = -1 + (2 * n) / (TEETH * 2);
			const y2 = -1 + (2 * (n + 1)) / (TEETH * 2);
			seg(x + (n % 2 ? 0.05 : -0.05), y1, x + (n % 2 ? -0.05 : 0.05), y2, 1, 0);
		}
	}
	// the path of the one who falls: a slow wave that climbs the whole diagram
	const N = 160;
	for (let n = 0; n < N; n++) {
		const y1 = -R + (2 * R * n) / N;
		const y2 = -R + (2 * R * (n + 1)) / N;
		seg(
			0.32 * Math.sin(y1 * 1.7),
			y1,
			0.32 * Math.sin(y2 * 1.7),
			y2,
			2,
			Math.max(-1, Math.min(1, y1 / R)),
		);
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute(
		"position",
		new BufferAttribute(new Float32Array(pos), 2),
	);
	geometry.setAttribute(
		"aKind",
		new BufferAttribute(new Float32Array(kind), 1),
	);
	geometry.setAttribute(
		"aTone",
		new BufferAttribute(new Float32Array(tone), 1),
	);
	geometry.setAttribute("aT", new BufferAttribute(new Float32Array(along), 1));
	return geometry;
};

const PEN_VERTEX = /* glsl */ `
attribute float aKind;
attribute float aTone;
attribute float aT;
uniform float uZoom;
uniform float uAspect;
varying float vKind;
varying float vTone;
varying float vT;
varying float vDist;
void main() {
	vKind = aKind;
	vTone = aTone;
	vT = aT;
	vec2 p = position.xy * uZoom;
	vDist = length(p);
	gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
}
`;

const PEN_FRAGMENT = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uHot;
uniform float uPen;
varying float vKind;
varying float vTone;
varying float vT;
varying float vDist;
void main() {
	// teal above, violet below (greyish blue in the middle row), as in the classic print
	vec3 side = mix(uBottom, uTop, vTone * 0.5 + 0.5);
	vec3 col = mix(uHot * 0.75, side, 0.3 + 0.7 * abs(vTone));
	float edge = step(0.5, vKind) * (1.0 - step(2.5, vKind));
	float fan = step(2.5, vKind);
	// edges and the path run white-hot, the fans glow in the colour of their row
	col = mix(col, uHot, edge * 0.7 + step(1.5, vKind) * (1.0 - fan) * 0.2);
	float a = mix(0.3, 0.95, edge) * (1.0 - fan) + fan * 0.85 * pow(1.0 - vT, 1.6);
	a *= exp(-vDist * 0.26);
	gl_FragColor = vec4(col, a * uPen);
}
`;

/* ---------- shaders ---------- */
const VERTEX = /* glsl */ `
attribute vec3 aDust;
attribute vec3 aGal;
attribute vec3 aClump;
attribute vec4 aRand;
uniform float uTime;
uniform float uStory;
uniform float uBang;
uniform float uGas;
uniform float uBH;
uniform float uFall;
uniform float uWorm;
uniform vec2 uHoleNdc;
uniform float uEin;
uniform float uAspect;
uniform float uPixel;
uniform vec3 uOrigin;
uniform float uInvScale;
varying float vMix;
varying float vFlash;
varying float vAlpha;
varying float vRing;
varying float vGiant;
varying float vSat;
varying float vTunnel;

// The smaller galaxy that will be swallowed (in the big one's space).
const vec3 SAT = vec3(3.9, 0.4, -0.9);

mat2 rot(float a) {
	float s = sin(a), c = cos(a);
	return mat2(c, -s, s, c);
}

void main() {
	float s = uStory;
	// 14 % of the particles belong to the smaller galaxy.
	float isSat = step(aRand.x, 0.14);

	float wClump = smoothstep(0.08, 0.26, s);
	float wFall  = smoothstep(0.26, 0.40, s);
	float wDisc  = smoothstep(0.40, 0.54, s);
	float wArms  = smoothstep(0.54, 0.70, s);
	float wMerge = smoothstep(0.70, 0.86, s);
	float wBH    = smoothstep(0.56, 0.70, s);
	float wDeath = smoothstep(0.86, 1.00, s);

	// 0. stardust drifting on its own, centred on the SCREEN (uOrigin = where the
	// screen centre sits in the galaxy's own space, uInvScale undoes its scale).
	vec3 d = aDust * uInvScale + uOrigin + vec3(
		sin(uTime * 0.11 + aRand.x * 40.0),
		cos(uTime * 0.09 + aRand.x * 31.0),
		sin(uTime * 0.07 + aRand.x * 17.0)
	) * 0.22 * (1.0 - wClump);

	// 1. gravity gathers the stars into enormous clouds (slowly breathing)
	vec3 cl = aClump * uInvScale + uOrigin;
	cl += vec3(sin(uTime * 0.2 + aRand.w * 6.0), cos(uTime * 0.17 + aRand.w * 5.0), 0.0) * 0.12;
	vec3 p = mix(d, cl, wClump);

	// 2. the gas falls into the centre of the halo and starts to spin
	vec3 bc = mix(vec3(0.0), SAT, isSat);
	vec3 ball = mix(aDust * 0.22, SAT + aDust * 0.08, isSat);
	ball.xz = bc.xz + rot(wFall * 2.5 + uTime * 0.25) * (ball.xz - bc.xz);
	p = mix(p, ball, wFall);

	// 3. angular momentum flattens it into a disc, turning faster near the centre;
	// the spiral arms wind up as the density waves form.
	float rad = length(aGal.xz);
	vec3 disc = aGal;
	disc.xz = rot(-(1.0 - wArms) * rad * 1.9) * disc.xz;
	// it never stops turning, even with the scroll still: a nearly flat rotation curve
	disc.xz = rot(uTime * (0.16 + 0.05 / (0.5 + rad))) * disc.xz;
	vec3 satDisc = SAT + aGal * 0.3;
	satDisc.xz = SAT.xz + rot(uTime * 0.35) * (aGal.xz * 0.3);
	// 4. the smaller galaxy spirals in and is absorbed (a tidal lift on the way)
	vec3 satPath = mix(satDisc, disc, wMerge * wMerge);
	satPath.y += sin(wMerge * 3.14159) * 0.45 * (aRand.z - 0.3);
	vec3 home = mix(disc, satPath, isSat);
	p = mix(p, home, wDisc);

	// 5. the end: the outskirts drift away as the galaxy comes apart
	p = mix(p, p * (1.0 + 0.5 * aRand.z), wDeath * step(0.32, rad));

	// 5b. the closing: once every star is gone, hundreds of new ones fill the sky behind the
	// black hole and a third of them fall into a disc around it, turning faster the closer
	// they are. (uBH: 0 -> 1 over the last stretch of the scroll.)
	float wBHf = smoothstep(0.0, 0.3, uBH);
	float discSel = step(fract(aRand.x * 13.7), 0.3);
	float dr = 0.27 + 0.27 * pow(fract(aRand.x * 91.3), 1.6);
	float da = aRand.w * 6.2832 + uTime * 0.4 / pow(dr, 1.5);
	// falling in: the disc is swallowed (it spirals into the centre)
	dr *= 1.0 - 0.9 * smoothstep(0.0, 0.5, uFall);
	vec3 discPos = vec3(cos(da) * dr, (aRand.z - 0.5) * 0.03, sin(da) * dr);
	vec3 fieldPos = aDust * uInvScale + uOrigin;
	// the gas becomes a soft halo around the ring
	float ga = aRand.w * 6.2832 + uTime * 0.3;
	vec3 haloPos = vec3(cos(ga), (aRand.z - 0.5) * 0.08, sin(ga)) * (0.3 + 0.4 * fract(aRand.x * 53.1));
	p = mix(p, mix(mix(fieldPos, discPos, discSel), haloPos, uGas), wBHf);

	// 6. the Big Bang of the intro: out of one point, thrown out, then settling
	float eb = 1.0 - pow(1.0 - uBang, 5.0);
	p = uOrigin + (p - uOrigin) * eb;
	float bangFlash = exp(-pow((uBang - 0.04) * 16.0, 2.0));

	// the black hole: a dark centre inside a bright, fast ring (only once the
	// smaller galaxy has been absorbed does it count for the satellite's stars)
	float atHome = 1.0 - isSat * (1.0 - smoothstep(0.7, 0.9, wMerge));
	float hole = mix(mix(1.0, smoothstep(0.10, 0.24, rad), wBH * atHome), 1.0, wBHf);
	float ring = exp(-pow((rad - 0.30) / 0.07, 2.0)) * wBH * atHome;

	// the first stars: dim gas until each one ignites, with a flash as it does
	float igAt = 0.44 + aRand.w * 0.12;
	float ig = smoothstep(igAt, igAt + 0.03, s);
	float igFlash = exp(-pow((s - igAt - 0.015) * 55.0, 2.0));
	float gas = mix(1.0, mix(0.42, 1.0, ig), wFall);

	// the end: each star swells into a red giant, goes off as a supernova (a flash) and
	// is gone; a few faint remnants (white dwarfs) stay; the ring stays
	float dieAt = 0.87 + 0.11 * aRand.w;
	float giant = smoothstep(dieAt - 0.07, dieAt, s) * (1.0 - smoothstep(dieAt, dieAt + 0.015, s));
	float nova = exp(-pow((s - dieAt) * 85.0, 2.0));
	float remnant = step(0.955, fract(aRand.x * 7.31)) * 0.22;
	float alive = max(max(max(1.0 - smoothstep(dieAt, dieAt + 0.03, s), ring), remnant), wBHf);

	vMix = aRand.z;
	vRing = max(ring, discSel * wBHf);
	vGiant = giant;
	vSat = isSat * (1.0 - smoothstep(0.7, 0.9, wMerge));
	vFlash = clamp(bangFlash + igFlash * 0.9 + ring * 0.55 + nova * 1.1, 0.0, 1.6);
	float starAlpha = (0.55 + 0.45 * sin(uTime * 1.6 + aRand.w * 6.2832))
		* (0.4 + 0.6 * min(aRand.y / 2.0, 1.0))
		* gas * hole * alive * smoothstep(0.0, 0.02, uBang)
		// the side of the disc that turns toward us is brighter (relativistic beaming)
		* mix(1.0, 0.45 + 0.9 * (0.5 + 0.5 * sin(da)), discSel * wBHf)
		* mix(1.0, 1.0 - smoothstep(0.1, 0.5, uFall), discSel)
		* (1.0 - smoothstep(0.0, 0.3, uWorm));
	// the gas: huge soft clouds that gather, fall in and are used up as stars are born
	float gasAlpha = smoothstep(0.1, 0.24, s) * (1.0 - smoothstep(0.46, 0.66, s))
		* (0.55 + 0.45 * aRand.z) * smoothstep(0.0, 0.02, uBang)
		+ wBHf * 1.2 * smoothstep(0.0, 0.02, uBang) * (1.0 - smoothstep(0.0, 0.4, uFall));
	vAlpha = mix(starAlpha, gasAlpha * 0.11, uGas);

	vec4 mv = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * mv;

	// Gravitational lensing: the stars behind the black hole are bent around it. A point
	// mass sends a source at angle b to the image at (b + sqrt(b^2 + 4 e^2)) / 2, so nothing
	// shows inside the Einstein radius e (the shadow) and the stars lined up with the hole
	// pile into a bright ring around it.
	float lensMag = 1.0;
	float lens = wBHf * (1.0 - discSel) * (1.0 - uGas);
	if (lens > 0.0) {
		vec2 aspect = vec2(uAspect, 1.0);
		vec2 ndc = gl_Position.xy / gl_Position.w;
		vec2 rel = (ndc - uHoleNdc) * aspect;
		float b = max(length(rel), 0.0005);
		float th = 0.5 * (b + sqrt(b * b + 4.0 * uEin * uEin));
		lensMag = 1.0 + 1.8 * exp(-pow((th - uEin) / (uEin * 0.6), 2.0));
		ndc = uHoleNdc + (rel * (th / b)) / aspect;
		gl_Position.xy = mix(gl_Position.xy, ndc * gl_Position.w, lens);
		lensMag = mix(1.0, lensMag, lens);
	}
	// Falling in: every field star streams out of the hole along a spiral, small and faint
	// at first and big and fast as it passes you (hyperspace tunnel). Each one loops.
	float fallw = smoothstep(0.0, 0.12, uFall) * (1.0 - discSel) * (1.0 - uGas) * (1.0 - smoothstep(0.0, 0.3, uWorm));
	float tt = fract(aRand.x * 7.31 + uFall * 2.6);
	if (fallw > 0.0) {
		float ang = aRand.w * 6.2832 + (1.0 - tt) * 2.4 * uFall;
		// the stars are born at the rim of the black disc, which swells with the fall
		float rr = uEin * 0.95 + 1.7 * tt * tt * tt;
		vec2 nd = uHoleNdc + vec2(cos(ang), sin(ang)) * rr / vec2(uAspect, 1.0);
		gl_Position.xy = mix(gl_Position.xy, nd * gl_Position.w, fallw);
		vAlpha *= mix(1.0, smoothstep(0.0, 0.1, tt) * (1.0 - smoothstep(0.9, 1.0, tt)) * 1.6, fallw);
		lensMag = mix(lensMag, 0.5 + 5.5 * tt * tt, fallw);
	}
	vTunnel = tt * fallw;
	float size = lensMag * (1.0 + discSel * wBHf * 1.4) * aRand.y * uPixel * (6.0 / -mv.z) * (1.0 + vFlash * 1.6) * (1.0 + ring * 0.8) * (1.0 + giant * 1.5 + nova * 2.0);
	gl_PointSize = mix(clamp(size, 1.0, 26.0), clamp(size * 11.0, 24.0, 150.0), uGas);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uCore;
uniform vec3 uArm;
uniform vec3 uHot;
uniform vec3 uStar;
uniform vec3 uEmber;
uniform float uStory;
uniform float uGas;
uniform float uBH;
uniform float uOpacity;
varying float vMix;
varying float vFlash;
varying float vAlpha;
varying float vRing;
varying float vGiant;
varying float vSat;
varying float vTunnel;

void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	float a = pow(1.0 - d * 2.0, mix(2.2, 1.3, uGas));
	vec3 col = mix(uCore, uArm, smoothstep(0.0, 0.6, vMix));
	col = mix(col, uStar, smoothstep(0.78, 1.0, vMix));
	// the gas that falls in is hot, and cools as it sinks
	float heat = smoothstep(0.24, 0.34, uStory) * (1.0 - smoothstep(0.34, 0.5, uStory));
	col = mix(col, uHot, heat * 0.8);
	col = mix(col, uHot, clamp(vFlash, 0.0, 1.0) * 0.7);
	col = mix(col, uHot, vRing * 0.8);
	// the smaller galaxy is a paler, cooler white-violet until it is absorbed
	col = mix(col, uStar, vSat * 0.75);
	// the end: embers, red giants before they go off (the black hole's ring keeps its glow)
	// the tunnel: light from ahead is blue-shifted, light from behind red-shifted
	col = mix(col, mix(uEmber, uArm, step(0.5, vMix)), vTunnel * 0.75);
	col = mix(col, uHot, vTunnel * vTunnel * 0.55);
	float death = smoothstep(0.86, 1.0, uStory);
	col = mix(col, uEmber, max(death * (1.0 - vRing), vGiant));
	// the gas: hot white-orange while it falls, cooling to the violet of the arms
	vec3 gasCol = mix(mix(uHot, uEmber, 0.35), uArm, smoothstep(0.26, 0.5, uStory));
	// around the black hole the halo glows hot, like the disc
	gasCol = mix(gasCol, mix(uHot, uEmber, 0.45), uBH);
	col = mix(col, gasCol, uGas);
	gl_FragColor = vec4(col, a * vAlpha * uOpacity * (1.0 + vFlash));
}
`;

/* ---------- mount ---------- */
const mountGalaxy = (wrap: HTMLDivElement) => {
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const small = window.matchMedia("(max-width: 767px)").matches;
	const count = small ? 4500 : 9500;

	const renderer = new WebGLRenderer({ alpha: true, antialias: false });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
	renderer.setClearColor(0x000000, 0);
	wrap.appendChild(renderer.domElement);

	const scene = new Scene();
	const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
	camera.position.set(0, 0, CAMERA_Z);

	const makeMaterial = (gas: number) =>
		new ShaderMaterial({
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			transparent: true,
			depthWrite: false,
			blending: AdditiveBlending,
			uniforms: {
				uGas: { value: gas },
				uBH: { value: 0 },
				uFall: { value: 0 },
				uWorm: { value: 0 },
				uHoleNdc: { value: new Vector2() },
				uEin: { value: 0.2 },
				uAspect: { value: 1 },
				uTime: { value: 0 },
				uStory: { value: 0 },
				uBang: { value: 1 },
				uPixel: { value: renderer.getPixelRatio() * 2.4 },
				uOrigin: { value: new Vector3() },
				uInvScale: { value: 1 },
				uOpacity: { value: 0 },
				uCore: { value: new Color() },
				uArm: { value: new Color() },
				uHot: { value: new Color() },
				uStar: { value: new Color() },
				uEmber: { value: new Color() },
				uPortal: { value: new Color() },
			},
		});
	const material = makeMaterial(0);
	const gasMaterial = makeMaterial(1);
	applyPalette(material);
	applyPalette(gasMaterial);

	const wormMaterial = new ShaderMaterial({
		vertexShader: WORM_VERTEX,
		fragmentShader: WORM_FRAGMENT,
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: {
			uWorm: { value: 0 },
			uLc: { value: -WORM_L },
			uWarm: { value: new Color() },
			uCold: { value: new Color() },
			uHot: { value: new Color() },
		},
	});
	const wormGeometry = buildWormhole(small ? 56 : 90, small ? 28 : 44);
	const wormhole = new LineSegments(wormGeometry, wormMaterial);
	wormhole.frustumCulled = false;
	wormhole.visible = false;
	wormhole.renderOrder = 2;
	scene.add(wormhole);
	// The Penrose diagram, in screen space (no camera), over the stars and under the wormhole.
	const penMaterial = new ShaderMaterial({
		vertexShader: PEN_VERTEX,
		fragmentShader: PEN_FRAGMENT,
		transparent: true,
		depthWrite: false,
		depthTest: false,
		blending: AdditiveBlending,
		uniforms: {
			uZoom: { value: 1 },
			uAspect: { value: 1 },
			uPen: { value: 0 },
			uTop: { value: new Color() },
			uBottom: { value: new Color() },
			uHot: { value: new Color() },
		},
	});
	const penGeometry = buildPenrose();
	const penrose = new LineSegments(penGeometry, penMaterial);
	penrose.frustumCulled = false;
	penrose.visible = false;
	penrose.renderOrder = 3;
	scene.add(penrose);
	const paintWormhole = () => {
		const w = wormMaterial.uniforms;
		w.uWarm.value.copy(material.uniforms.uEmber.value);
		w.uCold.value.copy(material.uniforms.uPortal.value);
		w.uHot.value.copy(material.uniforms.uHot.value);
		const pen = penMaterial.uniforms;
		pen.uTop.value.copy(material.uniforms.uPortal.value);
		pen.uBottom.value.copy(material.uniforms.uArm.value);
		pen.uHot.value.copy(material.uniforms.uHot.value);
	};
	paintWormhole();

	const geometry = buildGeometry(count);
	const points = new Points(geometry, material);
	points.frustumCulled = false;
	// The gas: a few hundred huge, soft points under the stars (drawn first).
	const gasGeometry = buildGeometry(small ? 140 : 280, 20260607);
	const gasPoints = new Points(gasGeometry, gasMaterial);
	gasPoints.frustumCulled = false;
	gasPoints.renderOrder = 0;
	points.renderOrder = 1;
	const group = new Group();
	group.rotation.x = 0.95;
	group.add(gasPoints);
	group.add(points);
	scene.add(group);

	let width = 1;
	let height = 1;
	const resize = () => {
		width = wrap.clientWidth || window.innerWidth;
		height = wrap.clientHeight || window.innerHeight;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};
	resize();
	const ro = new ResizeObserver(resize);
	ro.observe(wrap);

	// Pointer lean (smoothed).
	const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
	const onPointer = (e: PointerEvent) => {
		pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
	};
	if (!reduce)
		window.addEventListener("pointermove", onPointer, { passive: true });

	const start = performance.now();
	let last = start;
	let time = 0;
	let raf = 0;

	const draw = (now: number) => {
		const dt = Math.min((now - last) / 1000, 0.1);
		last = now;
		if (!reduce) time += dt;

		// If the scroll engine never starts (error, blocked script) do not leave the
		// viewer with dust forever: show the healthy galaxy, still, like reduced motion.
		const engineDown = !reduce && !window.__motionReady && now - start > 5000;
		const story = reduce || engineDown ? PEAK : galaxyState.story;

		const intro = reduce ? 1 : Math.min((now - start) / 1800, 1);
		const bang = reduce ? 1 : galaxyState.bang;
		// The closing: the black hole alone, lifted toward the viewer (0 -> 1).
		const hole = reduce || engineDown ? 0 : galaxyState.hole;
		const fall = reduce || engineDown ? 0 : galaxyState.fall;
		const worm = reduce || engineDown ? 0 : galaxyState.worm;
		wrap.style.setProperty(
			"--hole-exit",
			reduce ? "0" : String(galaxyState.exit),
		);
		for (const m of [material, gasMaterial]) {
			const mu = m.uniforms;
			mu.uTime.value = time;
			mu.uStory.value = story;
			mu.uBang.value = bang;
			mu.uOpacity.value = intro;
			mu.uBH.value = hole;
			mu.uFall.value = fall;
			mu.uWorm.value = worm;
		}
		const u = material.uniforms;

		// Where the galaxy sits. While the clouds gather and the galaxy forms, the
		// epicentre is the empty space to the right of the statement ("Que hago"
		// reads from the left), a little smaller so its arms stop short of the text;
		// on phones there is no free side, so it sits low and small.
		const visH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
		const visW = visH * camera.aspect;
		const side = small
			? { x: 0.14, y: -0.3, s: 0.55 }
			: { x: 0.31, y: -0.06, s: 0.78 };
		// The epilogue: the galaxy goes to the middle of an empty stage and, in the open,
		// merges with a smaller one and dies (the page content is not there). On a phone
		// the stage is narrow: it shrinks to fit.
		const stage = {
			x: 0,
			y: 0.04 * (1 - smooth(0, 0.6, galaxyState.hole)),
			s: Math.min(0.92, visW / 8.2),
		};
		// Slowly: it takes the whole stretch up to the epilogue to settle in the middle.
		const e = smooth(EPILOGUE_FROM - 0.24, EPILOGUE_FROM, story);
		group.position.set(
			(side.x + (stage.x - side.x) * e) * visW,
			(side.y + (stage.y - side.y) * e) * visH,
			0,
		);
		// The black hole comes toward you, like a cup lifted off the table: first it lies
		// flat (almost edge-on), then it tilts up until you look straight into it.
		const lay = smooth(0, 0.22, hole);
		const lift = smooth(0.22, 0.85, hole);
		const base =
			(side.s + (stage.s - side.s) * e) *
			(1 + 2.1 * smooth(0.05, 1, hole)) *
			// falling in: the hole swells until it fills the whole screen
			(1 + 9 * smooth(0, 1, fall) ** 2);
		group.scale.setScalar(base);
		// rotation.x: 0 = the disc seen edge-on, PI/2 = seen straight on.
		const tilt = 0.95 - 0.83 * lay + 1.33 * lift;

		pointer.sx += (pointer.x - pointer.sx) * 0.04;
		pointer.sy += (pointer.y - pointer.sy) * 0.04;
		group.rotation.x = tilt + pointer.sy * 0.12;
		group.rotation.z = pointer.sx * 0.1;

		// Where the screen centre lies in the galaxy's own space (for the dust).
		group.updateMatrixWorld(true);
		group.worldToLocal(u.uOrigin.value.set(0, 0, 0));
		u.uInvScale.value = 1 / base;
		// Where the hole is on the screen and how big its shadow is (for the lensing).
		const ndc = group.position.clone().project(camera);
		for (const m of [material, gasMaterial]) {
			m.uniforms.uHoleNdc.value.set(ndc.x, ndc.y);
			m.uniforms.uEin.value = (2 * 0.25 * base) / visH;
			m.uniforms.uAspect.value = camera.aspect;
		}
		// Crossing the wormhole: the camera coordinate runs from the black hole's mouth to the
		// white hole's.
		// The Penrose diagram rushes toward you as you fall and gives way to the tunnel.
		const view = penroseView(fall, worm);
		penrose.visible = view.alpha > 0;
		penMaterial.uniforms.uPen.value = view.alpha;
		penMaterial.uniforms.uAspect.value = camera.aspect;
		penMaterial.uniforms.uZoom.value = view.zoom;
		wormhole.visible = worm > 0 && worm < 1;
		wormMaterial.uniforms.uWorm.value = worm;
		wormMaterial.uniforms.uLc.value = -WORM_L * 0.85 + worm * WORM_L * 1.7;

		renderer.render(scene, camera);
	};

	const loop = (now: number) => {
		draw(now);
		raf = requestAnimationFrame(loop);
	};
	const startLoop = () => {
		if (raf || reduce) return;
		last = performance.now();
		raf = requestAnimationFrame(loop);
	};
	const stopLoop = () => {
		cancelAnimationFrame(raf);
		raf = 0;
	};
	const onVisibility = () => (document.hidden ? stopLoop() : startLoop());
	document.addEventListener("visibilitychange", onVisibility);

	// Theme switch: re-read the tokens.
	const mo = new MutationObserver(() => {
		applyPalette(material);
		applyPalette(gasMaterial);
		paintWormhole();
		if (reduce) draw(performance.now());
	});
	mo.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});

	if (reduce) draw(performance.now());
	else startLoop();

	return () => {
		stopLoop();
		ro.disconnect();
		mo.disconnect();
		document.removeEventListener("visibilitychange", onVisibility);
		window.removeEventListener("pointermove", onPointer);
		geometry.dispose();
		gasGeometry.dispose();
		wormGeometry.dispose();
		penGeometry.dispose();
		penMaterial.dispose();
		wormMaterial.dispose();
		material.dispose();
		gasMaterial.dispose();
		renderer.dispose();
		renderer.domElement.remove();
	};
};

export const ParticleGalaxy = () => {
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!wrapRef.current) return;
		try {
			return mountGalaxy(wrapRef.current);
		} catch (err) {
			// No WebGL: the SVG cosmos layer still gives the page its sky.
			console.warn("Particle galaxy disabled:", err);
		}
	}, []);

	return <div ref={wrapRef} data-galaxy aria-hidden="true" />;
};
