// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A recorder in place of Three.js: the real library needs WebGL, which jsdom
// does not have. What matters here is how the component drives it.
const created = vi.hoisted(() => ({
	renderers: [] as Array<{
		domElement: HTMLCanvasElement;
		render: ReturnType<typeof vi.fn>;
		dispose: ReturnType<typeof vi.fn>;
		setSize: ReturnType<typeof vi.fn>;
	}>,
	geometries: [] as Array<{
		attributes: Record<string, { array: Float32Array; itemSize: number }>;
		dispose: ReturnType<typeof vi.fn>;
	}>,
	materials: [] as Array<{
		uniforms: Record<string, { value: unknown }>;
		dispose: ReturnType<typeof vi.fn>;
	}>,
	groups: [] as Array<{
		scale: { setScalar: ReturnType<typeof vi.fn> };
	}>,
	failRenderer: false,
}));

vi.mock("three", () => {
	class Vec {
		x = 0;
		y = 0;
		z = 0;
		set(x: number, y: number, z: number) {
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}
		clone() {
			return new Vec().set(this.x, this.y, this.z);
		}
		project() {
			return this;
		}
	}
	class Color {
		constructor(
			public r = 0,
			public g = 0,
			public b = 0,
		) {}
		copy(c: Color) {
			this.r = c.r;
			this.g = c.g;
			this.b = c.b;
			return this;
		}
	}
	class WebGLRenderer {
		domElement = document.createElement("canvas");
		render = vi.fn();
		dispose = vi.fn();
		setSize = vi.fn();
		setPixelRatio = vi.fn();
		setClearColor = vi.fn();
		getPixelRatio = () => 1;
		constructor() {
			if (created.failRenderer) throw new Error("WebGL unavailable");
			created.renderers.push(this);
		}
	}
	class BufferAttribute {
		constructor(
			public array: Float32Array,
			public itemSize: number,
		) {}
	}
	class BufferGeometry {
		attributes: Record<string, BufferAttribute> = {};
		dispose = vi.fn();
		constructor() {
			created.geometries.push(this);
		}
		setAttribute(name: string, attr: BufferAttribute) {
			this.attributes[name] = attr;
		}
	}
	class ShaderMaterial {
		uniforms: Record<string, { value: unknown }>;
		dispose = vi.fn();
		constructor(opts: { uniforms: Record<string, { value: unknown }> }) {
			this.uniforms = opts.uniforms;
			created.materials.push(this);
		}
	}
	class Group {
		position = new Vec();
		rotation = { x: 0, y: 0, z: 0 };
		scale = { setScalar: vi.fn() };
		add = vi.fn();
		updateMatrixWorld = vi.fn();
		worldToLocal = (v: Vec) => v;
		constructor() {
			created.groups.push(this);
		}
	}
	return {
		AdditiveBlending: 2,
		BufferAttribute,
		BufferGeometry,
		Color,
		Group,
		PerspectiveCamera: class {
			aspect = 1;
			position = new Vec();
			updateProjectionMatrix = vi.fn();
		},
		Points: class {
			frustumCulled = true;
		},
		Scene: class {
			add = vi.fn();
		},
		ShaderMaterial,
		LineSegments: class {
			visible = true;
			frustumCulled = true;
			renderOrder = 0;
			constructor(
				public geometry: unknown,
				public material: unknown,
			) {}
		},
		Vector2: Vec,
		Vector3: Vec,
		WebGLRenderer,
	};
});

import { Cosmos } from "@/components/cosmos/Cosmos";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { BackgroundEffects } from "@/components/three/BackgroundEffects";

/** The star and gas layers (the wormhole and the Penrose diagram have no aDust). */
const dustLayers = () =>
	created.geometries.filter((g) => "aDust" in g.attributes);

import { ParticleGalaxy } from "@/components/three/ParticleGalaxy";
import { galaxyState } from "@/lib/galaxyState";

