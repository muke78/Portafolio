// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toaster, toast } from "@/components/Toaster";

afterEach(() => {
	toast.remove();
	vi.useRealTimers();
});

describe("Toaster", () => {
	it("un exito se anuncia como status y un error interrumpe como alert", () => {
		render(<Toaster closeLabel="Cerrar aviso" />);
		act(() => {
			toast.success("Enviado");
			toast.error("Fallo");
		});
		expect(screen.getByRole("status")).toHaveTextContent("Enviado");
		expect(screen.getByRole("alert")).toHaveTextContent("Fallo");
	});

	it("se cierra solo pasado el tiempo y tambien con su boton", async () => {
		vi.useFakeTimers();
		render(<Toaster closeLabel="Cerrar aviso" />);
		act(() => {
			toast.success("Uno", { duration: 1000 });
		});
		expect(screen.getByText("Uno")).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(1001);
		});
		expect(screen.queryByText("Uno")).toBeNull();

		vi.useRealTimers();
		act(() => {
			toast.error("Dos");
		});
		await userEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
		expect(screen.queryByText("Dos")).toBeNull();
	});

	it("no escribe estilos en la pagina (un CSP con hashes no lo permitiria)", () => {
		const before = document.querySelectorAll("style").length;
		render(<Toaster closeLabel="Cerrar aviso" />);
		act(() => {
			toast.success("Sin estilos inyectados");
		});
		expect(document.querySelectorAll("style")).toHaveLength(before);
	});
});
