import { describe, expect, it } from "vitest";
import { opinionsSchema } from "@/schemas/opinionsSchema";

const schema = opinionsSchema({ currentLocale: "es" });

const valid = {
	name: "Erick González",
	job: "Desarrollador Full-Stack",
	description: "Excelente trabajo en cada uno de los proyectos entregados.",
	country: "Mexico",
	country_flag: "MX",
};

describe("opinionsSchema", () => {
	it("accepts a fully valid payload", () => {
		expect(schema.safeParse(valid).success).toBe(true);
	});

	it("accepts a payload without the optional job field", () => {
		const { job, ...withoutOptional } = valid;
		expect(schema.safeParse(withoutOptional).success).toBe(true);
	});

	it("rejects a name shorter than 5 characters", () => {
		const result = schema.safeParse({ ...valid, name: "Al" });
		expect(result.success).toBe(false);
	});

	it("rejects a description shorter than 14 characters", () => {
		const result = schema.safeParse({ ...valid, description: "Muy corto" });
		expect(result.success).toBe(false);
	});

	it("rejects a description longer than 500 characters", () => {
		const result = schema.safeParse({
			...valid,
			description: "a".repeat(501),
		});
		expect(result.success).toBe(false);
	});

	it("rejects an empty country", () => {
		const result = schema.safeParse({ ...valid, country: "" });
		expect(result.success).toBe(false);
	});

	it("rejects a country_flag that isn't exactly 2 characters", () => {
		expect(schema.safeParse({ ...valid, country_flag: "M" }).success).toBe(false);
		expect(schema.safeParse({ ...valid, country_flag: "MEX" }).success).toBe(false);
	});
});
