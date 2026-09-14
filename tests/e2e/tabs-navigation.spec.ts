import { expect, test } from "@playwright/test";

test.describe("Acerca de mí tabs", () => {
	test("switches between tabs and persists the choice across reload", async ({
		page,
	}) => {
		await page.goto("/es/home#about");

		// Section headings are plain <span>s (no heading role), and the same
		// exact string also appears in the tab bar's own button (its
		// md:inline/lg:inline label span) - two matches for the same text.
		// TabsAcerca.tsx always renders the button bar before the content
		// div in the JSX, so index 1 is reliably the content heading, not
		// the button.
		const heading = (text: string) => page.getByText(text, { exact: true }).nth(1);

		// Defaults to "experiencia" (TabsAcerca.tsx's initial state).
		await expect(heading("Experiencia")).toBeVisible();

		await page.getByRole("button", { name: "Educación" }).click();
		await expect(heading("Educación")).toBeVisible();

		await page.getByRole("button", { name: "Habilidades" }).click();
		await expect(heading("Habilidades")).toBeVisible();

		await page.getByRole("button", { name: "Acerca de mí" }).click();
		await expect(heading("Acerca de mí")).toBeVisible();

		// activeTab is persisted to localStorage - a reload should land back
		// on "sobreMi", not reset to the "experiencia" default.
		await page.reload();
		await expect(heading("Acerca de mí")).toBeVisible();
	});
});

test.describe("Proyectos tabs", () => {
	test("switches between category tabs and persists the choice across reload", async ({
		page,
	}) => {
		await page.goto("/es/home#projects");

		await page.getByRole("button", { name: "Backend" }).click();
		await expect
			.poll(async () => page.evaluate(() => localStorage.getItem("activeProjectTab")))
			.toBe("backend");

		await page.getByRole("button", { name: "Empresas" }).click();
		await expect
			.poll(async () => page.evaluate(() => localStorage.getItem("activeProjectTab")))
			.toBe("companies");

		await page.reload();
		// Still on "companies" after reload, not reset to the "frontend" default.
		await expect
			.poll(async () => page.evaluate(() => localStorage.getItem("activeProjectTab")))
			.toBe("companies");
	});
});
