import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import Bubble from "@/components/ui/Bubble.astro";
import { GET as langRedirect } from "@/pages/[lang]/index";
import { GET as rootRedirect } from "@/pages/index";

describe("Bubble", () => {
	const render = async (props?: Record<string, unknown>) => {
		const container = await AstroContainer.create();
		return container.renderToString(Bubble, { props });
	};

	it("defaults to a primary bubble with an 8s drift", async () => {
		const html = await render();
		expect(html).toContain("bg-primary");
		expect(html).toContain("animation-duration: 8s");
		expect(html).toContain("animation-delay: 0s");
	});

	it.each([
		["secondary", "bg-secondary"],
		["accent", "bg-accent"],
	])("paints a %s bubble with the matching token", async (color, cls) => {
		expect(await render({ color })).toContain(cls);
	});

	it("takes its position, delay and duration from the props", async () => {
		const html = await render({
			position: "top-10 left-4",
			delay: 2,
			duration: 12,
		});
		expect(html).toContain("top-10 left-4");
		expect(html).toContain("animation-delay: 2s");
		expect(html).toContain("animation-duration: 12s");
	});

	it("is decorative: it never takes pointer events", async () => {
		expect(await render()).toContain("pointer-events-none");
	});
});

describe("redirect endpoints", () => {
	const call = (handler: typeof rootRedirect, currentLocale?: string) => {
		const redirect = (path: string, status: number) =>
			new Response(null, { status, headers: { Location: path } });
		return handler({ currentLocale, redirect } as never) as Response;
	};

	it.each([
		["root", rootRedirect],
		["/[lang]", langRedirect],
	])("%s sends the reader to the home of their language", (_name, handler) => {
		for (const locale of ["es", "en", "fr"]) {
			const res = call(handler, locale);
			expect(res.status).toBe(302);
			expect(res.headers.get("Location")).toBe(`/${locale}/home`);
		}
	});

	it.each([
		["root", rootRedirect],
		["/[lang]", langRedirect],
	])("%s falls back to Spanish when no locale is known", (_name, handler) => {
		expect(call(handler, undefined).headers.get("Location")).toBe("/es/home");
	});
});