const preference = (query: Record<string, boolean>) =>
	vi.stubGlobal("matchMedia", (q: string) => ({
		matches: query[q] ?? false,
		media: q,
		addEventListener() {},
		removeEventListener() {},
	}));

beforeEach(() => {
	created.renderers.length = 0;
	created.geometries.length = 0;
	created.materials.length = 0;
	created.groups.length = 0;
	created.failRenderer = false;
	preference({});
	// jsdom has no canvas: the palette falls back to its built-in colours.
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
	vi.stubGlobal(
		"requestAnimationFrame",
		vi.fn(() => 7),
	);
	vi.stubGlobal("cancelAnimationFrame", vi.fn());
	window.__motionReady = true;
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	galaxyState.story = 0;
	galaxyState.bang = 1;
});

describe("ParticleGalaxy", () => {
	it("renders a hidden-from-assistive-tech container the engine and CSS can target", () => {
		const { container } = render(<ParticleGalaxy />);
		const wrap = container.querySelector("[data-galaxy]");
		expect(wrap).toHaveAttribute("aria-hidden", "true");
		expect(wrap?.querySelector("canvas")).toBeInTheDocument();
	});

	it("draws 9500 particles on desktop and 4500 on a phone", () => {
		render(<ParticleGalaxy />).unmount();
		expect(dustLayers()[0].attributes.aDust.array.length).toBe(9500 * 3);
		expect(dustLayers()[0].attributes.aRand.array.length).toBe(9500 * 4);

		preference({ "(max-width: 767px)": true });
		render(<ParticleGalaxy />);
		// Each mount builds the stars, then a smaller set for the gas clouds.
		expect(dustLayers()[2].attributes.aGal.array.length).toBe(4500 * 3);
		expect(dustLayers()[1].attributes.aGal.array.length).toBe(280 * 3);
		expect(dustLayers()[3].attributes.aGal.array.length).toBe(140 * 3);
	});

	it("generates the same galaxy every time (seeded, original)", () => {
		render(<ParticleGalaxy />).unmount();
		render(<ParticleGalaxy />).unmount();
		const a = dustLayers()[0];
		const b = dustLayers()[2];
		expect(Array.from(a.attributes.aGal.array.slice(0, 30))).toEqual(
			Array.from(b.attributes.aGal.array.slice(0, 30)),
		);
		// And it is a real shape, not a degenerate point.
		const maxRadius = Math.max(
			...Array.from({ length: 200 }, (_, i) =>
				Math.hypot(
					a.attributes.aGal.array[i * 3],
					a.attributes.aGal.array[i * 3 + 2],
				),
			),
		);
		expect(maxRadius).toBeGreaterThan(1);
		expect(maxRadius).toBeLessThanOrEqual(3.5);
	});

	it("starts a render loop and feeds the scroll state to the shader", () => {
		render(<ParticleGalaxy />);
		expect(requestAnimationFrame).toHaveBeenCalled();
		const loop = (requestAnimationFrame as unknown as ReturnType<typeof vi.fn>)
			.mock.calls[0][0] as FrameRequestCallback;

		galaxyState.story = 0.6;
		galaxyState.bang = 0.5;
		loop(performance.now() + 100);

		const u = created.materials[0].uniforms;
		expect(u.uStory.value).toBe(0.6);
		expect(u.uBang.value).toBe(0.5);
		expect(created.renderers[0].render).toHaveBeenCalled();
		expect(created.groups[0].scale.setScalar).toHaveBeenCalled();
	});

	it("in the epilogue the galaxy goes to the middle of the empty stage (nothing covers it)", () => {
		render(<ParticleGalaxy />);
		const loop = (requestAnimationFrame as unknown as ReturnType<typeof vi.fn>)
			.mock.calls[0][0] as FrameRequestCallback;
		const group = created.groups[0];
		galaxyState.story = 0.3;
		loop(performance.now() + 5000);
		const before = group.position.x;
		galaxyState.story = 1;
		loop(performance.now() + 5100);
		const after = group.position.x;
		// While it forms it sits to the right of the text; in the epilogue it is centred.
		expect(before).toBeGreaterThan(0.5);
		expect(Math.abs(after)).toBeLessThan(1e-6);
	});

	it("the closing: the black hole lies flat, then tilts up toward you and grows", () => {
		render(<ParticleGalaxy />);
		const loop = (requestAnimationFrame as unknown as ReturnType<typeof vi.fn>)
			.mock.calls[0][0] as FrameRequestCallback;
		const group = created.groups[0];
		const scale = group.scale.setScalar as ReturnType<typeof vi.fn>;
		galaxyState.story = 1;
		galaxyState.hole = 0;
		loop(performance.now() + 5000);
		const start = { tilt: group.rotation.x, scale: scale.mock.lastCall?.[0] };
		galaxyState.hole = 0.22;
		loop(performance.now() + 5100);
		const lying = group.rotation.x;
		galaxyState.hole = 1;
		loop(performance.now() + 5200);
		const end = { tilt: group.rotation.x, scale: scale.mock.lastCall?.[0] };
		// rotation.x: 0 = the disc seen edge-on, PI/2 = seen straight on.
		expect(lying).toBeLessThan(start.tilt);
		expect(end.tilt).toBeGreaterThan(1.2);
		expect(end.scale).toBeGreaterThan(start.scale * 2.5);
		// The shader hears about it (lensing + new stars) on both layers.
		for (const m of created.materials.filter((m) => m.uniforms.uBH))
			expect(m.uniforms.uBH.value).toBe(1);
		galaxyState.hole = 0;
	});

	it("without the closing the black hole is not drawn at all", () => {
		render(<ParticleGalaxy />);
		const loop = (requestAnimationFrame as unknown as ReturnType<typeof vi.fn>)
			.mock.calls[0][0] as FrameRequestCallback;
		galaxyState.story = 0.4;
		loop(performance.now() + 5000);
		for (const m of created.materials.filter((m) => m.uniforms.uBH))
			expect(m.uniforms.uBH.value).toBe(0);
	});

	it("draws the gas clouds under the stars: a second, additive layer", () => {
		render(<ParticleGalaxy />);
		// stars + gas, then the inside of the Penrose diamond
		expect(created.materials).toHaveLength(3);
		expect(created.materials[0].uniforms.uGas.value).toBe(0);
		expect(created.materials[1].uniforms.uGas.value).toBe(1);
	});

	it("shows the galaxy at its healthy peak if the scroll engine never starts", () => {
		window.__motionReady = false;
		const now = vi.spyOn(performance, "now").mockReturnValue(0);
		render(<ParticleGalaxy />);
		const loop = (requestAnimationFrame as unknown as ReturnType<typeof vi.fn>)
			.mock.calls[0][0] as FrameRequestCallback;
		galaxyState.story = 0;
		loop(6000);
		expect(created.materials[0].uniforms.uStory.value).toBe(0.72);
		now.mockRestore();
	});

	it("under reduced motion draws the finished galaxy once, with no loop", () => {
		preference({ "(prefers-reduced-motion: reduce)": true });
		render(<ParticleGalaxy />);
		expect(requestAnimationFrame).not.toHaveBeenCalled();
		expect(created.renderers[0].render).toHaveBeenCalledTimes(1);
		expect(created.materials[0].uniforms.uStory.value).toBe(0.72);
	});

	it("pauses while the tab is hidden and resumes when it is back", () => {
		render(<ParticleGalaxy />);
		const hidden = vi.spyOn(document, "hidden", "get");
		hidden.mockReturnValue(true);
		document.dispatchEvent(new Event("visibilitychange"));
		expect(cancelAnimationFrame).toHaveBeenCalled();

		const calls = (requestAnimationFrame as unknown as ReturnType<typeof vi.fn>)
			.mock.calls.length;
		hidden.mockReturnValue(false);
		document.dispatchEvent(new Event("visibilitychange"));
		expect(
			(requestAnimationFrame as unknown as ReturnType<typeof vi.fn>).mock.calls
				.length,
		).toBeGreaterThan(calls);
	});

	it("re-reads the colours when the theme class changes", async () => {
		render(<ParticleGalaxy />);
		const before = created.materials[0].uniforms.uCore.value;
		document.documentElement.classList.toggle("dark");
		await act(async () => {
			await Promise.resolve();
		});
		expect(created.materials[0].uniforms.uCore.value).not.toBe(before);
		document.documentElement.classList.remove("dark");
	});

	it("releases the GPU resources and the canvas on unmount", () => {
		const { unmount, container } = render(<ParticleGalaxy />);
		unmount();
		expect(dustLayers()[0].dispose).toHaveBeenCalled();
		expect(created.materials[0].dispose).toHaveBeenCalled();
		expect(created.renderers[0].dispose).toHaveBeenCalled();
		expect(container.querySelector("canvas")).toBeNull();
	});

	it("degrades quietly when WebGL is not available", () => {
		created.failRenderer = true;
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const { container } = render(<ParticleGalaxy />);
		expect(warn).toHaveBeenCalled();
		expect(container.querySelector("[data-galaxy]")).toBeInTheDocument();
	});
});

