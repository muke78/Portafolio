// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Opinions } from "@/features/opinions/Opinions";
import { getI18N } from "@/i18n";
import type { Testimonial } from "@/types/currentLang.interface";

const es = getI18N({ currentLocale: "es" });

const comment = (over: Partial<Testimonial> = {}): Testimonial => ({
	comment_id: 1,
	name: "Ana Pérez",
	job: "Diseñadora",
	description: "Un trabajo excelente y muy cuidado.",
	country: "México",
	country_flag: "MX",
	created_at: "2026-03-15T12:00:00.000Z",
	direction: "left",
	...over,
});

const respond = (body: unknown, status = 200) =>
	vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("Opinions", () => {
	it("shows loading placeholders until the comments arrive", async () => {
		vi.stubGlobal("fetch", respond({ data: [comment()] }));
		render(<Opinions currentLocale="es" />);
		const status = screen.getByRole("status");
		expect(status).toHaveAttribute("aria-busy", "true");
		expect(status).toHaveAccessibleName(es.COMMON.LOADING);
		expect(
			await screen.findByRole("heading", {
				level: 2,
				name: es.OPINIONS.OPINIONS_TITLE,
			}),
		).toBeInTheDocument();
	});

	it("renders without fetching when the page already gave it data", () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		render(<Opinions currentLocale="es" initialData={[comment()]} />);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(screen.getAllByText("Ana Pérez").length).toBeGreaterThan(0);
	});

	it("counts the people who wrote and shows the headline pieces", async () => {
		vi.stubGlobal(
			"fetch",
			respond({
				data: [comment(), comment({ comment_id: 2, name: "Luis Gómez" })],
			}),
		);
		render(<Opinions currentLocale="es" />);
		await screen.findAllByText("Luis Gómez");
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(
			screen.getByText(es.OPINIONS.OPINIONS_COUNT_LABEL),
		).toBeInTheDocument();
		expect(screen.getByText(es.OPINIONS.OPINIONS_SUBTITLE)).toBeInTheDocument();
		expect(
			screen.getByText(es.OPINIONS.OPINIONS_SUB_SUBTILE),
		).toBeInTheDocument();
	});

	it("splits the comments in two lanes that slide opposite ways", async () => {
		vi.stubGlobal(
			"fetch",
			respond({
				data: [comment(), comment({ comment_id: 2, name: "Luis Gómez" })],
			}),
		);
		const { container } = render(<Opinions currentLocale="es" />);
		await screen.findAllByText("Luis Gómez");
		const lanes = container.querySelectorAll<HTMLElement>("[data-marquee]");
		expect([...lanes].map((l) => l.dataset.marqueeDir)).toEqual([
			"left",
			"right",
		]);
		for (const lane of lanes) {
			expect(lane.querySelectorAll("[data-marquee-track]")).toHaveLength(1);
		}
	});

	it("puts the newest on the top lane and the next one below", async () => {
		const data = [
			comment({ comment_id: 1, name: "Vieja", created_at: "2025-01-01" }),
			comment({ comment_id: 2, name: "Nueva", created_at: "2026-06-01" }),
			comment({ comment_id: 3, name: "Media", created_at: "2025-08-01" }),
		];
		vi.stubGlobal("fetch", respond({ data }));
		const { container } = render(<Opinions currentLocale="es" />);
		await screen.findAllByText("Nueva");
		const names = (lane: Element) =>
			[...lane.querySelectorAll("[role=group]:not([data-repeat]) h3")].map(
				(h) => h.textContent,
			);
		const [top, bottom] = container.querySelectorAll("[data-marquee]");
		expect(names(top)).toEqual(["Nueva", "Vieja"]);
		expect(names(bottom)).toEqual(["Media"]);
	});

	it("reads each comment once: the cards that close the loop are hidden and skipped by Tab", async () => {
		vi.stubGlobal(
			"fetch",
			respond({
				data: [comment(), comment({ comment_id: 2, name: "Luis Gómez" })],
			}),
		);
		const { container } = render(<Opinions currentLocale="es" />);
		await screen.findAllByText("Luis Gómez");
		const lane = container.querySelector("[data-marquee]") as HTMLElement;
		const real = within(lane).getAllByRole("group");
		expect(real).toHaveLength(1); // aria-hidden copies are not in the tree
		expect(real[0]).toHaveAttribute("tabindex", "0");
		expect(real[0]).toHaveAccessibleName(/Luis Gómez: Un trabajo excelente/);
		const copies = lane.querySelectorAll("[data-repeat]");
		expect(copies.length).toBeGreaterThan(0);
		for (const copy of copies) {
			expect(copy).toHaveAttribute("aria-hidden", "true");
			expect(copy).toHaveAttribute("tabindex", "-1");
		}
	});

	it("sets the loop length from the cards in one half, the same speed on every lane", async () => {
		const many = Array.from({ length: 10 }, (_, i) =>
			comment({ comment_id: i + 1 }),
		);
		vi.stubGlobal("fetch", respond({ data: many }));
		const { container } = render(<Opinions currentLocale="es" />);
		await screen.findAllByText("Ana Pérez");
		// 5 cards a lane, repeated to 10 so one half is wider than any screen.
		for (const lane of container.querySelectorAll("[data-marquee]")) {
			expect(lane).toHaveStyle("--marquee-duration: 140s");
		}
	});

	it("formats the date in the page language", async () => {
		vi.stubGlobal("fetch", respond({ data: [comment()] }));
		render(<Opinions currentLocale="en" />);
		await screen.findAllByText("Ana Pérez");
		expect(screen.getAllByText(/Mar.*2026/)[0]).toBeInTheDocument();
	});

	it("falls back to a placeholder country label when the comment has none", async () => {
		vi.stubGlobal(
			"fetch",
			respond({ data: [comment({ country: "", country_flag: "" })] }),
		);
		render(<Opinions currentLocale="es" />);
		await screen.findAllByText("Ana Pérez");
		expect(
			screen.getAllByText(es.OPINIONS.OPINIONS_NOT_FOUND_COUNTRY).length,
		).toBeGreaterThan(0);
	});

	it("asks the comment widget to open from its call to action", async () => {
		vi.stubGlobal("fetch", respond({ data: [comment()] }));
		render(<Opinions currentLocale="es" />);
		const opened = vi.fn();
		window.addEventListener("khelde:open-comment-widget", opened);
		await userEvent.click(
			await screen.findByRole("button", {
				name: es.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE,
			}),
		);
		expect(opened).toHaveBeenCalledTimes(1);
		window.removeEventListener("khelde:open-comment-widget", opened);
	});

	it("shows an empty state, not a broken strip, when there are no comments", async () => {
		vi.stubGlobal("fetch", respond({ data: [] }));
		const { container } = render(<Opinions currentLocale="es" />);
		expect(
			await screen.findByText(es.OPINIONS.OPINIONS_NOT_FOUND),
		).toBeInTheDocument();
		expect(
			screen.getByAltText(es.OPINIONS.OPINIONS_NOT_FOUND),
		).toBeInTheDocument();
		expect(container.querySelector("[data-marquee]")).toBeNull();
	});

	it("keeps the empty state when the API answers without data", async () => {
		vi.stubGlobal("fetch", respond({ message: "error" }, 503));
		render(<Opinions currentLocale="es" />);
		expect(
			await screen.findByText(es.OPINIONS.OPINIONS_NOT_FOUND),
		).toBeInTheDocument();
	});

	it("keeps the empty state on a network error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		render(<Opinions currentLocale="es" />);
		expect(
			await screen.findByText(es.OPINIONS.OPINIONS_NOT_FOUND),
		).toBeInTheDocument();
		expect(console.error).toHaveBeenCalled();
	});
});
