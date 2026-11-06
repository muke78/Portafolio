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
 */
export const galaxyState = { bang: 1, story: 0 };
