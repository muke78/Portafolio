import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	// The dev server compiles lazily and the page runs WebGL + GSAP: more than a
	// few parallel browsers starve it and make hydration-dependent tests flaky.
	workers: process.env.CI ? 2 : 3,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 1,
	reporter: "html",

	use: {
		baseURL,
		// Every spec starts as a visitor who chose "go straight to the site": the intro gate
		// (the origin-of-the-universe particle) would cover the page otherwise. intro.spec.ts
		// overrides this to test the gate itself.
		storageState: "tests/e2e/fixtures/intro-skip.json",
		trace: "on-first-retry",
		// Headless Chromium renders WebGL in software: the particle galaxy would eat
		// the CPU the page and the dev server need, and nothing here tests it
		// (it fails soft: the SVG sky stays). Keep the suite deterministic.
		launchOptions: { args: ["--disable-3d-apis"] },
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	// Reuses an already-running `pnpm dev` locally (fast iteration);
	// starts and tears down its own server in CI.
	webServer: {
		command: "pnpm dev",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});
