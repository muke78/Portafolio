// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/components/Toaster";
import { Form } from "@/features/contact/Form";
import { ItemDataProjects } from "@/features/projects/items/ItemDataProjects";
import { SkeletonProjectsCard } from "@/features/projects/items/SkeletonProjectsCard";
import { ProjectRail } from "@/features/projects/ProjectRail";
import { getI18N } from "@/i18n";
import type { Projects } from "@/types/currentLang.interface";

const es = getI18N({ currentLocale: "es" });

const contact = {
	github_url: "https://github.com/muke78",
	linkedin_url: "https://www.linkedin.com/in/alguien/",
	linkedin_name: "Erick Gonzalez",
	phone: "+52 55 1190 9105",
	email: "persona@example.com",
};

const project = (over: Partial<Projects> = {}): Projects => ({
	project_id: 1,
	slug: "mi-proyecto",
	category: "frontend",
	card_image: "card.png",
	images_topics: ["react", "ts"],
	link_repo: "https://github.com/x/y",
	link_web: "https://x.dev",
	title: "Mi proyecto",
	description: "Una descripción",
	fork: false,
	...over,
});

afterEach(() => {
	// The toasts live in a module-level store.
	toast.remove();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe("contact Form", () => {
	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	const fill = async () => {
		await userEvent.type(
			screen.getByPlaceholderText(es.FORM.INPUT_NAME),
			"Erick González",
		);
		await userEvent.type(
			screen.getByPlaceholderText(es.FORM.INPUT_EMAIL),
			"erick@example.com",
		);
		await userEvent.type(
			screen.getByPlaceholderText(es.FORM.INPUT_PHONE),
			"+52 55 1234 5678",
		);
	};
	const submit = () =>
		userEvent.click(screen.getByRole("button", { name: es.FORM.BUTTON_LABEL }));

	it("marks its pieces for the motion engine and links the profiles", () => {
		const { container } = render(<Form currentLocale="es" contact={contact} />);
		expect(container.querySelector("[data-split]")).toBeInTheDocument();
		expect(container.querySelector("[data-stagger]")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "muke78" })).toHaveAttribute(
			"href",
			"https://github.com/muke78",
		);
	});

	it("shows the contact data it receives: handle, name, phone and email", () => {
		render(<Form currentLocale="es" contact={contact} />);
		expect(
			screen.getByRole("link", { name: "Erick Gonzalez" }),
		).toHaveAttribute("href", "https://www.linkedin.com/in/alguien/");
		// The WhatsApp link is built from the phone, and it is the one shown.
		const phone = screen.getByRole("link", { name: "+52 55 1190 9105" });
		expect(phone).toHaveAttribute("href", "https://wa.me/525511909105");
		expect(
			screen.getByRole("link", { name: "persona@example.com" }),
		).toHaveAttribute("href", "mailto:persona@example.com");
	});

	it("shows field errors and sends nothing when the form is empty", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		render(<Form currentLocale="es" contact={contact} />);
		await submit();
		expect(
			await screen.findByText(es.FORM.FORM_VALID_NAME),
		).toBeInTheDocument();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("accepts an international phone number (type=tel, not number)", () => {
		render(<Form currentLocale="es" contact={contact} />);
		expect(screen.getByPlaceholderText(es.FORM.INPUT_PHONE)).toHaveAttribute(
			"type",
			"tel",
		);
	});

	it("posts the message and confirms with a toast, then clears the form", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response("{}", { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);
		render(<Form currentLocale="es" contact={contact} />);
		await fill();
		await submit();

		expect(
			await screen.findByText(es.FORM.FORM_SEND_INFORMATION_CORRECT),
		).toBeInTheDocument();
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/contact-messages",
			expect.objectContaining({ method: "POST" }),
		);
		await waitFor(() =>
			expect(screen.getByPlaceholderText(es.FORM.INPUT_NAME)).toHaveValue(""),
		);
	});

	it("does not claim success when the API answers an error status", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("x", { status: 500 })),
		);
		render(<Form currentLocale="es" contact={contact} />);
		await fill();
		await submit();

		expect(
			await screen.findByText(
				new RegExp(es.FORM.FORM_SEND_INFORMATION_INCORRECT),
			),
		).toBeInTheDocument();
		expect(
			screen.queryByText(es.FORM.FORM_SEND_INFORMATION_CORRECT),
		).not.toBeInTheDocument();
	});

	it("reports a network failure the same way", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
		render(<Form currentLocale="es" contact={contact} />);
		await fill();
		await submit();
		expect(
			await screen.findByText(
				new RegExp(es.FORM.FORM_SEND_INFORMATION_INCORRECT),
			),
		).toBeInTheDocument();
	});
});

describe("SkeletonProjectsCard", () => {
	it("is a text-free placeholder", () => {
		const { container } = render(<SkeletonProjectsCard />);
		expect(
			container.querySelectorAll('[data-slot="skeleton"]').length,
		).toBeGreaterThan(3);
		expect(container.textContent).toBe("");
	});
});

