import { describe, expect, it } from "vitest";
import { githubHandle, mailtoUrl, whatsappUrl } from "@/lib/contactLinks";

describe("enlaces de contacto", () => {
	it("WhatsApp se arma con los digitos del telefono", () => {
		expect(whatsappUrl("+52 55 1190 9105")).toBe("https://wa.me/525511909105");
		expect(whatsappUrl("+52-551-190 9105")).toBe("https://wa.me/525511909105");
	});

	it("el usuario de GitHub sale de la URL", () => {
		expect(githubHandle("https://github.com/muke78")).toBe("muke78");
		expect(githubHandle("https://github.com/muke78/")).toBe("muke78");
		expect(githubHandle("https://github.com/")).toBe("github.com");
		expect(githubHandle("no es url")).toBe("github.com");
	});

	it("mailto", () => {
		expect(mailtoUrl("a@b.dev")).toBe("mailto:a@b.dev");
	});
});
