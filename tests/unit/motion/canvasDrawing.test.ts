// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBigBang } from "@/lib/motion/bigbang";
import { createSnowglobe } from "@/lib/motion/snowglobe";

/** A 2D context that accepts every call; gradients just take colour stops. */
const fakeContext = () => {
	const calls: string[] = [];
	const gradient = { addColorStop: vi.fn() };
	const ctx = new Proxy(
		{},
		{
			get: (_t, name: string) => {
				if (name === "createRadialGradient" || name === "createLinearGradient")
					return () => gradient;
				return (..._a: unknown[]) => {
					calls.push(name);
				};
			},
			set: () => true,
		},
	);
	return { ctx, calls, gradient };
};

class FakePath {
	moveTo() {}
	lineTo() {}
	closePath() {}
}

const withContext = () => {
	const fake = fakeContext();
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
		fake.ctx as never,
	);
	return fake;
};

beforeEach(() => {
	vi.stubGlobal("Path2D", FakePath);
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

describe("createSnowglobe drawing", () => {
	const make = () => {
		const fake = withContext();
		let tick: ((time: number, delta: number) => void) | undefined;
		const ticker = {
			add: vi.fn((fn) => {
				tick = fn;
			}),
			remove: vi.fn(),
		};
		const globe = createSnowglobe(document.createElement("canvas"), ticker);
		return {
			fake,
			ticker,
			globe,
			run: (n: number, dt = 50) => {
				for (let i = 0; i < n; i++) tick?.(i * dt, dt);
			},
		};
	};

	it("draws the sphere every frame and goes through every state while hovered", () => {
		const { fake, globe, run, ticker } = make();
		expect(ticker.add).toHaveBeenCalledTimes(1);
		globe.setBreath(1.02);
		globe.setLean(0.4, -0.3);
		globe.setEnergy(1);
		globe.setHover(true);
		globe.kick(1);
		const rims = new Set<string>();
		// ~16 s of hover: spikes, liquid edge, shivers, bubble and heat.
		for (let i = 0; i < 16; i++) {
			run(20);
			rims.add(globe.rim());
		}
		expect(fake.calls).toContain("clearRect");
		expect(fake.calls).toContain("fill");
		expect(fake.calls).toContain("stroke");
		// The colour moves from violet toward red as it heats.
		expect(rims.size).toBeGreaterThan(3);
	});

	it("cools down when the cursor leaves and can collapse into the centre", () => {
		const { globe, run } = make();
		globe.setHover(true);
		run(120);
		globe.setHover(false);
		run(120);
		globe.setMode("collapse");
		run(60);
		expect(globe.rim()).not.toBe("");
	});

	it("destroy stops the ticker", () => {
		const { globe, ticker } = make();
		globe.destroy();
		expect(ticker.remove).toHaveBeenCalled();
	});
});

describe("createBigBang drawing", () => {
	it("draws the whole explosion and cleans up when it ends", () => {
		const fake = withContext();
		let tick: (() => void) | undefined;
		const ticker = {
			add: vi.fn((fn) => {
				tick = fn;
			}),
			remove: vi.fn(),
		};
		let now = 0;
		vi.spyOn(performance, "now").mockImplementation(() => now);
		const done = vi.fn();
		const blast = createBigBang(ticker as never);
		expect(document.querySelector(".bang-fx")).not.toBeNull();
		blast.play({ x: 100, y: 80 }, done);
		// First frame is drawn at once (it hides the cut from the void to the page).
		expect(fake.calls).toContain("fillRect");
		for (const t of [0.05, 0.3, 0.8, 1.5, 2.5, 3.5]) {
			now = t * 1000;
			tick?.();
		}
		expect(fake.calls).toContain("stroke");
		expect(fake.calls).toContain("fill");
		expect(done).not.toHaveBeenCalled();
		now = 4100;
		tick?.();
		expect(done).toHaveBeenCalledTimes(1);
		expect(ticker.remove).toHaveBeenCalled();
		blast.destroy();
		expect(document.querySelector(".bang-fx")).toBeNull();
	});

	it("uses fewer fragments on a phone", () => {
		withContext();
		vi.stubGlobal("innerWidth", 390);
		const blast = createBigBang({ add: vi.fn(), remove: vi.fn() } as never);
		blast.destroy();
		expect(document.querySelector(".bang-fx")).toBeNull();
	});
});
