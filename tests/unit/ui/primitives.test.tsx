// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useId } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

describe("Button", () => {
	it.each([
		"default",
		"outline",
		"secondary",
		"ghost",
		"destructive",
		"link",
	] as const)("renders the %s variant", (variant) => {
		render(<Button variant={variant}>Go</Button>);
		const button = screen.getByRole("button", { name: "Go" });
		expect(button).toHaveClass(buttonVariants({ variant }).split(" ")[0]);
	});

	it.each(["default", "xs", "sm", "lg", "icon", "icon-sm"] as const)(
		"renders the %s size",
		(size) => {
			render(<Button size={size}>x</Button>);
			expect(screen.getByRole("button")).toBeInTheDocument();
		},
	);

	it("forwards clicks, disabled and custom classes", async () => {
		let clicks = 0;
		render(
			<Button className="extra" onClick={() => clicks++}>
				Press
			</Button>,
		);
		const button = screen.getByRole("button", { name: "Press" });
		expect(button).toHaveClass("extra");
		await userEvent.click(button);
		expect(clicks).toBe(1);
	});

	it("does not fire when disabled", async () => {
		let clicks = 0;
		render(
			<Button disabled onClick={() => clicks++}>
				Off
			</Button>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Off" }));
		expect(clicks).toBe(0);
	});
});

describe("Badge, Skeleton, Label", () => {
	it.each([
		"default",
		"secondary",
		"destructive",
		"outline",
		"ghost",
		"link",
	] as const)("Badge renders the %s variant", (variant) => {
		render(<Badge variant={variant}>tag</Badge>);
		expect(screen.getByText("tag")).toBeInTheDocument();
	});

	it("Skeleton renders a decorative block that keeps custom classes", () => {
		const { container } = render(<Skeleton className="h-4 w-10" />);
		expect(container.firstElementChild).toHaveClass("h-4", "w-10");
	});

	it("Label is tied to its input", () => {
		const Field = () => {
			const id = useId();
			return (
				<>
					<Label htmlFor={id}>Nombre</Label>
					<Input id={id} />
				</>
			);
		};
		render(<Field />);
		expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
	});
});

describe("Input and Textarea", () => {
	it("Input takes typing and the type attribute", async () => {
		render(<Input type="email" placeholder="Correo" />);
		const input = screen.getByPlaceholderText("Correo");
		expect(input).toHaveAttribute("type", "email");
		await userEvent.type(input, "a@b.co");
		expect(input).toHaveValue("a@b.co");
	});

	it("Input respects disabled and aria-invalid", () => {
		render(<Input disabled aria-invalid placeholder="x" />);
		const input = screen.getByPlaceholderText("x");
		expect(input).toBeDisabled();
		expect(input).toHaveAttribute("aria-invalid", "true");
	});

	it("Textarea takes typing", async () => {
		render(<Textarea placeholder="Mensaje" />);
		const area = screen.getByPlaceholderText("Mensaje");
		await userEvent.type(area, "Hola");
		expect(area).toHaveValue("Hola");
	});
});

describe("Card", () => {
	it("composes its slots", () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Título</CardTitle>
					<CardDescription>Descripción</CardDescription>
					<CardAction>Acción</CardAction>
				</CardHeader>
				<CardContent>Contenido</CardContent>
				<CardFooter>Pie</CardFooter>
			</Card>,
		);
		for (const text of [
			"Título",
			"Descripción",
			"Acción",
			"Contenido",
			"Pie",
		]) {
			expect(screen.getByText(text)).toBeInTheDocument();
		}
	});
});

describe("Tabs", () => {
	it("shows the selected panel and switches on click", async () => {
		render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Uno</TabsTrigger>
					<TabsTrigger value="b">Dos</TabsTrigger>
				</TabsList>
				<TabsContent value="a">Panel uno</TabsContent>
				<TabsContent value="b">Panel dos</TabsContent>
			</Tabs>,
		);
		expect(screen.getByText("Panel uno")).toBeVisible();
		await userEvent.click(screen.getByRole("tab", { name: "Dos" }));
		expect(screen.getByText("Panel dos")).toBeVisible();
	});
});

describe("Sheet", () => {
	it("opens as a dialog from its trigger", async () => {
		render(
			<Sheet>
				<SheetTrigger>Abrir</SheetTrigger>
				<SheetContent side="left">
					<SheetHeader>
						<SheetTitle>Menú</SheetTitle>
						<SheetDescription>Navegación</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Menú")).toBeInTheDocument();
	});
});

describe("DropdownMenu", () => {
	it("lists its items once opened", async () => {
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Idioma</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuGroup>
						<DropdownMenuLabel>Elige</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							Español
							<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem>English</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Idioma" }));
		expect(await screen.findByRole("menu")).toBeInTheDocument();
		expect(screen.getAllByRole("menuitem")).toHaveLength(2);
	});
});

describe("Select", () => {
	it("renders its trigger with the placeholder", () => {
		render(
			<Select>
				<SelectTrigger aria-label="País">
					<SelectValue placeholder="Elige un país" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Países</SelectLabel>
						<SelectItem value="mx">México</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>,
		);
		expect(screen.getByRole("combobox", { name: "País" })).toBeInTheDocument();
		expect(screen.getByText("Elige un país")).toBeInTheDocument();
	});
});
