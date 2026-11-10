import { describe, expect, it } from "vitest";
import { getI18N } from "@/i18n";
import { contactSchema } from "@/schemas/contactSchema";
import { opinionsSchema } from "@/schemas/opinionsSchema";

const contact = contactSchema({ currentLocale: "es" });
const opinion = opinionsSchema({ currentLocale: "es" });
const es = getI18N({ currentLocale: "es" });

const validContact = {
	name: "Erick González",
	email: "erick@example.com",
	phone: "+52 55 1234 5678",
};
const validOpinion = {
	name: "Erick González",
	job: "Desarrollador",
	description: "Excelente trabajo en cada uno de los proyectos entregados.",
	country: "Mexico",
	country_flag: "MX",
};
const messages = (r: {
	success: boolean;
	error?: { issues: { message: string }[] };
}) => r.error?.issues.map((i) => i.message) ?? [];

describe("topes de longitud de los formularios publicos", () => {
	it("el contacto acepta el nombre y el correo en su limite", () => {
		const email = `${"a".repeat(242)}@example.com`; // 254
		expect(email).toHaveLength(254);
		expect(
			contact.safeParse({ ...validContact, name: "n".repeat(100), email })
				.success,
		).toBe(true);
	});

	it("el contacto rechaza un nombre de mas de 100 caracteres", () => {
		const r = contact.safeParse({ ...validContact, name: "n".repeat(101) });
		expect(r.success).toBe(false);
		expect(messages(r)).toContain(es.FORM.FORM_VALID_NAME_MAX);
	});

	it("el contacto rechaza un correo de mas de 254 caracteres", () => {
		const r = contact.safeParse({
			...validContact,
			email: `${"a".repeat(243)}@example.com`,
		});
		expect(r.success).toBe(false);
		expect(messages(r)).toContain(es.FORM.FORM_VALID_EMAIL_MAX);
	});

	it("la opinion acepta nombre, puesto y pais en su limite", () => {
		expect(
			opinion.safeParse({
				...validOpinion,
				name: "n".repeat(100),
				job: "j".repeat(100),
				country: "c".repeat(100),
			}).success,
		).toBe(true);
	});

	it("la opinion rechaza un nombre, un puesto o un pais de mas de 100 caracteres", () => {
		expect(
			messages(opinion.safeParse({ ...validOpinion, name: "n".repeat(101) })),
		).toContain(es.FORM.FORM_VALID_NAME_MAX);
		expect(
			messages(opinion.safeParse({ ...validOpinion, job: "j".repeat(101) })),
		).toContain(es.OPINIONS.OPINIONS_FORM_VALID_JOB_MAX);
		expect(
			messages(
				opinion.safeParse({ ...validOpinion, country: "c".repeat(101) }),
			),
		).toContain(es.OPINIONS.OPINIONS_FORM_VALID_COUNTRY_MAX);
	});
});
