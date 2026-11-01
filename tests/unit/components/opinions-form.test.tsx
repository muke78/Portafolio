// @vitest-environment jsdom
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommentWidget } from "@/features/opinions/CommentWidget";
import { CountryFlag } from "@/features/opinions/Items/CountryFlag";
import { SkeletonTestimonialCard } from "@/features/opinions/SkeletonTestimonialCard";
import { SubmittedOpinion } from "@/features/opinions/SubmittedOpinion";
import { SendOpinions } from "@/features/opinions/sendOpinions";
import { getI18N } from "@/i18n";

const es = getI18N({ currentLocale: "es" });

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("CountryFlag", () => {
	it("draws the flag for a valid ISO code", () => {
		render(<CountryFlag countryCode="MX" />);
		expect(screen.getByTitle("MX")).toBeInTheDocument();
	});

	it.each(["", "mx", "MEX", "1X"])("falls back to a globe for %j", (code) => {
		render(<CountryFlag countryCode={code} />);
		expect(screen.getByText("🌐")).toBeInTheDocument();
	});
});

describe("SkeletonTestimonialCard", () => {
	it("renders placeholder blocks, no text", () => {
		const { container } = render(<SkeletonTestimonialCard />);
		expect(
			container.querySelectorAll('[data-slot="skeleton"]').length,
		).toBeGreaterThan(5);
		expect(container.textContent).toBe("");
	});
});

describe("SubmittedOpinion", () => {
	it("compact: thanks the reader and offers a close button", async () => {
		const onClose = vi.fn();
		render(<SubmittedOpinion currentLocale="es" compact onClose={onClose} />);
		expect(
			screen.getByText(es.OPINIONS.OPINIONS_SEND_SUCCESSFULL),
		).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button"));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("full page: links back to the comments", () => {
		render(<SubmittedOpinion currentLocale="en" />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "home#opinions");
		expect(link).toHaveTextContent(
			getI18N({ currentLocale: "en" }).OPINIONS.OPINIONS_REDIRECT_COMMENTS,
		);
	});
});

describe("SendOpinions", () => {
	const fillValid = async () => {
		await userEvent.type(
			screen.getByLabelText(new RegExp(es.FORM.INPUT_NAME)),
			"Erick González",
		);
		await userEvent.type(
			screen.getByLabelText(new RegExp(es.FORM.INPUT_TELL_EXPERIENCE)),
			"Trabajar con él fue una gran experiencia.",
		);
		// The country is a Select: open it and choose México.
		await userEvent.click(screen.getByRole("combobox"));
		await userEvent.click(
			await screen.findByRole("option", { name: /México/ }),
		);
	};

	it("blocks an empty submit and shows each error under its field", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		render(<SendOpinions currentLocale="es" />);
		await userEvent.click(
			screen.getByRole("button", {
				name: new RegExp(es.OPINIONS.OPINIONS_SEND_INFORMATION),
			}),
		);

		expect(
			await screen.findByText(es.FORM.FORM_VALID_NAME),
		).toBeInTheDocument();
		expect(
			screen.getByText(es.OPINIONS.OPINIONS_FORM_VALID_MORE_INFORMATION_MIN),
		).toBeInTheDocument();
		expect(
			screen.getByText(es.OPINIONS.OPINIONS_FORM_VALID_COUNTRY_EMPTY),
		).toBeInTheDocument();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("posts the opinion and switches to the thank-you view", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response("{}", { status: 201 }));
		vi.stubGlobal("fetch", fetchMock);
		render(<SendOpinions currentLocale="es" />);
		await fillValid();
		await userEvent.click(
			screen.getByRole("button", {
				name: new RegExp(es.OPINIONS.OPINIONS_SEND_INFORMATION),
			}),
		);

		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("/api/comments");
		expect(init.method).toBe("POST");
		expect(JSON.parse(init.body)).toMatchObject({
			name: "Erick González",
			country: "México",
			country_flag: "MX",
		});
		expect(
			await screen.findByText(es.OPINIONS.OPINIONS_SEND_SUCCESSFULL),
		).toBeInTheDocument();
	});

	it("shows an alert and keeps the form when the API fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("x", { status: 503 })),
		);
		render(<SendOpinions currentLocale="es" />);
		await fillValid();
		await userEvent.click(
			screen.getByRole("button", {
				name: new RegExp(es.OPINIONS.OPINIONS_SEND_INFORMATION),
			}),
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			es.FORM.FORM_SEND_INFORMATION_INCORRECT,
		);
		expect(
			screen.queryByText(es.OPINIONS.OPINIONS_SEND_SUCCESSFULL),
		).not.toBeInTheDocument();
	});

	it("shows an alert on a network error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		render(<SendOpinions currentLocale="es" />);
		await fillValid();
		await userEvent.click(
			screen.getByRole("button", {
				name: new RegExp(es.OPINIONS.OPINIONS_SEND_INFORMATION),
			}),
		);
		expect(await screen.findByRole("alert")).toBeInTheDocument();
	});

	it("speaks the page language", () => {
		render(<SendOpinions currentLocale="fr" />);
		expect(
			screen.getByText(
				getI18N({ currentLocale: "fr" }).OPINIONS.OPINIONS_FORM_TITLE,
			),
		).toBeInTheDocument();
	});
});

describe("CommentWidget", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	const trigger = () =>
		screen.getByRole("button", { name: "Dejar un comentario" });

	it("starts closed, with the launcher marked for the motion engine", () => {
		render(<CommentWidget currentLocale="es" />);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(trigger()).toHaveAttribute("data-fab");
		expect(trigger()).toHaveAttribute("aria-expanded", "false");
	});

	it("opens a compact dialog from the launcher and focuses the first field", async () => {
		render(<CommentWidget currentLocale="es" />);
		await userEvent.click(trigger());
		const dialog = screen.getByRole("dialog", { name: "Dejar un comentario" });
		expect(dialog).toHaveAttribute("data-dialog");
		expect(
			screen.getByRole("button", { name: "Cerrar formulario de comentario" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(dialog.querySelector("input")).toHaveFocus();
	});

	it("toggles closed from the launcher", async () => {
		render(<CommentWidget currentLocale="es" />);
		await userEvent.click(trigger());
		await userEvent.click(
			screen.getByRole("button", { name: "Cerrar formulario de comentario" }),
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("closes with Escape and gives the focus back to the launcher", async () => {
		render(<CommentWidget currentLocale="es" />);
		await userEvent.click(trigger());
		await userEvent.keyboard("{Escape}");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(trigger()).toHaveFocus();
	});

	it("closes when the reader presses outside the panel", async () => {
		render(
			<>
				<p>fuera</p>
				<CommentWidget currentLocale="es" />
			</>,
		);
		await userEvent.click(trigger());
		fireEvent.pointerDown(screen.getByText("fuera"));
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
	});

	it("stays open when the press is inside the panel or on a select popup", async () => {
		render(<CommentWidget currentLocale="es" />);
		await userEvent.click(trigger());
		const dialog = screen.getByRole("dialog");
		fireEvent.pointerDown(dialog);

		const popup = document.createElement("div");
		popup.setAttribute("data-slot", "select-content");
		document.body.append(popup);
		fireEvent.pointerDown(popup);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("opens when the page asks for it (hero and footer buttons)", () => {
		render(<CommentWidget currentLocale="es" />);
		act(() => {
			window.dispatchEvent(new Event("khelde:open-comment-widget"));
		});
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
