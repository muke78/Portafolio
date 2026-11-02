import { Cosmos } from "@/components/cosmos/Cosmos";
import { ParticleGalaxy } from "@/components/three/ParticleGalaxy";

/**
 * Global decorative background: the cheap SVG cosmos layer (always
 * on) plus the particle galaxy (Three.js points, driven by the scroll
 * engine). Mounted once from Layout.astro so it persists across the whole
 * scroll.
 */
export const BackgroundEffects = () => {
	return (
		<>
			<Cosmos />
			<ParticleGalaxy />
		</>
	);
};
