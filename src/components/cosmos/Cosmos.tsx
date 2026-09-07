import { useEffect, useMemo, useRef } from "react";

// Seedable PRNG so the same seed always generates the same galaxy
function makeRng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

type GalaxyProps = {
	size?: number;
	seed?: number;
	tilt?: number;
	rotate?: number;
};

/**
 * Logarithmic-spiral galaxy rendered as SVG (arms, dust lanes, HII
 * regions, halo, bulge). `tilt` (0-90) controls inclination.
 */
export function Galaxy({
	size = 580,
	seed = 7,
	tilt = 30,
	rotate = 0,
}: GalaxyProps) {
	const VB = 200;
	const C = VB / 2;
	const uid = `gx-${seed}`;

	const armCount = 2;
	const turns = 1.4;
	const stepsPerArm = 320;
	const a = 4;
	const b = 0.22;
	const maxR = 96;

	const data = useMemo(() => {
		const rng = makeRng(seed);
		const armPaths: string[] = [];
		const armDots: { x: number; y: number; r: number; op: number }[] = [];
		const dustDots: { x: number; y: number; r: number }[] = [];
		for (let arm = 0; arm < armCount; arm++) {
			const armOffset = (arm / armCount) * Math.PI * 2;
			const points: string[] = [];
			for (let i = 0; i <= stepsPerArm; i++) {
				const t = i / stepsPerArm;
				const theta = t * turns * Math.PI * 2;
				const r = Math.min(maxR, a * Math.exp(b * theta));
				const jitter = (rng() - 0.5) * 1.6 * t;
				const ang = armOffset + theta + jitter * 0.02;
				const x = C + r * Math.cos(ang);
				const y = C + r * Math.sin(ang);
				points.push(`${x.toFixed(1)},${y.toFixed(1)}`);

				if (i > stepsPerArm * 0.18 && rng() > 0.96) {
					const offR = (rng() - 0.5) * 4;
					const offA = (rng() - 0.5) * 0.1;
					const rx = C + (r + offR) * Math.cos(ang + offA);
					const ry = C + (r + offR) * Math.sin(ang + offA);
					armDots.push({
						x: rx,
						y: ry,
						r: 0.5 + rng() * 1.2,
						op: 0.55 + rng() * 0.35,
					});
				}
				if (i > stepsPerArm * 0.1 && rng() > 0.985) {
					const offR = -1.4 - rng() * 1.6;
					const rx = C + (r + offR) * Math.cos(ang);
					const ry = C + (r + offR) * Math.sin(ang);
					dustDots.push({ x: rx, y: ry, r: 0.4 + rng() * 0.7 });
				}
			}
			armPaths.push(`M ${points.join(" L ")}`);
		}
		return { armPaths, armDots, dustDots };
	}, [seed]);

	const scaleY = Math.max(0.18, Math.cos((tilt * Math.PI) / 180));
	const diskTransform = `rotate(${rotate}deg) scaleY(${scaleY.toFixed(3)})`;

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${VB} ${VB}`}
			className="galaxy-svg"
			role="presentation"
		>
			<defs>
				<radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
					<stop offset="60%" stopColor="currentColor" stopOpacity="0.08" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</radialGradient>
				<radialGradient id={`${uid}-bulge`} cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="currentColor" stopOpacity="1" />
					<stop offset="35%" stopColor="currentColor" stopOpacity="0.55" />
					<stop offset="75%" stopColor="currentColor" stopOpacity="0.18" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</radialGradient>
			</defs>

			<g
				className="gx-disk"
				style={{ transform: diskTransform, transformOrigin: `${C}px ${C}px` }}
			>
				<circle cx={C} cy={C} r="98" fill={`url(#${uid}-halo)`} />

				<g className="gx-spin" style={{ transformOrigin: `${C}px ${C}px` }}>
					{data.armPaths.map((d, i) => (
						<path
							key={`g${i}`}
							d={d}
							fill="none"
							stroke="currentColor"
							strokeWidth="9"
							strokeOpacity="0.14"
							strokeLinecap="round"
						/>
					))}
					{data.armPaths.map((d, i) => (
						<path
							key={`m${i}`}
							d={d}
							fill="none"
							stroke="currentColor"
							strokeWidth="3.2"
							strokeOpacity="0.42"
							strokeLinecap="round"
						/>
					))}
					{data.armPaths.map((d, i) => (
						<path
							key={`c${i}`}
							d={d}
							fill="none"
							stroke="currentColor"
							strokeWidth="1.1"
							strokeOpacity="0.8"
							strokeLinecap="round"
						/>
					))}
					{data.armDots.map((p, i) => (
						<circle
							key={`d${i}`}
							cx={p.x}
							cy={p.y}
							r={p.r}
							fill="currentColor"
							opacity={p.op}
						/>
					))}
					{data.dustDots.map((p, i) => (
						<circle
							key={`x${i}`}
							cx={p.x}
							cy={p.y}
							r={p.r}
							fill="currentColor"
							opacity="0.1"
						/>
					))}
				</g>

				<ellipse cx={C} cy={C} rx="18" ry="15" fill={`url(#${uid}-bulge)`} />
				<circle cx={C} cy={C} r="3" fill="currentColor" opacity="0.98" />
			</g>
		</svg>
	);
}

