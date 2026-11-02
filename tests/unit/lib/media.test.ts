import { describe, expect, it, vi } from "vitest";

vi.mock("astro:env/client", () => ({
	PUBLIC_MEDIA_URL: "https://media.example.dev/",
}));

const { mediaUrl } = await import("@/lib/media");

describe("mediaUrl", () => {
	it("pega la clave al origen de los medios", () => {
		expect(mediaUrl("Backend_Task.webp")).toBe(
			"https://media.example.dev/Backend_Task.webp",
		);
	});

	it("no duplica la barra si la clave empieza con /", () => {
		expect(mediaUrl("/UPVM.webp")).toBe("https://media.example.dev/UPVM.webp");
		expect(mediaUrl("///UPVM.webp")).toBe(
			"https://media.example.dev/UPVM.webp",
		);
	});

	it("respeta las carpetas dentro del bucket", () => {
		expect(mediaUrl("projects/a/b.webp")).toBe(
			"https://media.example.dev/projects/a/b.webp",
		);
	});

	it("una clave con // inicial nunca produce una URL de otro host", () => {
		const url = new URL(mediaUrl("//evil.example/x.png"));
		expect(url.host).toBe("media.example.dev");
	});
});
