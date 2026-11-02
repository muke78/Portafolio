// Minimal OKLCH -> sRGB helpers so design-token tests can measure WCAG
// contrast straight from the values in src/styles/app.css.

export interface Oklch {
	l: number; // 0..1
	c: number;
	h: number; // degrees
	a: number; // 0..1
}

export const parseOklch = (value: string): Oklch => {
	const m = value
		.trim()
		.match(
			/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)%)?\s*\)/,
		);
	if (!m) throw new Error(`Not an oklch() colour: ${value}`);
	return {
		l: Number(m[1]) / 100,
		c: Number(m[2]),
		h: Number(m[3]),
		a: m[4] ? Number(m[4]) / 100 : 1,
	};
};

// Linear sRGB, unclamped (values outside 0..1 mean out of the sRGB gamut).
export const toLinearRgb = ({ l, c, h }: Oklch): [number, number, number] => {
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
		-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
		-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
	];
};

export const inSrgbGamut = (color: Oklch, epsilon = 0.002): boolean =>
	toLinearRgb(color).every((v) => v >= -epsilon && v <= 1 + epsilon);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const encode = (v: number) =>
	v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
const decode = (v: number) =>
	v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;

// Composites a (possibly translucent) colour over an opaque backdrop,
// blending in gamma-encoded sRGB like browsers do.
export const flatten = (
	fg: Oklch,
	backdrop: [number, number, number],
): [number, number, number] => {
	const rgb = toLinearRgb(fg).map(clamp01);
	if (fg.a >= 1) return rgb as [number, number, number];
	return rgb.map((v, i) =>
		decode(encode(v) * fg.a + encode(backdrop[i]) * (1 - fg.a)),
	) as [number, number, number];
};

const luminance = ([r, g, b]: [number, number, number]) =>
	0.2126 * r + 0.7152 * g + 0.0722 * b;

export const contrast = (
	a: [number, number, number],
	b: [number, number, number],
): number => {
	const x = luminance(a);
	const y = luminance(b);
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
