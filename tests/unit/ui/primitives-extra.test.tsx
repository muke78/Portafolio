// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

describe("DropdownMenu", () => {
	it("runs an item's handler and closes", async () => {
		const onClick = vi.fn();
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Abrir</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={onClick}>Copiar</DropdownMenuItem>
					<DropdownMenuItem variant="destructive" inset>
						Borrar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
		await userEvent.click(
			await screen.findByRole("menuitem", { name: "Copiar" }),
		);
		expect(onClick).toHaveBeenCalledTimes(1);
		await vi.waitFor(() =>
			expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
		);
	});

	it("reports a checkbox item being toggled", async () => {
		const onCheckedChange = vi.fn();
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Vista</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuCheckboxItem
						checked={false}
						onCheckedChange={onCheckedChange}
					>
						Barra
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Vista" }));
		const item = await screen.findByRole("menuitemcheckbox", { name: "Barra" });
		expect(item).toHaveAttribute("aria-checked", "false");
		await userEvent.click(item);
		expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
	});

	it("selects one radio item at a time", async () => {
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Orden</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuGroup>
						<DropdownMenuLabel inset>Ordenar por</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuRadioGroup value="fecha">
							<DropdownMenuRadioItem value="fecha">Fecha</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="nombre">
								Nombre
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Orden" }));
		expect(
			await screen.findByRole("menuitemradio", { name: "Fecha" }),
		).toHaveAttribute("aria-checked", "true");
		expect(
			screen.getByRole("menuitemradio", { name: "Nombre" }),
		).toHaveAttribute("aria-checked", "false");
	});

	it("opens a submenu from its trigger", async () => {
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Más</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Compartir</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem>Correo</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Más" }));
		await userEvent.click(
			await screen.findByRole("menuitem", { name: "Compartir" }),
		);
		expect(
			await screen.findByRole("menuitem", { name: "Correo" }),
		).toBeInTheDocument();
	});
});

describe("Select", () => {
	it("opens, lists the options and keeps the chosen one", async () => {
		const onValueChange = vi.fn();
		render(
			<Select onValueChange={onValueChange}>
				<SelectTrigger aria-label="Idioma" size="sm">
					<SelectValue placeholder="Elige" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Idiomas</SelectLabel>
						<SelectItem value="es">Español</SelectItem>
						<SelectSeparator />
						<SelectItem value="en">English</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>,
		);
		await userEvent.click(screen.getByRole("combobox", { name: "Idioma" }));
		expect(await screen.findAllByRole("option")).toHaveLength(2);
		await userEvent.click(screen.getByRole("option", { name: "English" }));
		expect(onValueChange).toHaveBeenCalledWith("en", expect.anything());
	});

	it("can start with a value", () => {
		render(
			<Select defaultValue="es">
				<SelectTrigger aria-label="Idioma">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="es">Español</SelectItem>
				</SelectContent>
			</Select>,
		);
		expect(screen.getByRole("combobox", { name: "Idioma" })).toHaveTextContent(
			"es",
		);
	});
});

describe("Sheet", () => {
	const Demo = ({ side }: { side: "top" | "right" | "bottom" | "left" }) => (
		<Sheet>
			<SheetTrigger>Abrir</SheetTrigger>
			<SheetContent side={side}>
				<SheetHeader>
					<SheetTitle>Título</SheetTitle>
					<SheetDescription>Descripción</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetClose>Cerrar hoja</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);

	it.each(["top", "right", "bottom", "left"] as const)(
		"opens from the %s",
		async (side) => {
			render(<Demo side={side} />);
			await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
			const dialog = await screen.findByRole("dialog");
			expect(dialog).toHaveAttribute("data-side", side);
		},
	);

	it("closes from its own close button", async () => {
		render(<Demo side="right" />);
		await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
		await userEvent.click(
			await screen.findByRole("button", { name: "Cerrar hoja" }),
		);
		await vi.waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
	});

	it("closes with Escape", async () => {
		render(<Demo side="right" />);
		await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
		await screen.findByRole("dialog");
		await userEvent.keyboard("{Escape}");
		await vi.waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
	});
});