describe("ItemDataProjects", () => {
	it("links each card to its own shareable URL, in the page language", () => {
		render(
			<ItemDataProjects
				currentLocale="en"
				data={[
					project(),
					project({ project_id: 2, slug: "otro", title: "Otro" }),
				]}
			/>,
		);
		expect(screen.getByRole("link", { name: /Mi proyecto/ })).toHaveAttribute(
			"href",
			"/en/project/mi-proyecto",
		);
		expect(screen.getByRole("link", { name: /Otro/ })).toHaveAttribute(
			"href",
			"/en/project/otro",
		);
	});

	it("shows the category and the collaboration badge only for forks", () => {
		const { rerender } = render(
			<ItemDataProjects currentLocale="es" data={[project()]} />,
		);
		expect(
			screen.getByText(es.PROJECTS.PROJECTS_TITLE_BUTTON_F),
		).toBeInTheDocument();
		expect(
			screen.queryByText(es.PROJECTS.PROJECTS_BADGE_FORK),
		).not.toBeInTheDocument();

		rerender(
			<ItemDataProjects currentLocale="es" data={[project({ fork: true })]} />,
		);
		expect(
			screen.getByText(es.PROJECTS.PROJECTS_BADGE_FORK),
		).toBeInTheDocument();
	});

	it("lists the stack as an accessible list of icons", () => {
		render(
			<ItemDataProjects
				currentLocale="es"
				data={[project({ images_topics: ["react", "astro", "ts"] })]}
			/>,
		);
		const stack = screen.getByRole("list", { name: es.PROJECT_DETAIL.STACK });
		expect(
			within(stack)
				.getAllByRole("img")
				.map((i) => i.getAttribute("alt")),
		).toEqual(["react", "astro", "ts"]);
	});

	it("marks the card image for the mask and parallax scenes, eager and decorative", () => {
		const { container } = render(
			<ItemDataProjects currentLocale="es" data={[project()]} />,
		);
		const img = container.querySelector(
			"img[data-parallax-img]",
		) as HTMLImageElement;
		expect(img).toHaveAttribute("alt", "");
		expect(img).toHaveAttribute("loading", "eager");
		expect(container.querySelector("figure[data-mask]")).toBeInTheDocument();
		expect(container.querySelector("[data-hscroll-track]")).toBeInTheDocument();
	});

	it("drops the image skeleton once the picture has loaded", () => {
		const { container } = render(
			<ItemDataProjects
				currentLocale="es"
				data={[project({ images_topics: [] })]}
			/>,
		);
		expect(
			container.querySelector('figure [data-slot="skeleton"]'),
		).toBeInTheDocument();
		const img = container.querySelector(
			"img[data-parallax-img]",
		) as HTMLImageElement;
		img.dispatchEvent(new Event("load"));
		return waitFor(() =>
			expect(
				container.querySelector('figure [data-slot="skeleton"]'),
			).not.toBeInTheDocument(),
		);
	});

	it("renders an empty track for no data", () => {
		const { container } = render(
			<ItemDataProjects currentLocale="es" data={[]} />,
		);
		expect(container.querySelectorAll("article")).toHaveLength(0);
	});
});

describe("ProjectRail", () => {
	const rows = [
		project(),
		project({ project_id: 2, slug: "api", category: "backend", title: "API" }),
		project({ project_id: 3, slug: "web2", title: "Segundo front" }),
	];
	const mockFetch = (body: unknown, status = 200) =>
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })),
		);

	it("shows a loading skeleton, then only its own category", async () => {
		mockFetch({ data: { rows } });
		const { ProjectRail: Rail } = await import(
			"@/features/projects/ProjectRail"
		);
		render(<Rail currentLocale="es" category="frontend" />);

		expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
		expect(await screen.findByText("Mi proyecto")).toBeInTheDocument();
		expect(screen.getByText("Segundo front")).toBeInTheDocument();
		expect(screen.queryByText("API")).not.toBeInTheDocument();
		expect(
			screen.getByText(`2 ${es.PROJECTS.PROJECTS_COUNT_LABEL}`),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", {
				level: 3,
				name: es.PROJECTS.PROJECTS_TITLE_BUTTON_F,
			}),
		).toBeInTheDocument();
	});

	it("tells the reader when a category has no projects", async () => {
		mockFetch({ data: { rows: [rows[1]] } });
		const { ProjectRail: Rail } = await import(
			"@/features/projects/ProjectRail"
		);
		render(<Rail currentLocale="es" category="frontend" />);
		expect(
			await screen.findByText(es.PROJECTS.PROJECTS_EMPTY),
		).toBeInTheDocument();
	});

	it("keeps an empty state when the request fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		mockFetch({}, 503);
		const { ProjectRail: Rail } = await import(
			"@/features/projects/ProjectRail"
		);
		render(<Rail currentLocale="es" category="backend" />);
		expect(
			await screen.findByText(es.PROJECTS.PROJECTS_EMPTY),
		).toBeInTheDocument();
	});

	it("exposes the hooks the pinned-rail scene needs", async () => {
		mockFetch({ data: { rows } });
		const { ProjectRail: Rail } = await import(
			"@/features/projects/ProjectRail"
		);
		const { container } = render(
			<Rail currentLocale="es" category="frontend" />,
		);
		await screen.findByText("Mi proyecto");
		expect(
			container.querySelector("[data-hscroll-viewport]"),
		).toBeInTheDocument();
		expect(container.querySelector("[data-hscroll-track]")).toBeInTheDocument();
		expect(
			container.querySelector("[data-hscroll-progress]"),
		).toBeInTheDocument();
	});

	it("is exported", () => {
		expect(ProjectRail).toBeTypeOf("function");
	});
});
