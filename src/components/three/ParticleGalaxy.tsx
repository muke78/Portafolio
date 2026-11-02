import { useEffect, useRef } from "react";
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	Group,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Vector3,
	WebGLRenderer,
} from "three";
import { galaxyState } from "@/lib/galaxyState";

/**
 * PARTICLE GALAXY - an original particle system (no third-party model,
 * texture or code).
 *
 * One draw call of GPU points, every position computed in the vertex shader
 * from two stored layouts per particle:
 *
 *   dust    a loose cloud of stardust around the viewer
 *   galaxy  a three-armed logarithmic spiral with a dense bulge and a thin
 *           disc, generated here from a seeded random sequence
 *
 * The scroll (galaxyState, scrubbed by src/lib/motion/galaxy.ts) blends them:
 * the dust drifts on its own, is then pulled inward along a swirl, collapses
 * to a point and explodes outward into the spiral (a flash of the "hot"
 * colour at the instant of the blast). Once formed, the galaxy rotates
 * differentially (the inside turns faster than the rim) and leans a little
 * toward the pointer.
 *
 * Colours are read from the --galaxy-* tokens in app.css and re-read when the
 * theme class on <html> changes. With prefers-reduced-motion the finished
 * galaxy is drawn still (no loop). The loop also stops while the tab is
 * hidden.
 */

const CAMERA_Z = 7;
const FOV = 50;
const GALAXY_RADIUS = 3.3;
const ARMS = 3;

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
};

/* ---------- geometry ---------- */
const buildGeometry = (count: number) => {
	const rnd = seeded(20251101);
	const dust = new Float32Array(count * 3);
	const gal = new Float32Array(count * 3);
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
	geometry.setAttribute("aRand", new BufferAttribute(rand, 4));
	// position is required by three even though the shader ignores it.
	geometry.setAttribute(
		"position",
		new BufferAttribute(new Float32Array(count * 3), 3),
	);
	return geometry;
};

