import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: "html",

	use: {
		baseURL,
		trace: "on-first-retry",
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
