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
 *   burst  0 -> 1  stardust gathers toward the centre (0 -> .58), then
 *                  explodes into the spiral galaxy (.58 -> 1)
 *   settle 0 -> 1  the finished galaxy drifts to the lower-right corner,
 *                  smaller and dimmer, so the content keeps the stage
 */
export const galaxyState = { bang: 1, burst: 0, settle: 0 };
