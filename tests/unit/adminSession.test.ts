import { afterEach, describe, expect, it, vi } from "vitest";
import {
	buildSessionToken,
	getHonoJwt,
	revokeSessionToken,
	verifySessionToken,
} from "@/lib/adminSession";

const SECRET = "test-secret-do-not-use-in-prod";
const HONO_JWT = "header.payload.signature"; // shape of a real JWT, opaque here

describe("adminSession", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("builds a token shaped as exp.honoJwtB64.signature", () => {
		const token = buildSessionToken(SECRET, HONO_JWT);
		const parts = token.split(".");
		expect(parts).toHaveLength(3);
		expect(Number(parts[0])).toBeGreaterThan(Date.now());
	});

	it("verifies a token built with the same secret", () => {
		const token = buildSessionToken(SECRET, HONO_JWT);
		expect(verifySessionToken(token, SECRET)).toBe(true);
	});

	it("rejects a token verified against a different secret", () => {
		const token = buildSessionToken(SECRET, HONO_JWT);
		expect(verifySessionToken(token, "a-different-secret")).toBe(false);
	});

	it("rejects a tampered payload (expiry pushed forward)", () => {
		const token = buildSessionToken(SECRET, HONO_JWT);
		const [, honoJwtB64, sig] = token.split(".");
		const farFuture = Date.now() + 1000 * 60 * 60 * 24 * 365;
		const tampered = `${farFuture}.${honoJwtB64}.${sig}`;
		expect(verifySessionToken(tampered, SECRET)).toBe(false);
	});

	it("rejects a tampered embedded Hono JWT (signature still 'valid' shape)", () => {
		const token = buildSessionToken(SECRET, HONO_JWT);
		const [exp, , sig] = token.split(".");
		const swapped = `${exp}.${Buffer.from("attacker.controlled.jwt").toString("base64url")}.${sig}`;
		expect(verifySessionToken(swapped, SECRET)).toBe(false);
	});

	it("rejects malformed tokens", () => {
		expect(verifySessionToken("no-dot-here", SECRET)).toBe(false);
		expect(verifySessionToken("only.one-dot", SECRET)).toBe(false);
		expect(verifySessionToken("", SECRET)).toBe(false);
		expect(verifySessionToken(undefined, SECRET)).toBe(false);
	});

	it("rejects a revoked token even though the signature is still valid", () => {
		const token = buildSessionToken(SECRET, HONO_JWT);
		expect(verifySessionToken(token, SECRET)).toBe(true);

		revokeSessionToken(token);

		expect(verifySessionToken(token, SECRET)).toBe(false);
	});

	it("revoking undefined is a no-op, doesn't throw", () => {
		expect(() => revokeSessionToken(undefined)).not.toThrow();
	});

	it("rejects a token once the 2h TTL has passed", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

		const token = buildSessionToken(SECRET, HONO_JWT);
		expect(verifySessionToken(token, SECRET)).toBe(true);

		// Just under 2h: still valid.
		vi.setSystemTime(new Date("2026-01-01T01:59:00.000Z"));
		expect(verifySessionToken(token, SECRET)).toBe(true);

		// Just past 2h: expired.
		vi.setSystemTime(new Date("2026-01-01T02:00:01.000Z"));
		expect(verifySessionToken(token, SECRET)).toBe(false);
	});

	describe("getHonoJwt", () => {
		it("returns the embedded Hono JWT for a valid token", () => {
			const token = buildSessionToken(SECRET, HONO_JWT);
			expect(getHonoJwt(token, SECRET)).toBe(HONO_JWT);
		});

		it("returns null for an invalid/expired/undefined token", () => {
			expect(getHonoJwt(undefined, SECRET)).toBeNull();
			expect(getHonoJwt("garbage", SECRET)).toBeNull();
			const token = buildSessionToken(SECRET, HONO_JWT);
			expect(getHonoJwt(token, "wrong-secret")).toBeNull();
		});
	});
});
