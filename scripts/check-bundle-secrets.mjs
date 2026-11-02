/**
 * Falla si el valor de un secreto de servidor aparece en lo que se publica al
 * navegador. Se corre DESPUES de `pnpm build` y mira `dist/client`: lo que ahi
 * hay lo descarga cualquiera.
 *
 * Uso:  API_SECRET_TOKEN=<valor> node scripts/check-bundle-secrets.mjs [carpeta]
 * En el CI el valor es un relleno (`ci-placeholder`): si el build lo incrustara
 * en el cliente, se vería igual que con el real.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SECRET_VARS = ["API_SECRET_TOKEN"];
const MIN_LENGTH = 6;
const TEXT = /\.(js|mjs|css|html|json|map|txt|xml|svg|webmanifest)$/;

export const walk = (dir, out = []) => {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) walk(path, out);
		else out.push(path);
	}
	return out;
};

/** Devuelve [{ file, variable }] por cada archivo que contiene el valor de un secreto. */
export const findLeaks = (dir, env = process.env) => {
	const secrets = SECRET_VARS.map((name) => [name, env[name]]).filter(
		([, value]) => typeof value === "string" && value.length >= MIN_LENGTH,
	);
	if (secrets.length === 0) return [];
	const leaks = [];
	for (const file of walk(dir).filter((f) => TEXT.test(f))) {
		const text = readFileSync(file, "utf8");
		for (const [variable, value] of secrets) {
			if (text.includes(value)) leaks.push({ file, variable });
		}
	}
	return leaks;
};

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
	const dir = process.argv[2] ?? "dist/client";
	const configured = SECRET_VARS.filter(
		(n) => (process.env[n] ?? "").length >= MIN_LENGTH,
	);
	if (configured.length === 0) {
		console.error(
			`Define ${SECRET_VARS.join(", ")} (>= ${MIN_LENGTH} caracteres) para poder buscarlo en el bundle.`,
		);
		process.exit(2);
	}
	const leaks = findLeaks(dir);
	if (leaks.length > 0) {
		for (const { file, variable } of leaks) {
			console.error(`FUGA: el valor de ${variable} aparece en ${file}`);
		}
		process.exit(1);
	}
	console.log(`Sin fugas: ningun secreto aparece en ${dir}.`);
}
