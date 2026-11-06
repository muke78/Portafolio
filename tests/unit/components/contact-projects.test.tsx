// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/components/Toaster";
import { Form } from "@/features/contact/Form";
import { SkeletonProjectsCard } from "@/features/projects/items/SkeletonProjectsCard";
import { getI18N } from "@/i18n";

const es = getI18N({ currentLocale: "es" });

const contact = {
	github_url: "https://github.com/muke78",
	linkedin_url: "https://www.linkedin.com/in/alguien/",
	linkedin_name: "Erick Gonzalez",
	phone: "+52 55 1190 9105",
	email: "persona@example.com",
};

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
