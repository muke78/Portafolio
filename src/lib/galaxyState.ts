/**
 * Shared, plain state between the scroll engine and the particle galaxy.
 *
 * The motion engine (src/lib/motion/galaxy.ts, intro.ts) scrubs these numbers;
 * the canvas (components/three/ParticleGalaxy.tsx) only reads them every frame.
 * No imports on either side, so SSR stays safe.
 *
 *   bang   0 -> 1  the Big Bang: every particle starts as one point at the centre
 *                  of the screen and is thrown outward (1 = already spread across
 *                  the sky; it is 1 whenever there is no intro to play)
 *   story  0 -> 1  the life of the galaxy over the WHOLE page: stars spread across
 *                  the sky (0) -> gathered into clouds -> the gas falls in -> a
 *                  spinning disc -> the first stars -> spiral arms and a black hole
 *                  -> mergers -> the end (1). The phases and their ranges live in
 *                  the header of ParticleGalaxy.tsx.
 *   hole   0 -> 1  the closing, after every star is gone: the black hole alone comes
 *                  toward you (it tilts up like a cup lifted off a table), hundreds of
 *                  new stars fill the sky and are bent around it (lensing)
 *   fall   0 -> 1  you fall in: the stars streak out of the hole like a tunnel
 *   worm   0 -> 1  the stars are gone and a wormhole (Einstein-Rosen bridge, the
 *                  grid of the embedding diagram) is crossed from end to end
 *   exit   0 -> 1  the white hole: the light floods the screen (the page below
 *                  is the light side of the world)
 */
export const galaxyState = {
	bang: 1,
	story: 0,
	hole: 0,
	fall: 0,
	worm: 0,
	exit: 0,
};

/**
 * Story value where the epilogue begins: the galaxy has formed (disc, first stars, arms
 * winding) and is about to merge with another and die in the open. It is where the canvas
 * moves the galaxy to the middle of the stage (ParticleGalaxy.tsx) and where the scroll
 * scene switches from "the whole page" to "the epilogue" (src/lib/motion/galaxy.ts).
 */
export const EPILOGUE_FROM = 0.54;
/** Story value of a healthy galaxy: the still frame under reduced motion. */
export const PEAK = 0.72;

const smooth01 = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

/** Camera of the canvas (ParticleGalaxy.tsx) and the placement of the interior (see below). */
export const CAMERA_Z = 7;
export const CAMERA_FOV = 50;

/**
 * Falling into the black hole slows time: every ambient motion of the canvas (the disc that
 * turns, the stars that breathe) runs at this share of its speed, down to a tenth once you
 * are inside.
 */
export const timeScale = (fall: number) => 1 - 0.9 * smooth01(0.25, 1, fall);

/**
 * INSIDE THE DIAMOND. After the event horizon the viewer is the camera of a 3D scene: the
 * interior of a charged black hole as its Penrose diagram says it (every diamond turned
 * around its time axis into a double cone, light travelling at 45 degrees). The camera only
 * moves forward along the axis (z, the future) with the scroll (`worm`, 0..1) and passes, in
 * this order, through: the black hole's cone (the past stays behind, the future is the
 * inverted cone ahead), the inner horizon where four cells meet at one point (the
 * wormholes and the antiverses open at the sides) and the white hole's cone, to leave by its
 * far tip. It waits a moment at each stop so every scene has its own time.
 */
const STOPS: [number, number][] = [
	[0, -6],
	[0.34, 0],
	[0.62, 6],
	[0.84, 12],
	[1, 17.6],
];

export const flightZ = (worm: number) => {
	const w = Math.min(1, Math.max(0, worm));
	for (let i = 1; i < STOPS.length; i++) {
		const [w1, z1] = STOPS[i];
		if (w <= w1) {
			const [w0, z0] = STOPS[i - 1];
			const t = (w - w0) / (w1 - w0);
			// mostly linear, a little eased: the camera eases into every stop and out of it
			const k = 0.45 * t + 0.55 * (t * t * (3 - 2 * t));
			return z0 + (z1 - z0) * k;
		}
	}
	return STOPS[STOPS.length - 1][1];
};

/** The camera's place in the interior and how visible the interior is. */
export const interiorView = (worm: number) => ({
	cz: flightZ(worm),
	vis: smooth01(0, 0.06, worm) * (1 - smooth01(0.97, 1, worm)),
});

/** Labels fixed in the interior (interior coordinates), keyed like the i18n INTERIOR block. */
export const INTERIOR_LABELS = [
	{ key: "BLACK_HOLE", x: 0, y: 1.3, z: 0 },
	{ key: "INNER_HORIZON", x: 0, y: 1.1, z: 6 },
	{ key: "WORMHOLE", x: -9, y: 1.7, z: 6 },
	{ key: "PARALLEL_WORMHOLE", x: 9, y: 1.7, z: 6 },
	{ key: "ANTIVERSE", x: -6, y: -0.2, z: 6 },
	{ key: "PARALLEL_ANTIVERSE", x: 6, y: -0.2, z: 6 },
	{ key: "WHITE_HOLE", x: 0, y: 1.3, z: 12 },
	{ key: "ANTIHORIZON", x: 0, y: 1.1, z: 18 },
] as const;

/**
 * Where a point of the interior lands on the screen (NDC, -1..1), or null if it is behind
 * the camera or too close. The canvas uses the same camera, so the labels (written by the
 * scroll engine) sit on the cones.
 */
export const projectInterior = (
	x: number,
	y: number,
	z: number,
	cz: number,
	aspect: number,
) => {
	const d = z - cz;
	if (d < 0.6) return null;
	const t = Math.tan((CAMERA_FOV * Math.PI) / 360);
	return { x: x / (d * t * aspect), y: y / (d * t), d };
};
