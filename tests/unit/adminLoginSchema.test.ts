import { describe, expect, it } from "vitest";
import { adminLoginSchema } from "@/schemas/adminLoginSchema";

const valid = {
	email: "admin@khelde.dev",
	password: "correct-horse-battery-staple",
};

describe("adminLoginSchema", () => {
	it("accepts a valid email + non-empty password", () => {
		expect(adminLoginSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects a malformed email", () => {
		const result = adminLoginSchema.safeParse({
			...valid,
			email: "not-an-email",
		});
		expect(result.success).toBe(false);
	});

	it("rejects a missing email", () => {
		const { email, ...withoutEmail } = valid;
		expect(adminLoginSchema.safeParse(withoutEmail).success).toBe(false);
	});

	it("rejects an empty password", () => {
		const result = adminLoginSchema.safeParse({ ...valid, password: "" });
		expect(result.success).toBe(false);
	});

	it("rejects a missing password", () => {
		const { password, ...withoutPassword } = valid;
		expect(adminLoginSchema.safeParse(withoutPassword).success).toBe(false);
	});
});
