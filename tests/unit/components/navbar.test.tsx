// @vitest-environment jsdom
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Nav } from "@/components/sections/Nav";
import { dataListNavbar } from "@/data/locales/es/dataNavbar";
import { ItemsNav } from "@/features/navbar/ItemsNav";
import { LangDrop } from "@/features/navbar/LangDrop";
import { ThemeDrop } from "@/features/navbar/ThemeSwitch";

const prefersDark = (dark: boolean) =>
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches: dark,
		media: query,
		addEventListener() {},
		removeEventListener() {},
	}));

beforeEach(() => {
	localStorage.clear();
	document.documentElement.classList.remove("dark");
	history.replaceState(null, "", "/es/home");
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("ThemeDrop", () => {
	it("offers the opposite theme and flips it on click", async () => {
		prefersDark(false);
		render(<ThemeDrop />);
		const toggle = await screen.findByRole("button", {
			name: "Cambiar a tema oscuro",
		});
		await userEvent.click(toggle);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(
			await screen.findByRole("button", { name: "Cambiar a tema claro" }),
		).toBeInTheDocument();
	});

	it("starts from the stored theme", async () => {
		prefersDark(false);
		localStorage.setItem("theme", "dark");
		render(<ThemeDrop />);
		expect(
			await screen.findByRole("button", { name: "Cambiar a tema claro" }),
		).toBeInTheDocument();
	});
});

describe("ItemsNav", () => {
	/** Puts every nav target in the page, `top` px from the viewport top. */
	const sections = (tops: Record<string, number>) => {
		for (const item of dataListNavbar) {
			const el = document.createElement("section");
			el.id = item.to.slice(1);
			el.getBoundingClientRect = () =>
				({ top: tops[item.to] ?? 9999 }) as DOMRect;
			document.body.append(el);
		}
	};

	beforeEach(() => {
		// jsdom has no layout: without a tall page "scrolled to the bottom" is
		// always true and the last link would always win.
		Object.defineProperty(document.documentElement, "scrollHeight", {
			value: 5000,
			configurable: true,
		});
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("lists the sections in the page language, as anchors", () => {
		sections({});
		render(
			<ul>
				<ItemsNav currentLocale="en" />
			</ul>,
		);
		const links = screen.getAllByRole("link");
		expect(links.map((l) => l.getAttribute("href"))).toEqual(
			dataListNavbar.map((i) => i.to),
		);
		expect(
			screen.getByRole("link", { name: "Ir a Projects" }),
		).toBeInTheDocument();
	});

	it("falls back to Spanish for an unknown locale", () => {
		sections({});
		render(
			<ul>
				<ItemsNav currentLocale="xx" />
			</ul>,
		);
		expect(
			screen.getByRole("link", { name: "Ir a Inicio" }),
		).toBeInTheDocument();
	});

	it("marks the last section whose top reached the reading line", () => {
		sections({
			"#home": -900,
			"#about": -300,
			"#projects": 120,
			"#opinions": 2000,
		});
		render(
			<ul>
				<ItemsNav currentLocale="es" />
			</ul>,
		);
		const active = screen
			.getAllByRole("link")
			.filter((l) => l.classList.contains("text-foreground"));
		expect(active).toHaveLength(1);
		expect(active[0]).toHaveAttribute("href", "#projects");
	});

	it("marks the last link when the page is scrolled to the very bottom", () => {
		sections({ "#home": -5000 });
		Object.defineProperty(document.documentElement, "scrollHeight", {
			value: 1000,
			configurable: true,
		});
		Object.defineProperty(window, "scrollY", {
			value: 1000,
			configurable: true,
		});
		render(
			<ul>
				<ItemsNav currentLocale="es" />
			</ul>,
		);
		const last = dataListNavbar.at(-1)?.to;
		expect(screen.getAllByRole("link").at(-1)).toHaveAttribute("href", last);
		expect(
			screen.getAllByRole("link").at(-1)?.classList.contains("text-foreground"),
		).toBe(true);
		Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
	});

	it("re-reads the position on scroll", async () => {
		const tops: Record<string, number> = { "#home": 0 };
		sections(tops);
		vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
			cb(0);
			return 1;
		});
		render(
			<ul>
				<ItemsNav currentLocale="es" />
			</ul>,
		);
		const about = document.getElementById("about") as HTMLElement;
		about.getBoundingClientRect = () => ({ top: 10 }) as DOMRect;
		act(() => {
			window.dispatchEvent(new Event("scroll"));
		});
		await waitFor(() =>
			expect(
				screen
					.getByRole("link", { name: "Ir a Acerca de mí" })
					.classList.contains("text-foreground"),
			).toBe(true),
		);
	});

	it("tells the sidebar to close only on narrow screens", async () => {
		sections({});
		const onItemClick = vi.fn();
		render(
			<ul>
				<ItemsNav currentLocale="es" onItemClick={onItemClick} />
			</ul>,
		);
		const link = screen.getByRole("link", { name: "Ir a Proyectos" });

		Object.defineProperty(window, "innerWidth", {
			value: 1280,
			configurable: true,
		});
		await userEvent.click(link);
		expect(onItemClick).not.toHaveBeenCalled();

		Object.defineProperty(window, "innerWidth", {
			value: 375,
			configurable: true,
		});
		await userEvent.click(link);
		expect(onItemClick).toHaveBeenCalledTimes(1);
		Object.defineProperty(window, "innerWidth", {
			value: 1024,
			configurable: true,
		});
	});
});

describe("LangDrop", () => {
	const assign = vi.fn();
	beforeEach(() => {
		assign.mockReset();
		// jsdom cannot navigate: replace location with a recorder.
		const real = window.location;
		vi.stubGlobal("location", {
			get pathname() {
				return real.pathname;
			},
			get search() {
				return "?q=1";
			},
			get hash() {
				return "#projects";
			},
			set href(value: string) {
				assign(value);
			},
		});
	});

	it("shows the language the URL says, not just the prop", async () => {
		history.replaceState(null, "", "/en/home");
		render(<LangDrop currentLocale="es" />);
		expect(await screen.findByText("English")).toBeInTheDocument();
	});

	it("lists the three languages and marks the current one", async () => {
		render(<LangDrop currentLocale="es" />);
		await userEvent.click(screen.getByRole("button", { name: /Español/ }));
		const items = await screen.findAllByRole("menuitem");
		expect(items).toHaveLength(3);
		expect(
			items.find((i) => i.getAttribute("data-selected") !== null),
		).toHaveTextContent("Español");
	});

	it("switches language keeping the rest of the path, the query and the hash", async () => {
		render(<LangDrop currentLocale="es" />);
		await userEvent.click(screen.getByRole("button", { name: /Español/ }));
		const items = await screen.findAllByRole("menuitem");
		await userEvent.click(
			items.find((i) => i.textContent?.includes("English")) as HTMLElement,
		);
		expect(assign).toHaveBeenCalledWith("/en/home?q=1#projects");
	});

	it("does nothing when choosing the language you are already on", async () => {
		render(<LangDrop currentLocale="es" />);
		await userEvent.click(screen.getByRole("button", { name: /Español/ }));
		const items = await screen.findAllByRole("menuitem");
		await userEvent.click(
			items.find((i) => i.textContent?.includes("Español")) as HTMLElement,
		);
		expect(assign).not.toHaveBeenCalled();
	});
});

describe("Nav", () => {
	it("links the brand to the home of the current language", () => {
		render(<Nav currentLocale="fr" />);
		expect(screen.getByRole("link", { name: "Khelde." })).toHaveAttribute(
			"href",
			"/fr/home",
		);
	});

	it("opens the mobile menu with the same links", async () => {
		render(<Nav currentLocale="es" />);
		await userEvent.click(screen.getByRole("button", { name: /menú/i }));
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toBeInTheDocument();
		// The page behind a modal menu is hidden from assistive tech: the links
		// that count are the ones inside the dialog.
		expect(
			within(dialog).getByRole("link", { name: "Ir a Contacto" }),
		).toHaveAttribute("href", "#contact");
	});
});
