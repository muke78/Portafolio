import { describe, expect, it } from "vitest";
import { contactSchema } from "@/schemas/contactSchema";

const schema = contactSchema({ currentLocale: "es" });

const valid = {
	name: "Erick González",
	email: "erick@example.com",
	phone: "+52 55 1234 5678",
	moreInformation: "Quisiera platicar sobre un proyecto de Astro.",
};

describe("contactSchema", () => {
	it("accepts a fully valid payload", () => {
		expect(schema.safeParse(valid).success).toBe(true);
	});

	it("accepts a payload without the optional moreInformation field", () => {
		const { moreInformation, ...withoutOptional } = valid;
		expect(schema.safeParse(withoutOptional).success).toBe(true);
	});

	it("accepts an empty string for moreInformation, not just a missing key", () => {
		// Real bug this test would have caught: react-hook-form's
		// defaultValue for this field is "" (empty string), not undefined -
		// plain .optional() only forgives undefined, so a bare .min(7)
		// rejected "" and silently blocked every contact form submit that
		// left the optional field untouched. Caught live in the browser,
		// not by the pre-fix version of this test (which only tried the
		// key fully absent, via destructuring).
		expect(schema.safeParse({ ...valid, moreInformation: "" }).success).toBe(true);
	});

	it("rejects a name shorter than 5 characters", () => {
		const result = schema.safeParse({ ...valid, name: "Al" });
		expect(result.success).toBe(false);
	});

	it("rejects an invalid email", () => {
		const result = schema.safeParse({ ...valid, email: "not-an-email" });
		expect(result.success).toBe(false);
	});

	it("rejects a phone shorter than 7 characters", () => {
		const result = schema.safeParse({ ...valid, phone: "123" });
		expect(result.success).toBe(false);
	});

	it("rejects a phone longer than 20 characters", () => {
		const result = schema.safeParse({
			...valid,
			phone: "1".repeat(21),
		});
		expect(result.success).toBe(false);
	});

	it("rejects a phone with letters (regex must be digits/+/-/()/spaces only)", () => {
		const result = schema.safeParse({ ...valid, phone: "call me maybe" });
		expect(result.success).toBe(false);
	});

	it("rejects moreInformation shorter than 7 characters when present", () => {
		const result = schema.safeParse({ ...valid, moreInformation: "hola" });
		expect(result.success).toBe(false);
	});

	it("rejects moreInformation longer than 260 characters", () => {
		const result = schema.safeParse({
			...valid,
			moreInformation: "a".repeat(261),
		});
		expect(result.success).toBe(false);
	});

	it("carries a translated error message, not a raw Zod default", () => {
		const result = schema.safeParse({ ...valid, name: "Al" });
		if (result.success) throw new Error("expected failure");
		// If astro/zod (doc 06) or a future zod bump ever regresses the
		// message-argument shape, this is the test that should catch it.
		expect(result.error.issues[0]?.message).not.toMatch(/String must contain/i);
	});
});
