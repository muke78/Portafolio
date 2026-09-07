import { Cosmos } from "@/components/cosmos/Cosmos";
import { GalaxyBackground } from "@/components/three/GalaxyBackground";

/**
 * Global decorative background: the cheap SVG cosmos layer (always
 * on) plus the Three.js galaxy showpiece (loaded after hydration -
 * see GalaxyBackground's dynamic `import("three")`). Mounted once
 * from Layout.astro so it persists across the whole scroll.
 */
export const BackgroundEffects = () => {
	return (
		<>
			<Cosmos />
			<GalaxyBackground />
		</>
	);
};
