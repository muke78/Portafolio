import { expect, type Page } from "@playwright/test";

/** Islands hydrate lazily (client:idle / client:visible): wait until one is live. */
export const waitForIsland = (page: Page, componentFile: string) => {
	// The dev server serves some islands without the extension (/@id/@/…/Nav), the build
	// with it (…/Nav.tsx): accept both.
	const name = componentFile.replace(/\.tsx$/, "");
	return expect(
		page.locator(
			`astro-island[component-url$="/${name}"]:not([ssr]), astro-island[component-url$="/${name}.tsx"]:not([ssr])`,
		),
	).toHaveCount(1, { timeout: 20_000 });
};

/**
 * The contact form enters with an animation (mask + staggered fields). A
 * visitor interacts with it once it is shown, so tests do the same.
 */
export const waitForContactForm = async (page: Page) => {
	await waitForIsland(page, "Form.tsx");
	await expect(page.locator("#contact [data-mask]")).toHaveCSS(
		"clip-path",
		"none",
		{ timeout: 20_000 },
	);
	await expect(page.locator("#contact button[type=submit]")).toHaveCSS(
		"opacity",
		"1",
		{ timeout: 20_000 },
	);
};

/**
 * Opens the comment dialog through the event the "write an opinion" button
 * fires. The launcher registers its listener in an effect that runs just
 * after hydration, so the event is re-sent until the dialog shows up.
 */
export const openCommentDialog = async (page: Page) => {
	await waitForIsland(page, "CommentWidget.tsx");
	const dialog = page.getByRole("dialog", { name: "Dejar un comentario" });
	await expect(async () => {
		await page.evaluate(() =>
			window.dispatchEvent(new CustomEvent("khelde:open-comment-widget")),
		);
		await expect(dialog).toBeVisible({ timeout: 1000 });
	}).toPass({ timeout: 20_000 });
	return dialog;
};
