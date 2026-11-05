// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectGallery } from "@/features/projects/ProjectGallery";

const labels = {
	gallery: "Galería del proyecto",
	previous: "Imagen anterior",
	next: "Imagen siguiente",
	count: "Imagen {n} de {total}",
	goTo: "Ir a la imagen {n}",
	open: "Ver la imagen en grande",
	close: "Cerrar imagen",
};

const image = (n: number) => ({
	src: `https://media.example.dev/projects/${n}.webp`,
	alt: n === 1 ? "Mi proyecto" : `Mi proyecto (${n}/3)`,
});

beforeEach(() => {
	// jsdom no mide el layout ni trae scrollTo en los elementos.
	Element.prototype.scrollTo = vi.fn() as never;
	HTMLDialogElement.prototype.showModal = vi.fn(function (
		this: HTMLDialogElement,
	) {
		this.setAttribute("open", "");
	});
	HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
		this.removeAttribute("open");
		this.dispatchEvent(new Event("close"));
	});
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockReturnValue({
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}),
	);
});

describe("ProjectGallery", () => {
	it("pinta todas las imagenes completas, la primera con prioridad y el resto diferidas", () => {
		render(
			<ProjectGallery
				images={[image(1), image(2), image(3)]}
				labels={labels}
			/>,
		);
		const slides = screen.getAllByRole("listitem", { name: /Imagen \d de 3/ });
		expect(slides).toHaveLength(3);
		const first = within(slides[0]).getByRole("img");
		expect(first).toHaveAttribute("loading", "eager");
		expect(first).toHaveAttribute("fetchpriority", "high");
		expect(first).toHaveClass("object-contain");
		expect(within(slides[1]).getByRole("img")).toHaveAttribute(
			"loading",
			"lazy",
		);
	});

	it("con una sola imagen no hay flechas, contador ni miniaturas", () => {
		render(<ProjectGallery images={[image(1)]} labels={labels} />);
		expect(screen.queryByRole("button", { name: labels.next })).toBeNull();
		expect(screen.queryByText(/\/ 1/)).toBeNull();
		expect(screen.queryByRole("button", { name: /Ir a la imagen/ })).toBeNull();
	});

	it("las flechas avanzan y retroceden, y se bloquean en los extremos", async () => {
		render(
			<ProjectGallery
				images={[image(1), image(2), image(3)]}
				labels={labels}
			/>,
		);
		const prev = screen.getByRole("button", { name: labels.previous });
		const next = screen.getByRole("button", { name: labels.next });
		expect(prev).toBeDisabled();
		expect(screen.getByText("1 / 3")).toBeInTheDocument();

		await userEvent.click(next);
		expect(screen.getByText("2 / 3")).toBeInTheDocument();
		expect(Element.prototype.scrollTo).toHaveBeenCalled();
		await userEvent.click(next);
		expect(screen.getByText("3 / 3")).toBeInTheDocument();
		expect(next).toBeDisabled();
		await userEvent.click(prev);
		expect(screen.getByText("2 / 3")).toBeInTheDocument();
	});

	it("las miniaturas llevan a su imagen y marcan la actual", async () => {
		render(
			<ProjectGallery
				images={[image(1), image(2), image(3)]}
				labels={labels}
			/>,
		);
		await userEvent.click(
			screen.getByRole("button", { name: "Ir a la imagen 3" }),
		);
		expect(screen.getByText("3 / 3")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Ir a la imagen 3" }),
		).toHaveAttribute("aria-current", "true");
		expect(
			screen.getByRole("button", { name: "Ir a la imagen 1" }),
		).not.toHaveAttribute("aria-current");
	});

	it("las flechas del teclado cambian de imagen desde el carrusel", async () => {
		render(<ProjectGallery images={[image(1), image(2)]} labels={labels} />);
		const current = screen.getAllByRole("button", {
			name: new RegExp(labels.open),
		})[0];
		expect(current).toHaveAttribute("tabindex", "0");
		current.focus();
		await userEvent.keyboard("{ArrowRight}");
		expect(screen.getByText("2 / 2")).toBeInTheDocument();
		await userEvent.keyboard("{ArrowLeft}");
		expect(screen.getByText("1 / 2")).toBeInTheDocument();
	});

	it("un clic en la imagen abre el visor con la imagen en grande y se cierra", async () => {
		render(<ProjectGallery images={[image(1), image(2)]} labels={labels} />);
		await userEvent.click(
			screen.getAllByRole("button", { name: new RegExp(labels.open) })[1],
		);
		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
		const dialog = document.querySelector("dialog") as HTMLDialogElement;
		expect(within(dialog).getByRole("img")).toHaveAttribute(
			"src",
			image(2).src,
		);

		await userEvent.click(
			within(dialog).getByRole("button", { name: labels.close }),
		);
		expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
		expect(within(dialog).queryByRole("img")).toBeNull();
	});
});