/* ---------- shaders ---------- */
const VERTEX = /* glsl */ `
attribute vec3 aDust;
attribute vec3 aGal;
attribute vec4 aRand;
uniform float uTime;
uniform float uBurst;
uniform float uPixel;
uniform vec3 uOrigin;
uniform float uInvScale;
varying float vMix;
varying float vFlash;
varying float vAlpha;

mat2 rot(float a) {
	float s = sin(a), c = cos(a);
	return mat2(c, -s, s, c);
}

void main() {
	float gather = smoothstep(0.0, 0.58, uBurst);
	float boom = smoothstep(0.58, 1.0, uBurst);

	// 1. stardust drifting on its own. The cloud stays centred on the SCREEN
	// (uOrigin = where the screen centre sits in the galaxy's own space, uInvScale
	// undoes its scale) even though the galaxy itself is placed off to the side.
	vec3 d = aDust * uInvScale + uOrigin + vec3(
		sin(uTime * 0.11 + aRand.x * 40.0),
		cos(uTime * 0.09 + aRand.x * 31.0),
		sin(uTime * 0.07 + aRand.x * 17.0)
	) * 0.22 * (1.0 - gather);

	// 2. pulled inward along a swirl until it is almost a point
	float pull = pow(gather, 1.6);
	vec3 c = d * (1.0 - 0.97 * pull);
	c.xz = rot(pull * 4.5 * (1.2 - aRand.x * 0.4)) * c.xz;

	// 3. the spiral, turning faster near the centre than at the rim
	float rad = length(aGal.xz);
	vec3 g = aGal;
	g.xz = rot(uTime * 0.12 / (0.6 + rad)) * g.xz;

	// 4. the blast: out with a little overshoot, then home
	float e = 1.0 - pow(1.0 - boom, 4.0);
	float over = sin(boom * 3.14159) * 0.35 * aRand.x;
	vec3 pos = mix(c, g * (1.0 + over), e);

	float flash = exp(-pow((uBurst - 0.62) * 9.0, 2.0));
	vMix = aRand.z;
	vFlash = flash;
	vAlpha = (0.55 + 0.45 * sin(uTime * 1.6 + aRand.w * 6.2832)) * (0.4 + 0.6 * min(aRand.y / 2.0, 1.0));

	vec4 mv = modelViewMatrix * vec4(pos, 1.0);
	gl_Position = projectionMatrix * mv;
	gl_PointSize = clamp(aRand.y * uPixel * (6.0 / -mv.z) * (1.0 + flash * 1.6), 1.0, 22.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uCore;
uniform vec3 uArm;
uniform vec3 uHot;
uniform vec3 uStar;
uniform float uOpacity;
varying float vMix;
varying float vFlash;
varying float vAlpha;

void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	float a = pow(1.0 - d * 2.0, 2.2);
	vec3 col = mix(uCore, uArm, smoothstep(0.0, 0.6, vMix));
	col = mix(col, uStar, smoothstep(0.78, 1.0, vMix));
	col = mix(col, uHot, vFlash * 0.7);
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

	const material = new ShaderMaterial({
		vertexShader: VERTEX,
		fragmentShader: FRAGMENT,
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uBurst: { value: 0 },
			uPixel: { value: renderer.getPixelRatio() * 2.4 },
			uOrigin: { value: new Vector3() },
			uInvScale: { value: 1 },
			uOpacity: { value: 0 },
			uCore: { value: new Color() },
			uArm: { value: new Color() },
			uHot: { value: new Color() },
			uStar: { value: new Color() },
		},
	});
	applyPalette(material);

	const geometry = buildGeometry(count);
	const points = new Points(geometry, material);
	points.frustumCulled = false;
	const group = new Group();
	group.rotation.x = 0.95;
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

		// If the scroll engine never starts (error, blocked script) do not
		// leave the viewer with dust forever: show the finished galaxy.
		const engineDown = !reduce && !window.__motionReady && now - start > 5000;
		const burst = reduce || engineDown ? 1 : galaxyState.burst;
		const settle = reduce || engineDown ? 1 : galaxyState.settle;

		const intro = reduce ? 1 : Math.min((now - start) / 1800, 1);
		const u = material.uniforms;
		u.uTime.value = time;
		u.uBurst.value = burst;
		u.uOpacity.value = intro * (1 - 0.42 * settle);

		// Where the galaxy sits. While the dust gathers and blasts, the epicentre
		// is the empty space to the right of the statement ("Qué hago" reads
		// from the left), a little smaller so its arms stop short of the text;
		// then it drifts to the lower-right corner, smaller still. On phones
		// there is no free side, so it sits low and small.
		const visH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
		const visW = visH * camera.aspect;
		const rest = small
			? { x: 0.16, y: -0.2, s: 0.7 }
			: { x: 0.3, y: -0.24, s: 0.62 };
		const blast = small
			? { x: 0.14, y: -0.3, s: 0.55 }
			: { x: 0.31, y: -0.06, s: 0.78 };
		const e = settle * settle * (3 - 2 * settle);
		group.position.set(
			(blast.x + (rest.x - blast.x) * e) * visW,
			(blast.y + (rest.y - blast.y) * e) * visH,
			0,
		);
		const base = blast.s + (rest.s - blast.s) * e;
		group.scale.setScalar(base);

		pointer.sx += (pointer.x - pointer.sx) * 0.04;
		pointer.sy += (pointer.y - pointer.sy) * 0.04;
		group.rotation.x = 0.95 + pointer.sy * 0.12;
		group.rotation.z = pointer.sx * 0.1;

		// Where the screen centre lies in the galaxy's own space (for the dust).
		group.updateMatrixWorld(true);
		group.worldToLocal(u.uOrigin.value.set(0, 0, 0));
		u.uInvScale.value = 1 / base;

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
		material.dispose();
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
