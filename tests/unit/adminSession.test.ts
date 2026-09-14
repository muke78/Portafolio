import { afterEach, describe, expect, it, vi } from "vitest";
import {
	buildSessionToken,
	revokeSessionToken,
	verifySessionToken,
} from "@/lib/adminSession";

const SECRET = "test-secret-do-not-use-in-prod";

describe("adminSession", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("builds a token shaped as payload.signature", () => {
		const token = buildSessionToken(SECRET);
		const parts = token.split(".");
		expect(parts).toHaveLength(2);
		expect(Number(parts[0])).toBeGreaterThan(Date.now());
	});

	it("verifies a token built with the same secret", () => {
		const token = buildSessionToken(SECRET);
		expect(verifySessionToken(token, SECRET)).toBe(true);
	});

	it("rejects a token verified against a different secret", () => {
		const token = buildSessionToken(SECRET);
		expect(verifySessionToken(token, "a-different-secret")).toBe(false);
	});

	it("rejects a tampered payload (expiry pushed forward)", () => {
		const token = buildSessionToken(SECRET);
		const [, sig] = token.split(".");
		const farFuture = Date.now() + 1000 * 60 * 60 * 24 * 365;
		const tampered = `${farFuture}.${sig}`;
		expect(verifySessionToken(tampered, SECRET)).toBe(false);
	});

	it("rejects malformed tokens", () => {
		expect(verifySessionToken("no-dot-here", SECRET)).toBe(false);
		expect(verifySessionToken("", SECRET)).toBe(false);
		expect(verifySessionToken(undefined, SECRET)).toBe(false);
	});

	it("rejects a revoked token even though the signature is still valid", () => {
		const token = buildSessionToken(SECRET);
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

		const token = buildSessionToken(SECRET);
		expect(verifySessionToken(token, SECRET)).toBe(true);

		// Just under 2h: still valid.
		vi.setSystemTime(new Date("2026-01-01T01:59:00.000Z"));
		expect(verifySessionToken(token, SECRET)).toBe(true);

		// Just past 2h: expired.
		vi.setSystemTime(new Date("2026-01-01T02:00:01.000Z"));
		expect(verifySessionToken(token, SECRET)).toBe(false);
	});
});
