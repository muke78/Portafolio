/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/** Bindings del Worker (wrangler.jsonc); solo existen en el runtime de Cloudflare. */
declare module "cloudflare:workers" {
	export const env: Record<string, unknown>;
}
