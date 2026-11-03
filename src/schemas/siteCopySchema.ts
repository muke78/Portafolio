import { z } from "zod";

/**
 * Textos del sitio tal como los entrega `GET /site-copy`. Se validan aqui aunque el
 * backend ya lo haga: la clave de la foto acaba en un `src` publico y los textos en
 * el HTML, y un valor raro (una URL de otro sitio, una ruta con `..`) no debe llegar.
 */
const r2Key = z
	.string()
	.min(1)
	.max(512)
	.refine(
		(key) =>
			!key.startsWith("//") &&
			!key.includes("\\") &&
			!key.includes(":") &&
			!key.split("/").some((part) => part === ".." || part === "."),
		"clave de imagen no valida",
	);

export const siteCopySchema = z.object({
	hero_image: r2Key,
	hero_image_alt: z.string().trim().min(1).max(160),
	hero_label: z.string().trim().min(1).max(100),
	hero_lead: z.string().trim().min(1).max(500),
	manifesto_text: z.string().trim().min(1).max(500),
	meta_description: z.string().trim().min(1).max(300),
});

export type SiteCopy = z.infer<typeof siteCopySchema>;
