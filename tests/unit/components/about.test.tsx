// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StoryBlock } from "@/components/sections/StoryBlock";
import {
	AboutMeBlock,
	EducationBlock,
	ExperienceBlock,
	SkillsBlock,
} from "@/features/aboutMe/AboutBlocks";
import { ItemDataEducacion } from "@/features/aboutMe/Items/ItemDataEducacion";
import { ItemDataExperiencia } from "@/features/aboutMe/Items/ItemDataExperiencia";
import { ItemDataHabilidades } from "@/features/aboutMe/Items/ItemDataHabilidades";
import { ItemDataSobreMi } from "@/features/aboutMe/Items/ItemDataSobreMi";
import {
	SkeletonAboutMe,
	SkeletonEducation,
	SkeletonExperience,
} from "@/features/aboutMe/Items/SkeletonAbout";
import { getI18N } from "@/i18n";

const es = getI18N({ currentLocale: "es" });

const respond = (body: unknown, status = 200) =>
	vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("StoryBlock", () => {
	it("split layout: a real h2 marked for the title split, plus the lead", () => {
		render(
			<StoryBlock title="Acerca" lead="Quién soy">
				<p>contenido</p>
			</StoryBlock>,
		);
		const h2 = screen.getByRole("heading", { level: 2, name: "Acerca" });
		expect(h2).toHaveAttribute("data-split");
		expect(screen.getByText("Quién soy")).toHaveAttribute("data-reveal");
		expect(screen.getByText("contenido")).toBeInTheDocument();
	});

	it("stacked layout puts the content below a full-width stage", () => {
		const { container } = render(
			<StoryBlock title="Habilidades" layout="stacked">
				<p>escenario</p>
			</StoryBlock>,
		);
		expect(container.firstElementChild).toHaveClass("flex-col");
		expect(container.querySelector(".lg\\:col-span-8")).toBeNull();
	});

	it("omits the lead when there is none", () => {
		const { container } = render(
			<StoryBlock title="X">
				<span />
			</StoryBlock>,
		);
		expect(container.querySelector("[data-reveal]")).toBeNull();
	});
});

describe("skeletons", () => {
	it.each([
		["SkeletonEducation", SkeletonEducation],
		["SkeletonExperience", SkeletonExperience],
		["SkeletonAboutMe", SkeletonAboutMe],
	])("%s announces loading to assistive tech", (_name, Skeleton) => {
		render(<Skeleton label="Cargando" />);
		const status = screen.getByRole("status");
		expect(status).toHaveAttribute("aria-busy", "true");
		expect(within(status).getByText("Cargando")).toBeInTheDocument();
	});
});

