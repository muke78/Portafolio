import { afterEach, describe, expect, it, vi } from "vitest";
import { isRateLimited } from "@/lib/rateLimit";

// The limiter's `buckets` map is module-level, shared across every call in
// this process - use a fresh key per test (a counter is enough, this file
// runs single-threaded) so tests never see each other's state.
let keyCounter = 0;
const freshKey = () => `test-key-${keyCounter++}`;

describe("isRateLimited", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not limit the first request for a new key", () => {
		expect(isRateLimited(freshKey(), { limit: 5, windowMs: 60_000 })).toBe(false);
	});

	it("allows exactly `limit` requests, then blocks the next one", () => {
		const key = freshKey();
		const opts = { limit: 5, windowMs: 60_000 };

		// First call opens the window (count=1), doesn't count against
		// itself as "over limit" yet - matches the login flow (1st attempt
		// always gets through).
		for (let i = 0; i < 5; i++) {
			expect(isRateLimited(key, opts)).toBe(false);
		}
		// 6th request in the same window: blocked.
		expect(isRateLimited(key, opts)).toBe(true);
		// Stays blocked on further attempts within the same window.
		expect(isRateLimited(key, opts)).toBe(true);
	});

	it("tracks separate keys independently", () => {
		const opts = { limit: 1, windowMs: 60_000 };
		const keyA = freshKey();
		const keyB = freshKey();

		expect(isRateLimited(keyA, opts)).toBe(false);
		expect(isRateLimited(keyA, opts)).toBe(true); // A is now over limit

		// B has never been called - must not be affected by A's state.
		expect(isRateLimited(keyB, opts)).toBe(false);
	});

	it("resets once the sliding window has elapsed", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

		const key = freshKey();
		const opts = { limit: 1, windowMs: 60_000 };

		expect(isRateLimited(key, opts)).toBe(false);
		expect(isRateLimited(key, opts)).toBe(true);

		// 61s later: window has elapsed, counter starts over.
		vi.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));
		expect(isRateLimited(key, opts)).toBe(false);
	});
});
