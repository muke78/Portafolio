/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
	test: {
		include: ["tests/unit/**/*.test.{ts,tsx}"],
		// Pure logic runs in node; component tests opt into the DOM with a
		// `// @vitest-environment jsdom` docblock.
		environment: "node",
		setupFiles: ["tests/unit/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text-summary", "html", "json", "json-summary"],
			include: ["src/**/*.{ts,tsx,astro}"],
			exclude: ["src/**/*.d.ts", "src/types/**"],
			// Floors, not goals: a PR that drops coverage under them fails CI.
			thresholds: {
				lines: 90,
				statements: 90,
				functions: 88,
				branches: 80,
			},
		},
	},
});
