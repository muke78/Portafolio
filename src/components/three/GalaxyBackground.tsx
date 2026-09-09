import { useEffect, useRef } from "react";
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Color,
	Group,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Sprite,
	SpriteMaterial,
	WebGLRenderer,
} from "three";

/**
 * GALAXY 3D — Three.js showpiece.
 * Ported from a vanilla-JS prototype (galaxy3d.js) into a React island,
 * then reworked for a richer look:
 *  · A real baked-in spiral (spinAngle grows with radius, like the
 *    classic log-spiral galaxy generator) instead of straight spokes,
 *    plus a slow differential drift on top for gentle live motion.
 *  · A flattened disc (vertical scatter shrinks toward the rim, thick
 *    only near the bulge) instead of a fluffy sphere.
 *  · A soft bloom-style halo layer behind the crisp star layer, and a
 *    canvas-gradient nucleus glow sprite at the core.
 *  · A sparse ambient starfield layer around the galaxy for depth.
 *  · Per-particle size/brightness variance (denser + brighter near the
 *    core, like a real bulge), a smooth radial falloff, and twinkle.
 *
 * Behaviour:
 *  · On load → fades in full-viewport behind the hero, spinning to
 *    show itself off.
 *  · On scroll → shrinks toward the lower-right corner.
 *  · Approaching the footer's big "Khelde" wordmark → rises back up,
 *    centered, like a sunset behind the word.
 *
 * Named imports (not `import * as THREE`/dynamic `import("three")`)
 * are deliberate: three ships as one ~700KB monolithic ESM file, and
 * only named-binding imports let Rollup tree-shake the loaders/
 * controls/post-processing/etc. this component never touches. This
 * component only ever mounts from a client:idle island, so Astro's
 * own idle-gated island loading already keeps it off the critical
 * path - a manual dynamic import here bought no extra deferral, just
 * an opaque `any`-typed namespace object that defeated tree-shaking.
 */
export const GalaxyBackground = () => {
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (!wrapRef.current) return;

		const cleanup = mountGalaxy(wrapRef.current);
		return cleanup;
	}, []);

	return (
		<div
			ref={wrapRef}
			id="galaxy-3d"
			aria-hidden="true"
			style={{ opacity: 0, transform: "translate(0, 0) scale(0.55)" }}
		/>
	);
};

const VERTEX_SHADER = /* glsl */ `
  attribute float aRadiusRatio;
  attribute float aBranch;
  attribute vec3 aOffset;
  attribute float aSize;
  attribute float aTwinkle;
  uniform float uTime;
  uniform float uSize;
  uniform vec3 uColorInside;
  uniform vec3 uColorOutside;
  uniform vec3 uColorHot;
  varying vec3 vColor;
  varying float vTwinklePhase;

  void main() {
    float radius = pow(aRadiusRatio, 1.5) * 4.0;
    float branchAngle = aBranch * 6.2831853 / 4.0;
    // Baked-in log-spiral twist: angle grows with radius so each branch
    // curves outward instead of staying a straight spoke. A slow drift
    // (damped toward the rim) rides on top for gentle live motion.
    float spinAngle = radius * 1.0;
    float drift = uTime * 0.12 * (1.0 - aRadiusRatio * 0.7);
    float angle = branchAngle + spinAngle + drift;

    vec3 pos = vec3(cos(angle), 0.0, sin(angle)) * radius;
    pos += aOffset;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float twinkle = 0.75 + 0.35 * sin(uTime * 6.0 + aTwinkle * 6.2831853);
    gl_PointSize = uSize * aSize * twinkle * (1.0 / -mvPosition.z);

    float mixT = 1.0 - pow(1.0 - aRadiusRatio, 2.0);
    vec3 base = mix(uColorInside, uColorOutside, mixT);
    // Sprinkle a few hot-white core sparks in close to the center.
    float hotBias = smoothstep(0.06, 0.0, aRadiusRatio) * step(0.985, aTwinkle);
    vColor = mix(base, uColorHot, hotBias);
    vTwinklePhase = twinkle;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinklePhase;
  uniform float uOpacity;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    float alpha = pow(clamp(1.0 - d, 0.0, 1.0), 2.2);
    if (alpha <= 0.002) discard;
    gl_FragColor = vec4(vColor, alpha * uOpacity * vTwinklePhase);
  }
`;

