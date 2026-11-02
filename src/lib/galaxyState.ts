/**
 * Shared, plain state between the scroll engine and the particle galaxy.
 *
 * The motion engine (src/lib/motion/galaxy.ts) scrubs these two numbers with
 * the scroll; the canvas (components/three/ParticleGalaxy.tsx) only reads
 * them every frame. No imports on either side, so SSR stays safe.
 *
 *   burst  0 -> 1  stardust gathers toward the centre (0 -> .58), then
 *                  explodes into the spiral galaxy (.58 -> 1)
 *   settle 0 -> 1  the finished galaxy drifts to the lower-right corner,
 *                  smaller and dimmer, so the content keeps the stage
 */
export const galaxyState = { burst: 0, settle: 0 };
