import { expect, test } from "@playwright/test";

/**
 * Tab selectors of the Home (src/components/sections/SectionTabs.tsx):
 * a <nav> landmark named after its section whose items are <button>s with
 * aria-pressed. The active panel's title is a real <h2>.
 */
test.describe("Acerca de mí tabs", () => {
	test("switches between tabs and persists the choice across reload", async ({
		page,
	}) => {
		await page.goto("/es/home#about");

		const tabs = page.getByRole("navigation", {
			name: "Acerca de mí",
			exact: true,
		});
		const tab = (name: string) =>
			tabs.getByRole("button", { name, exact: true });
		const heading = (name: string) =>
			page.getByRole("heading", { name, level: 2, exact: true });

		// Defaults to "experiencia" (TabsAcerca.tsx's initial state).
		await expect(heading("Experiencia")).toBeVisible();
		await expect(tab("Experiencia")).toHaveAttribute("aria-pressed", "true");

		await tab("Educación").click();
		await expect(heading("Educación")).toBeVisible();
		await expect(tab("Educación")).toHaveAttribute("aria-pressed", "true");
		await expect(tab("Experiencia")).toHaveAttribute("aria-pressed", "false");

		await tab("Habilidades").click();
		await expect(heading("Habilidades")).toBeVisible();

		await tab("Acerca de mí").click();
		await expect(heading("Acerca de mí")).toBeVisible();

		// activeTab is persisted to localStorage - a reload should land back
		// on "sobreMi", not reset to the "experiencia" default.
		await page.reload();
		await expect(heading("Acerca de mí")).toBeVisible();
		await expect(tab("Acerca de mí")).toHaveAttribute("aria-pressed", "true");
	});
});

test.describe("Proyectos tabs", () => {
	test("switches between category tabs and persists the choice across reload", async ({
		page,
	}) => {
		await page.goto("/es/home#projects");

		const tabs = page.getByRole("navigation", {
			name: "Proyectos",
			exact: true,
		});
		const tab = (name: string) =>
			tabs.getByRole("button", { name, exact: true });
		const stored = () =>
			page.evaluate(() => localStorage.getItem("activeProjectTab"));

		await tab("Backend").click();
		await expect.poll(stored).toBe("backend");
		await expect(tab("Backend")).toHaveAttribute("aria-pressed", "true");

		await tab("Empresas").click();
		await expect.poll(stored).toBe("companies");

		await page.reload();
		// Still on "companies" after reload, not reset to the "frontend" default.
		await expect.poll(stored).toBe("companies");
		await expect(tab("Empresas")).toHaveAttribute("aria-pressed", "true");
	});
});