function Nebula() {
	return (
		<svg
			width="520"
			height="320"
			viewBox="0 0 520 320"
			className="nebula-svg"
			role="presentation"
		>
			<defs>
				<radialGradient id="neb-a" cx="30%" cy="50%" r="50%">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="neb-b" cx="70%" cy="40%" r="50%">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="neb-c" cx="55%" cy="65%" r="40%">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</radialGradient>
			</defs>
			<rect width="520" height="320" fill="url(#neb-a)" />
			<rect width="520" height="320" fill="url(#neb-b)" />
			<rect width="520" height="320" fill="url(#neb-c)" />
		</svg>
	);
}

/**
 * COSMOS — generative space background layer. Galaxies + nebula + a
 * starfield, tinted by --primary, parallax-scrolled via translate3d.
 * Pure SVG/CSS (no WebGL) so it's cheap to run behind every page.
 */
export function Cosmos() {
	const ref = useRef<HTMLDivElement>(null);
	const rafRef = useRef(0);
	const targetY = useRef(0);
	const currentY = useRef(0);

	useEffect(() => {
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const onScroll = () => {
			targetY.current = window.scrollY;
			if (!rafRef.current) {
				const animate = () => {
					currentY.current += (targetY.current - currentY.current) * 0.08;
					const y = currentY.current;
					if (ref.current) {
						const layers =
							ref.current.querySelectorAll<HTMLElement>("[data-depth]");
						for (const el of layers) {
							const d = Number.parseFloat(el.dataset.depth ?? "0");
							el.style.transform = `translate3d(0, ${y * d}px, 0)`;
						}
					}
					if (Math.abs(targetY.current - currentY.current) > 0.5) {
						rafRef.current = requestAnimationFrame(animate);
					} else {
						rafRef.current = 0;
					}
				};
				rafRef.current = requestAnimationFrame(animate);
			}
		};
		if (!reduceMotion) {
			window.addEventListener("scroll", onScroll, { passive: true });
		}
		return () => {
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	const stars = useMemo(() => {
		const r = makeRng(42);
		return Array.from({ length: 50 }, () => ({
			x: r() * 100,
			y: r() * 100,
			size: 0.4 + r() * 2.4,
			delay: r() * 6,
			dur: 2.5 + r() * 5,
			bright: r() > 0.85,
		}));
	}, []);

	const dust = useMemo(() => {
		const r = makeRng(99);
		return Array.from({ length: 22 }, () => ({
			x: r() * 100,
			y: r() * 100,
			size: 1 + r() * 2.5,
			op: 0.05 + r() * 0.18,
		}));
	}, []);

	return (
		<div className="cosmos" ref={ref} aria-hidden="true">
			<div className="cosmos-vignette" />

			<div
				className="cosmos-obj"
				data-depth="-0.02"
				style={{ top: "320%", right: "-15%", opacity: 0.55 }}
			>
				<Nebula />
			</div>

			<svg
				className="cosmos-stars"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				data-depth="-0.15"
			>
				{stars.map((s, i) => (
					<circle
						// biome-ignore lint/suspicious/noArrayIndexKey: static generated field, index is stable
						key={i}
						cx={s.x}
						cy={s.y}
						r={s.size * 0.06}
						className={s.bright ? "star bright" : "star"}
						style={{
							animationDelay: `${s.delay}s`,
							animationDuration: `${s.dur}s`,
						}}
					/>
				))}
			</svg>

			<svg
				className="cosmos-dust"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				data-depth="-0.2"
			>
				{dust.map((d, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static generated field, index is stable
					<circle
						key={i}
						cx={d.x}
						cy={d.y}
						r={d.size * 0.04}
						opacity={d.op}
						className="dust"
					/>
				))}
			</svg>
		</div>
	);
}
