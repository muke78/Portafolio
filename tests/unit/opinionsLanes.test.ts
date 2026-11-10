import { describe, expect, it } from "vitest";
import {
	CARD_SPAN,
	laneSeconds,
	MIN_HALF_SPAN,
	MIN_LANE_SECONDS,
	newestFirst,
	repeatToFill,
	SECONDS_PER_CARD,
	splitIntoLanes,
} from "@/features/opinions/lanes";
import type { Testimonial } from "@/types/currentLang.interface";

const c = (comment_id: number, created_at: string): Testimonial => ({
	comment_id,
	name: `n${comment_id}`,
	job: "j",
	description: "d",
	country: "México",
	country_flag: "MX",
	created_at,
	direction: "left",
});

const ids = (list: Testimonial[]) => list.map((t) => t.comment_id);

describe("newestFirst", () => {
	it("orders by publication date, newest first, without touching the input", () => {
		const input = [c(1, "2025-08-16"), c(2, "2026-11-06"), c(3, "2025-08-22")];
		expect(ids(newestFirst(input))).toEqual([2, 3, 1]);
		expect(ids(input)).toEqual([1, 2, 3]);
	});

	it("breaks a tie with the id so the order never flickers", () => {
		const same = "2025-08-17T10:00:00.000Z";
		expect(ids(newestFirst([c(5, same), c(9, same), c(7, same)]))).toEqual([
			9, 7, 5,
		]);
	});

	it("sends a date it cannot read to the end", () => {
		expect(ids(newestFirst([c(1, "garbage"), c(2, "2025-01-01")]))).toEqual([
			2, 1,
		]);
	});
});

describe("splitIntoLanes", () => {
	it("alternates one on top, one below, in order of publication", () => {
		const data = [1, 2, 3, 4, 5].map((n) => c(n, `2025-08-0${n}`));
		const { top, bottom } = splitIntoLanes(data);
		// newest to oldest: 5, 4, 3, 2, 1
		expect(ids(top)).toEqual([5, 3, 1]);
		expect(ids(bottom)).toEqual([4, 2]);
	});

	it("leaves the lower lane empty when there is one comment", () => {
		const { top, bottom } = splitIntoLanes([c(1, "2025-08-01")]);
		expect(top).toHaveLength(1);
		expect(bottom).toHaveLength(0);
	});

	it("copes with no comments", () => {
		expect(splitIntoLanes([])).toEqual({ top: [], bottom: [] });
	});
});

describe("repeatToFill", () => {
	it("returns nothing for an empty lane", () => {
		expect(repeatToFill([])).toEqual([]);
	});

	it("repeats the cards until one half is wider than any screen", () => {
		const half = repeatToFill([1, 2, 3]);
		expect(half.length * CARD_SPAN).toBeGreaterThanOrEqual(MIN_HALF_SPAN);
		expect(half.slice(0, 3)).toEqual([1, 2, 3]);
	});

	it("keeps a lane that is already wide enough as it is", () => {
		const wide = Array.from({ length: 12 }, (_, i) => i);
		expect(repeatToFill(wide)).toEqual(wide);
	});
});

describe("laneSeconds", () => {
	it("keeps one speed on every lane: the same seconds per card", () => {
		expect(laneSeconds(20)).toBe(20 * SECONDS_PER_CARD);
	});

	it("never goes faster than the floor", () => {
		expect(laneSeconds(1)).toBe(MIN_LANE_SECONDS);
	});
});
