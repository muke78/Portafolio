/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
	test: {
		include: ["tests/unit/**/*.test.ts"],
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json"],
			// Only the files unit tests can realistically exercise - React
			// components and .astro pages are Playwright's job, not
			// Vitest's. Including them here would just report a wall of
			// 0% for code this test layer was never meant to cover.
			include: ["src/lib/**", "src/schemas/**", "src/i18n/index.ts"],
		},
	},
});
