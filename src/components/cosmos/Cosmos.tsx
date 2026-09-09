import { useEffect, useMemo, useRef } from "react";

// Seedable PRNG so the same seed always generates the same galaxy
function makeRng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
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
