// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
	BANG_SECONDS,
	coreAt,
	createBigBang,
	makeShards,
	shardColour,
	shardDistance,
} from "@/lib/motion/bigbang";

const seeded = () => {
	let t = 5;
	return () => {
		t = (t * 16807) % 2147483647;
		return t / 2147483647;
	};
};

describe("the explosion", () => {
	it("throws fragments in every direction, little stars and sparks", () => {
		const shards = makeShards(200, seeded());
		expect(shards).toHaveLength(200);
		expect(shards.some((s) => s.star)).toBe(true);
		expect(shards.some((s) => !s.star)).toBe(true);
		const east = shards.filter((s) => Math.cos(s.angle) > 0).length;
		expect(east).toBeGreaterThan(60);
		expect(east).toBeLessThan(140);
		for (const s of shards) expect(s.life).toBeLessThanOrEqual(BANG_SECONDS);
	});

	it("fragments fly out fast and coast: always further, ever more slowly", () => {
		const [s] = makeShards(1, seeded());
		const d = (t: number) => shardDistance(s, t, 1000);
		expect(d(0)).toBe(0);
		expect(d(0.5)).toBeGreaterThan(0);
		expect(d(1)).toBeGreaterThan(d(0.5));
		expect(d(1) - d(0.5)).toBeGreaterThan(d(2) - d(1.5));
	});

	it("fragments cool as they age: white, then yellow, then red", () => {
		expect(shardColour(0)).toBe("white");
		expect(shardColour(0.3)).toBe("yellow");
		expect(shardColour(0.9)).toBe("red");
	});

	it("the core flares in an instant and fades while it grows", () => {
		expect(coreAt(0).alpha).toBe(0);
		expect(coreAt(0.06).alpha).toBe(1);
		expect(coreAt(1).alpha).toBeLessThan(coreAt(0.06).alpha);
		expect(coreAt(0.8).radius).toBeGreaterThan(coreAt(0.1).radius);
		expect(coreAt(3).alpha).toBe(0);
	});

	it("is a harmless no-op without a 2D canvas (jsdom): it just calls back", () => {
		const done = vi.fn();
		const blast = createBigBang({ add: vi.fn(), remove: vi.fn() } as never);
		blast.play({ x: 1, y: 1 }, done);
		expect(done).toHaveBeenCalledTimes(1);
		expect(() => blast.destroy()).not.toThrow();
	});
});