// Ambient starfield around the galaxy - plain points scattered in a big
// sphere, no spiral math, just twinkle. Cheap way to add depth so the
// galaxy reads as sitting in space instead of floating on flat black.
const STAR_VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aTwinkle;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * aSize * (1.0 / -mvPosition.z);
    float twinkle = 0.5 + 0.5 * sin(uTime * 2.4 + aTwinkle * 6.2831853);
    vAlpha = 0.35 + 0.55 * twinkle;
  }
`;

const STAR_FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  uniform float uOpacity;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    float alpha = pow(clamp(1.0 - d, 0.0, 1.0), 2.2);
    if (alpha <= 0.003) discard;
    gl_FragColor = vec4(0.86, 0.88, 0.99, alpha * uOpacity * vAlpha);
  }
`;

function makeGlowTexture() {
	const size = 128;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	const gradient = ctx.createRadialGradient(
		size / 2,
		size / 2,
		0,
		size / 2,
		size / 2,
		size / 2,
	);
	gradient.addColorStop(0, "rgba(255,255,255,1)");
	gradient.addColorStop(0.22, "rgba(255,222,192,0.65)");
	gradient.addColorStop(0.55, "rgba(140,92,255,0.22)");
	gradient.addColorStop(1, "rgba(140,92,255,0)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);
	const tex = new CanvasTexture(canvas);
	tex.needsUpdate = true;
	return tex;
}

function mountGalaxy(wrap: HTMLDivElement) {
	const renderer = new WebGLRenderer({
		alpha: true,
		antialias: true,
		powerPreference: "high-performance",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setClearColor(0x000000, 0);
	wrap.appendChild(renderer.domElement);

	const scene = new Scene();
	const camera = new PerspectiveCamera(50, 1, 0.1, 100);
	camera.position.set(4.6, 3.2, 6.8);
	camera.lookAt(0, 0, 0);

	const isMobile = window.innerWidth < 768;
	const count = isMobile ? 13000 : 26000;
	const branches = 4;
	// Real spiral galaxies aren't perfectly symmetric - a couple of arms
	// usually dominate ("grand design") while the others are fainter.
	// Weighting branch picks instead of a flat i % branches gives that
	// same organic imbalance instead of a too-tidy pinwheel.
	const branchWeights = [1, 0.62, 0.82, 0.46];
	const branchWeightSum = branchWeights.reduce((a, b) => a + b, 0);
	const pickBranch = () => {
		let r = Math.random() * branchWeightSum;
		for (let b = 0; b < branches; b++) {
			r -= branchWeights[b];
			if (r <= 0) return b;
		}
		return branches - 1;
	};

	const aRadiusRatio = new Float32Array(count);
	const aBranch = new Float32Array(count);
	const aOffset = new Float32Array(count * 3);
	const aSize = new Float32Array(count);
	const aTwinkle = new Float32Array(count);

	for (let i = 0; i < count; i++) {
		// Bias more particles toward the core for a proper bright bulge.
		const radiusRatio = Math.random() ** 1.7;
		aRadiusRatio[i] = radiusRatio;
		// Slight per-particle angular jitter on top of the branch index so
		// arms aren't perfectly clean lines - a bit of flocculent texture.
		aBranch[i] = pickBranch() + (Math.random() - 0.5) * 0.05;

		// Horizontal scatter around the branch line - tight near the core,
		// looser toward the rim so each arm reads as a swarm of stars
		// instead of a wire.
		const spread = 0.05 + radiusRatio * 0.4;
		const rx = (Math.random() * 2 - 1) ** 3 * spread;
		const rz = (Math.random() * 2 - 1) ** 3 * spread;
		aOffset[i * 3 + 0] = rx;
		aOffset[i * 3 + 2] = rz;

		// Vertical scatter - flattened disc: thick bulge near the core,
		// paper-thin out along the arms, like a real spiral galaxy.
		const thickness = 0.24 * (1 - radiusRatio) ** 2 + 0.015;
		aOffset[i * 3 + 1] = (Math.random() * 2 - 1) * thickness;

		// Bigger, brighter particles near the core; small dim ones out
		// in the arms/halo - gives depth instead of one flat size.
		aSize[i] = 0.35 + (1 - radiusRatio) * 1.5 + Math.random() * 0.5;
		aTwinkle[i] = Math.random();
	}

	const geo = new BufferGeometry();
	geo.setAttribute(
		"position",
		new BufferAttribute(new Float32Array(count * 3), 3),
	);
	geo.setAttribute("aRadiusRatio", new BufferAttribute(aRadiusRatio, 1));
	geo.setAttribute("aBranch", new BufferAttribute(aBranch, 1));
	geo.setAttribute("aOffset", new BufferAttribute(aOffset, 3));
	geo.setAttribute("aSize", new BufferAttribute(aSize, 1));
	geo.setAttribute("aTwinkle", new BufferAttribute(aTwinkle, 1));

	const colors = {
		uColorInside: { value: new Color("#FFC896") },
		uColorOutside: { value: new Color("#8C5CFF") },
		uColorHot: { value: new Color("#FFFFFF") },
	};

	// Crisp core layer - small, sharp, bright.
	const matCore = new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uSize: { value: 20.0 },
			uOpacity: { value: 1.0 },
			...colors,
		},
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
	});

	// Soft halo layer - same particles, larger + dimmer, gives a
	// cheap bloom-like glow without a postprocessing pipeline.
	const matHalo = new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uSize: { value: 58.0 },
			uOpacity: { value: 0.16 },
			...colors,
		},
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
	});

	const pointsCore = new Points(geo, matCore);
	const pointsHalo = new Points(geo, matHalo);

	// Ambient starfield - sparse points scattered in a big sphere around
	// the galaxy, no spiral math, just gentle twinkle. Adds depth so the
	// galaxy reads as sitting in space rather than floating on flat black.
	const starCount = isMobile ? 900 : 1800;
	const starPositions = new Float32Array(starCount * 3);
	const starSize = new Float32Array(starCount);
	const starTwinkle = new Float32Array(starCount);
	for (let i = 0; i < starCount; i++) {
		const r = 6 + Math.random() ** 0.5 * 9;
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(Math.random() * 2 - 1);
		starPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
		starPositions[i * 3 + 1] = r * Math.cos(phi);
		starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
		starSize[i] = 0.4 + Math.random() * 1.1;
		starTwinkle[i] = Math.random();
	}
	const starGeo = new BufferGeometry();
	starGeo.setAttribute("position", new BufferAttribute(starPositions, 3));
	starGeo.setAttribute("aSize", new BufferAttribute(starSize, 1));
	starGeo.setAttribute("aTwinkle", new BufferAttribute(starTwinkle, 1));
	const matStars = new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uSize: { value: 14.0 },
			uOpacity: { value: 0.55 },
		},
		vertexShader: STAR_VERTEX_SHADER,
		fragmentShader: STAR_FRAGMENT_SHADER,
	});
	const pointsStars = new Points(starGeo, matStars);

	// Soft nucleus glow - a camera-facing sprite with a radial-gradient
	// canvas texture, sitting right at the core for an actual bright
	// "galactic bulge" glow instead of just dense points.
	const glowTexture = makeGlowTexture();
	const coreGlow = glowTexture
		? new Sprite(
				new SpriteMaterial({
					map: glowTexture,
					transparent: true,
					depthWrite: false,
					blending: AdditiveBlending,
					opacity: 0.72,
				}),
			)
		: null;
	// Smaller/dimmer than the first pass - reads as a glowing nucleus
	// instead of a flashlight blown across the frame, and leaves more
	// of the hero text readable without leaning on the scrim alone.
	if (coreGlow) coreGlow.scale.set(1.9, 1.9, 1);

	const galaxyGroup = new Group();
	galaxyGroup.rotation.x = 0.58;
	galaxyGroup.add(pointsHalo);
	galaxyGroup.add(pointsCore);
	scene.add(galaxyGroup);
	scene.add(pointsStars);
	if (coreGlow) scene.add(coreGlow);

	function resize() {
		const w = wrap.clientWidth;
		const h = wrap.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	resize();
	window.addEventListener("resize", resize);

	const ENTRY_DELAY = 200;
	const ENTRY_DURATION = 2400;
	const startTs = performance.now();

	const easeOut = (t: number) => 1 - (1 - t) ** 3;
	const easeInOut = (t: number) =>
		t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
	const clamp = (v: number, a: number, b: number) =>
		Math.max(a, Math.min(b, v));
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	let wordmark: HTMLElement | null = null;
	const findWordmark = () => {
		wordmark = document.querySelector(".wordmark-reveal");
	};
	findWordmark();
	const findTimer = wordmark ? null : window.setTimeout(findWordmark, 800);

	// Rest position is nudged right/down from dead-center so the bright
	// core sits nearer the portrait column (desktop) instead of square
	// behind the headline/description - the text scrim in Header.astro
	// covers the rest. Scroll still carries it on to the corner as before.
	const restTxVw = 16;
	const restTyVh = 3;
	const cornerTxVw = 36;
	const cornerTyVh = 38;
	const cornerScale = 0.22;
	const sunsetScale = 2.0;

	let rafId = 0;

	function update(time: number) {
		const elapsed = time - startTs;
		const entryT = clamp((elapsed - ENTRY_DELAY) / ENTRY_DURATION, 0, 1);
		const e = easeOut(entryT);

		const vh = window.innerHeight;
		const scrollY = window.scrollY || 0;

		const phaseA = clamp(scrollY / (vh * 0.9), 0, 1);
		const aTxVw = lerp(restTxVw, cornerTxVw, phaseA);
		const aTyVh = lerp(restTyVh, cornerTyVh, phaseA);
		const aScale = 1 - phaseA * (1 - cornerScale);

		let phaseB = 0;
		let sunsetTyVh = 0;
		if (wordmark) {
			const rect = wordmark.getBoundingClientRect();
			phaseB = easeInOut(clamp(1 - (rect.top - vh * 0.55) / (vh * 0.7), 0, 1));
			sunsetTyVh = (rect.top / vh - 0.5) * 100;
		}

		const finalScale = lerp(aScale, sunsetScale, phaseB);
		const finalTxVw = lerp(aTxVw, 0, phaseB);
		const finalTyVh = lerp(aTyVh, sunsetTyVh, phaseB);

		const entryScale = 0.55 + 0.45 * e;
		const totalScale = finalScale * entryScale;

		wrap.style.transform = `translate(${finalTxVw}vw, ${finalTyVh}vh) scale(${totalScale})`;
		wrap.style.opacity = e.toFixed(3);

		const tSec = elapsed / 1000;
		const entrySpin = (1 - e) * 1.6;
		matCore.uniforms.uTime.value = tSec * 0.45;
		matHalo.uniforms.uTime.value = tSec * 0.45;
		matStars.uniforms.uTime.value = tSec;
		galaxyGroup.rotation.y = tSec * 0.04 + entrySpin;

		renderer.render(scene, camera);
		rafId = requestAnimationFrame(update);
	}
	rafId = requestAnimationFrame(update);

	return () => {
		cancelAnimationFrame(rafId);
		if (findTimer) window.clearTimeout(findTimer);
		window.removeEventListener("resize", resize);
		geo.dispose();
		matCore.dispose();
		matHalo.dispose();
		starGeo.dispose();
		matStars.dispose();
		glowTexture?.dispose();
		coreGlow?.material.dispose();
		renderer.dispose();
		wrap.removeChild(renderer.domElement);
	};
}
