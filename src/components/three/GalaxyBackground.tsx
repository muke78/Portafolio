import { useEffect, useRef } from "react";

/**
 * GALAXY 3D — Three.js showpiece.
 * Ported from a vanilla-JS prototype (galaxy3d.js) into a React island.
 *
 * Behaviour:
 *  · On load → fades in full-viewport behind the hero, spinning to
 *    show itself off.
 *  · On scroll → shrinks toward the lower-right corner.
 *  · Approaching the footer's big "Khelde" wordmark → rises back up,
 *    centered, like a sunset behind the word.
 *
 * `three` is dynamically imported so it never lands in the initial
 * JS bundle - this component is meant to be mounted from a
 * client:idle island, and the import happens after that.
 */
export const GalaxyBackground = () => {
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let disposed = false;
		let cleanup: (() => void) | undefined;

		import("three").then((THREE) => {
			if (disposed || !wrapRef.current) return;
			cleanup = mountGalaxy(THREE, wrapRef.current);
		});

		return () => {
			disposed = true;
			cleanup?.();
		};
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

// biome-ignore lint/suspicious/noExplicitAny: three's module namespace type is unwieldy to import just for this
function mountGalaxy(THREE: any, wrap: HTMLDivElement) {
	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
		powerPreference: "high-performance",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setClearColor(0x000000, 0);
	wrap.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
	camera.position.set(4.6, 3.2, 6.8);
	camera.lookAt(0, 0, 0);

	const isMobile = window.innerWidth < 768;
	const count = isMobile ? 9000 : 18000;
	const branches = 3;

	const aRadiusRatio = new Float32Array(count);
	const aBranch = new Float32Array(count);
	const aOffset = new Float32Array(count * 3);

	for (let i = 0; i < count; i++) {
		aRadiusRatio[i] = Math.random();
		aBranch[i] = i % branches;
		for (let j = 0; j < 3; j++) {
			const r = Math.random() * 2 - 1;
			aOffset[i * 3 + j] = r * r * r * aRadiusRatio[i] * 0.5;
		}
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute(
		"position",
		new THREE.BufferAttribute(new Float32Array(count * 3), 3),
	);
	geo.setAttribute("aRadiusRatio", new THREE.BufferAttribute(aRadiusRatio, 1));
	geo.setAttribute("aBranch", new THREE.BufferAttribute(aBranch, 1));
	geo.setAttribute("aOffset", new THREE.BufferAttribute(aOffset, 3));

	const mat = new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uSize: { value: 32.0 },
			uColorInside: { value: new THREE.Color("#FFB686") },
			uColorOutside: { value: new THREE.Color("#7A3CFF") },
		},
		vertexShader: /* glsl */ `
      attribute float aRadiusRatio;
      attribute float aBranch;
      attribute vec3 aOffset;
      uniform float uTime;
      uniform float uSize;
      uniform vec3 uColorInside;
      uniform vec3 uColorOutside;
      varying vec3 vColor;

      void main() {
        float radius = pow(aRadiusRatio, 1.5) * 4.0;
        float branchAngle = aBranch * 6.2831853 / 3.0;
        float angle = branchAngle + uTime * (1.0 - aRadiusRatio);

        vec3 pos = vec3(cos(angle), 0.0, sin(angle)) * radius;
        pos += aOffset;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = uSize * (1.0 / -mvPosition.z);

        float mixT = 1.0 - pow(1.0 - aRadiusRatio, 2.0);
        vColor = mix(uColorInside, uColorOutside, mixT);
      }
    `,
		fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = (0.045 / d) - 0.13;
        if (alpha <= 0.0) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
	});

	const points = new THREE.Points(geo, mat);
	points.rotation.x = 0.58;
	scene.add(points);

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
		const aTxVw = phaseA * cornerTxVw;
		const aTyVh = phaseA * cornerTyVh;
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
		mat.uniforms.uTime.value = tSec * 0.45;
		points.rotation.y = tSec * 0.04 + entrySpin;

		renderer.render(scene, camera);
		rafId = requestAnimationFrame(update);
	}
	rafId = requestAnimationFrame(update);

	return () => {
		cancelAnimationFrame(rafId);
		if (findTimer) window.clearTimeout(findTimer);
		window.removeEventListener("resize", resize);
		geo.dispose();
		mat.dispose();
		renderer.dispose();
		wrap.removeChild(renderer.domElement);
	};
}
