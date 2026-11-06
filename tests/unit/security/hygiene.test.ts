import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Higiene del repositorio publico: lo que nunca debe llegar a GitHub ni al
 * navegador. Complementa a gitleaks (CI) con reglas propias de este proyecto.
 */
const ROOT = process.cwd();
const SKIP = new Set([
	"node_modules",
	".git",
	"dist",
	".astro",
	".wrangler",
	"coverage",
	"playwright-report",
	"test-results",
]);

const walk = (dir: string, out: string[] = []): string[] => {
	for (const name of readdirSync(dir)) {
		if (SKIP.has(name)) continue;
		const path = join(dir, name);
		if (statSync(path).isDirectory()) walk(path, out);
		else out.push(path);
	}
	return out;
};

const rel = (f: string) => f.slice(ROOT.length + 1).replaceAll("\\", "/");
const read = (f: string) => readFileSync(f, "utf8");
const all = walk(ROOT);
const source = all.filter((f) => /^src\/.*\.(ts|tsx|astro)$/.test(rel(f)));
const textFiles = all.filter(
	(f) =>
		/\.(ts|tsx|astro|mjs|js|json|jsonc|md|yml|yaml|toml)$/.test(f) &&
		!rel(f).startsWith("tests/") &&
		!/pnpm-lock\.yaml$/.test(f),
);