describe("ItemDataSobreMi", () => {
	const about = {
		about_id: 1,
		image: "https://img/x.png",
		title_card: "Desarrollador",
		subtitle: "Quién soy",
		description: "Texto largo",
	};

	it("shows a skeleton first, then the card in reading order", async () => {
		vi.stubGlobal("fetch", respond({ data: about }));
		render(<ItemDataSobreMi currentLocale="es" />);
		expect(screen.getByRole("status")).toBeInTheDocument();

		expect(
			await screen.findByRole("heading", { level: 3, name: "Desarrollador" }),
		).toBeInTheDocument();
		expect(screen.getByText("Quién soy")).toHaveClass("eyebrow");
		expect(screen.getByText("Texto largo")).toHaveAttribute("data-scrub-text");
		expect(
			screen.getByRole("img", { name: es.ABOUTME.ABOUT_TITLE }),
		).toHaveAttribute("src", about.image);
	});

	it("asks the API for the page language", async () => {
		const fetchMock = respond({ data: about });
		vi.stubGlobal("fetch", fetchMock);
		render(<ItemDataSobreMi currentLocale="fr" />);
		await screen.findByText("Texto largo");
		expect(fetchMock).toHaveBeenCalledWith("/api/about?currentLocale=fr");
	});

	it("keeps the skeleton when the API has no data", async () => {
		vi.stubGlobal(
			"fetch",
			respond({ message: "No se pudo obtener about" }, 503),
		);
		render(<ItemDataSobreMi currentLocale="es" />);
		await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("survives a network error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		render(<ItemDataSobreMi currentLocale="es" />);
		await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
		expect(screen.getByRole("status")).toBeInTheDocument();
	});
});

describe("ItemDataEducacion", () => {
	const rows = [
		{
			education_id: 1,
			institution: "UNAM",
			subtitle: "Ingeniería",
			description: "Cuatro años",
			image: "https://img/u.png",
			period: "2019-2022",
		},
		{
			education_id: 2,
			institution: "Platzi",
			subtitle: "Cursos",
			description: "Varios",
			image: "https://img/p.png",
			period: "2023",
		},
	];

	it("renders one card per institution, institution first, period as a label", async () => {
		vi.stubGlobal("fetch", respond({ data: rows }));
		render(<ItemDataEducacion currentLocale="es" />);

		const cards = await screen.findAllByRole("article");
		expect(cards).toHaveLength(2);
		expect(
			within(cards[0]).getByRole("heading", { level: 3 }),
		).toHaveTextContent("UNAM");
		expect(within(cards[0]).getByText("2019-2022")).toHaveClass("eyebrow");
		expect(within(cards[0]).getByText("Cuatro años")).toHaveAttribute(
			"data-scrub-text",
		);
		expect(
			within(cards[0]).getByRole("img", { name: "UNAM" }),
		).toBeInTheDocument();
	});

	it("shows nothing (not a crash) when the API answers without data", async () => {
		vi.stubGlobal("fetch", respond({ message: "error" }, 503));
		const { container } = render(<ItemDataEducacion currentLocale="es" />);
		await vi.waitFor(() =>
			expect(screen.queryByRole("status")).not.toBeInTheDocument(),
		);
		expect(screen.queryAllByRole("article")).toHaveLength(0);
		// The component itself is still mounted (an empty list, not a crashed tree).
		expect(container.firstElementChild).not.toBeNull();
	});
});

describe("ItemDataExperiencia", () => {
	const rows = [
		{
			experience_id: 1,
			work: "Tiempo completo",
			title: "Desarrollador Full-Stack | Equipo de producto",
			description: "Acme · Contrato",
			img: "acme.png",
			alt: "Logo de Acme",
			time: "2022 - 2024",
			location: "CDMX",
		},
		{
			experience_id: 2,
			work: "Freelance",
			title: "Solo rol",
			description: "Empresa sin contrato",
			img: "e.png",
			alt: "Logo",
			time: "2021",
			location: "Remoto",
		},
	];

	it("splits the packed strings into role/context and company/contract", async () => {
		vi.stubGlobal("fetch", respond({ data: rows }));
		render(<ItemDataExperiencia currentLocale="es" />);

		const cards = await screen.findAllByRole("article");
		expect(cards).toHaveLength(2);
		expect(
			within(cards[0]).getByRole("heading", { level: 3 }),
		).toHaveTextContent("Desarrollador Full-Stack");
		expect(
			within(cards[0]).getByText("Equipo de producto"),
		).toBeInTheDocument();
		expect(within(cards[0]).getByText("Acme")).toBeInTheDocument();
		expect(within(cards[0]).getByText("Contrato")).toBeInTheDocument();
		expect(within(cards[0]).getByText("2022 - 2024")).toBeInTheDocument();
	});

	it("falls back to the work type when the description carries no contract", async () => {
		vi.stubGlobal("fetch", respond({ data: rows }));
		render(<ItemDataExperiencia currentLocale="es" />);
		const cards = await screen.findAllByRole("article");
		expect(within(cards[1]).getByText("Freelance")).toBeInTheDocument();
		expect(
			within(cards[1]).getByText("Empresa sin contrato"),
		).toBeInTheDocument();
	});

	it("lays the cards out as a stack: sticky offsets grow, then plateau", async () => {
		const many = Array.from({ length: 12 }, (_, i) => ({
			...rows[0],
			experience_id: i + 1,
			title: `Rol ${i} | x`,
		}));
		vi.stubGlobal("fetch", respond({ data: many }));
		const { container } = render(<ItemDataExperiencia currentLocale="es" />);
		const cards = await screen.findAllByRole("article");
		expect(container.querySelector("[data-stack]")).toBeInTheDocument();
		expect(cards[0].style.top).toContain("0px");
		expect(cards[1].style.top).toContain("14px");
		// Capped at 8 steps: the 10th and the 12th share the lowest step.
		expect(cards[9].style.top).toBe(cards[11].style.top);
		for (const card of cards) expect(card).not.toHaveAttribute("data-reveal");
	});

	it("shows nothing (not a crash) when the API answers without data", async () => {
		vi.stubGlobal("fetch", respond({ message: "error" }, 503));
		const { container } = render(<ItemDataExperiencia currentLocale="es" />);
		await vi.waitFor(() =>
			expect(screen.queryByRole("status")).not.toBeInTheDocument(),
		);
		expect(screen.queryAllByRole("article")).toHaveLength(0);
		expect(container.firstElementChild).not.toBeNull();
	});
});

describe("ItemDataHabilidades", () => {
	const skills = [
		{ skill_id: 1, title: "Frontend", images_topics: ["react", "astro"] },
		{ skill_id: 2, title: "Backend", images_topics: ["hono"] },
	];

	it("shows every technology of every group, with no 'see more' gate", async () => {
		vi.stubGlobal("fetch", respond({ data: skills }));
		const { container } = render(<ItemDataHabilidades currentLocale="es" />);

		expect(
			await screen.findByRole("heading", { level: 3, name: "Frontend" }),
		).toBeInTheDocument();
		expect(screen.getByRole("region", { name: "Backend" })).toBeInTheDocument();
		expect(container.querySelectorAll("[data-fly-chip]")).toHaveLength(3);
		expect(container.querySelectorAll("[data-fly-group]")).toHaveLength(2);
		expect(screen.getByText("hono")).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("draws the decorative snake (hidden from assistive tech) with its dot", async () => {
		vi.stubGlobal("fetch", respond({ data: skills }));
		const { container } = render(<ItemDataHabilidades currentLocale="es" />);
		await screen.findByText("react");
		expect(container.querySelector("svg[data-snake]")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		expect(container.querySelector("[data-snake-trace]")).toBeInTheDocument();
		expect(container.querySelector("[data-snake-dot]")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
	});

	it("shows a skeleton while loading", () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => new Promise(() => {})),
		);
		const { container } = render(<ItemDataHabilidades currentLocale="es" />);
		expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(
			3,
		);
	});

	it("shows nothing (not a crash) when the API answers without data", async () => {
		vi.stubGlobal("fetch", respond({ message: "error" }, 503));
		const { container } = render(<ItemDataHabilidades currentLocale="es" />);
		await vi.waitFor(() =>
			expect(container.querySelector("[data-skills]")).toBeInTheDocument(),
		);
		expect(container.querySelectorAll("[data-fly-chip]")).toHaveLength(0);
	});
});

describe("AboutBlocks", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => new Promise(() => {})),
		);
	});

	it.each([
		["AboutMeBlock", AboutMeBlock, es.ABOUTME.ABOUT_TITLE],
		["EducationBlock", EducationBlock, es.EDUCATION.EDUCATION_TITLE],
		["ExperienceBlock", ExperienceBlock, es.ABOUTME.EXPERIENCE],
		["SkillsBlock", SkillsBlock, es.SKILLS.SKILLS_TITLE],
	])("%s titles its scene from the translations", (_name, Block, title) => {
		render(<Block currentLocale="es" />);
		expect(
			screen.getByRole("heading", { level: 2, name: title }),
		).toBeInTheDocument();
	});

	it("AboutMeBlock adds the lead line", () => {
		render(<AboutMeBlock currentLocale="es" />);
		expect(screen.getByText(es.ABOUTME.ABOUT_TITLE_CARD)).toBeInTheDocument();
	});
});