describe("Cosmos", () => {
	it("is a decorative sky: hidden from assistive tech, with a fixed star field", () => {
		const { container } = render(<Cosmos />);
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
		expect(container.querySelectorAll(".cosmos-stars circle")).toHaveLength(50);
		expect(container.querySelectorAll(".cosmos-dust circle")).toHaveLength(22);
	});

	it("draws the same sky on every render (seeded)", () => {
		const first = render(<Cosmos />);
		const a = first.container.innerHTML;
		first.unmount();
		const b = render(<Cosmos />).container.innerHTML;
		expect(a).toBe(b);
	});

	it("moves its layers with the scroll, at different depths", () => {
		const frames: FrameRequestCallback[] = [];
		vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
			frames.push(cb);
			return frames.length;
		});
		const { container } = render(<Cosmos />);
		Object.defineProperty(window, "scrollY", {
			value: 400,
			configurable: true,
		});
		window.dispatchEvent(new Event("scroll"));
		frames[0](0);
		const layers = [...container.querySelectorAll<HTMLElement>("[data-depth]")];
		expect(layers.length).toBeGreaterThanOrEqual(3);
		const transforms = layers.map((l) => l.style.transform);
		expect(new Set(transforms).size).toBeGreaterThan(1);
		Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
	});

	it("does not follow the scroll under reduced motion", () => {
		preference({ "(prefers-reduced-motion: reduce)": true });
		const add = vi.spyOn(window, "addEventListener");
		render(<Cosmos />);
		expect(add).not.toHaveBeenCalledWith(
			"scroll",
			expect.anything(),
			expect.anything(),
		);
	});
});

describe("BackgroundEffects", () => {
	it("stacks the sky and the galaxy", () => {
		const { container } = render(<BackgroundEffects />);
		expect(container.querySelector(".cosmos")).toBeInTheDocument();
		expect(container.querySelector("[data-galaxy]")).toBeInTheDocument();
	});
});

describe("brand icons", () => {
	it("render titled SVGs that scale with the size prop", () => {
		const { container } = render(
			<>
				<GithubIcon size={36} />
				<LinkedinIcon />
			</>,
		);
		const [github, linkedin] = container.querySelectorAll("svg");
		expect(github).toHaveAttribute("width", "36");
		expect(github.querySelector("title")).toHaveTextContent("GitHub");
		expect(linkedin).toHaveAttribute("width", "24");
		expect(linkedin.querySelector("title")).toHaveTextContent("LinkedIn");
	});
});