describe("secretos", () => {
	const patterns: [string, RegExp][] = [
		["clave privada", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
		[
			"token de GitHub/AWS",
			/\b(?:ghp_|gho_|github_pat_|AKIA)[A-Za-z0-9_]{16,}/,
		],
		[
			"JWT embebido",
			/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
		],
		["URL con credenciales", /\bhttps?:\/\/[^\s/:@]+:[^\s/@]+@/],
	];
	for (const [name, pattern] of patterns) {
		it(`ningun archivo versionado contiene ${name}`, () => {
			const hits = textFiles.filter((f) => pattern.test(read(f))).map(rel);
			expect(hits).toEqual([]);
		});
	}

	it(".gitignore cubre .env, .dev.vars y .vercel", () => {
		const ignore = read(join(ROOT, ".gitignore"));
		for (const entry of [".env", ".dev.vars", ".vercel"]) {
			expect(ignore).toContain(entry);
		}
	});

	it("wrangler.jsonc no declara secretos en `vars`", () => {
		const config = read(join(ROOT, "wrangler.jsonc"));
		expect(config).not.toMatch(/API_SECRET_TOKEN|SECRET|PASSWORD/);
	});
});

describe("el token del backend es solo de servidor", () => {
	it("API_SECRET_TOKEN solo se usa en codigo de servidor", () => {
		const users = source
			.filter((f) => read(f).includes("API_SECRET_TOKEN"))
			.map(rel)
			.sort();
		// Un solo punto: el cliente del backend agrega el bearer; ninguna ruta ni
		// pagina maneja el token.
		expect(users).toEqual(["src/lib/api.ts"]);
	});

	it("ningun componente, isla ni hook importa el cliente del backend", () => {
		const hits = source
			.filter((f) => /^src\/(components|features|hooks)\//.test(rel(f)))
			.filter((f) => /from ["']@\/lib\/api["']/.test(read(f)))
			.map(rel);
		expect(hits).toEqual([]);
	});

	it("en las paginas .astro el token vive solo en el frontmatter (servidor)", () => {
		for (const f of source.filter((x) => x.endsWith(".astro"))) {
			const text = read(f);
			if (!text.includes("API_SECRET_TOKEN")) continue;
			const end = text.indexOf("---", text.indexOf("---") + 3);
			expect(text.indexOf("API_SECRET_TOKEN"), rel(f)).toBeLessThan(end);
			expect(text.slice(end), rel(f)).not.toContain("API_SECRET_TOKEN");
		}
	});

	it("los errores del backend no se imprimen enteros (solo su mensaje)", () => {
		const hits = source
			.filter(
				(f) =>
					/^src\/(pages|lib)\//.test(rel(f)) && read(f).includes("@/lib/api"),
			)
			.filter((f) => /console\.\w+\([^)]*,\s*(err|error|e)\s*\)/.test(read(f)))
			.map(rel);
		expect(hits).toEqual([]);
	});

	it("astro.config lo declara como secreto de servidor", () => {
		const config = read(join(ROOT, "astro.config.mjs"));
		expect(config).toMatch(
			/API_SECRET_TOKEN:\s*envField\.string\(\{\s*context:\s*"server",\s*access:\s*"secret"/,
		);
	});

	it("las unicas variables publicas son URLs y la clave publica de Turnstile", () => {
		const config = read(join(ROOT, "astro.config.mjs"));
		const clientVars = [
			...config.matchAll(/(\w+):\s*envField\.\w+\(\{\s*context:\s*"client"/g),
		].map((m) => m[1]);
		expect(clientVars.sort()).toEqual([
			"PUBLIC_MEDIA_URL",
			"PUBLIC_TURNSTILE_SITE_KEY",
			"VITE_API_URL",
		]);
	});

	it("ningun componente usa import.meta.env con secretos", () => {
		const hits = source
			.filter((f) =>
				/import\.meta\.env\.[A-Z_]*(SECRET|TOKEN|PASSWORD|KEY)/.test(read(f)),
			)
			.map(rel);
		expect(hits).toEqual([]);
	});
});

describe("superficie de XSS", () => {
	it("no hay innerHTML, outerHTML, insertAdjacentHTML, document.write ni eval", () => {
		const hits = source
			.filter((f) =>
				/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|\beval\(|new Function\(/.test(
					read(f),
				),
			)
			.map(rel);
		expect(hits).toEqual([]);
	});

	it("dangerouslySetInnerHTML no se usa", () => {
		expect(
			source.filter((f) => read(f).includes("dangerouslySetInnerHTML")),
		).toEqual([]);
	});

	it("set:html solo inyecta el JSON-LD propio (con JSON.stringify) y los scripts fijos del CSP", () => {
		const uses = source.flatMap((f) =>
			[...read(f).matchAll(/set:html=\{([^}]*)\}/g)].map(
				(m) => `${rel(f)} -> ${m[1]}`,
			),
		);
		// Los scripts son constantes de src/lib/inlineScripts.ts (texto del repo, no
		// datos de nadie) y su hash esta en el CSP (astro.config.mjs).
		expect(uses).toEqual([
			'src/layouts/Layout.astro -> JSON.stringify(personSchema).replaceAll("<", "\\\\u003c")',
			"src/layouts/Layout.astro -> MOTION_GATE_SCRIPT",
			"src/layouts/Layout.astro -> THEME_SCRIPT",
			"src/layouts/Layout.astro -> INTRO_GATE_SCRIPT",
		]);
	});

	it("todo enlace que abre pestana nueva lleva rel con noopener", () => {
		const bad: string[] = [];
		for (const f of source) {
			const text = read(f);
			for (const m of text.matchAll(/<a\b[^>]*>/gs)) {
				const tag = m[0];
				if (
					/target=["']_blank["']/.test(tag) &&
					!/rel=["'][^"']*noopener/.test(tag)
				) {
					bad.push(rel(f));
				}
			}
		}
		expect([...new Set(bad)]).toEqual([]);
	});
});

describe("rastreadores y servicios externos", () => {
	it("no se cargan scripts de terceros desde el HTML", () => {
		const hits = source
			.filter((f) => /<script[^>]+src=["']https?:\/\//.test(read(f)))
			.map(rel);
		expect(hits).toEqual([]);
	});

	it("robots.txt deja fuera /api", () => {
		expect(read(join(ROOT, "src/pages/robots.txt.ts"))).toContain(
			"Disallow: /api",
		);
	});
});

describe("workflows de GitHub", () => {
	const workflows = all.filter((f) =>
		/^\.github\/workflows\/.*\.ya?ml$/.test(rel(f)),
	);

	it("todos declaran permisos minimos", () => {
		for (const f of workflows) {
			expect(read(f), rel(f)).toMatch(/^permissions:/m);
		}
	});

	it("ninguno usa pull_request_target (ejecuta codigo de forks con secretos)", () => {
		for (const f of workflows)
			expect(read(f), rel(f)).not.toContain("pull_request_target");
	});

	it("ninguno interpola datos del PR dentro de un `run:` (inyeccion de comandos)", () => {
		const risky =
			/run:[^\n]*\$\{\{\s*github\.(event\.(pull_request|issue|comment|head_commit)\.(title|body|head\.ref)|head_ref)/;
		for (const f of workflows) expect(read(f), rel(f)).not.toMatch(risky);
	});
});
