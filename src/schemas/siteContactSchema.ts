import { z } from "zod";

/**
 * Datos de contacto del sitio, tal como los entrega `GET /contact-info`. Se
 * validan aqui aunque el backend ya lo haga: acaban en un `href` publico, y un
 * valor raro (otro dominio, `javascript:`) no debe llegar a la pagina.
 */
const siteUrl = (domain: string) =>
	z
		.string()
		.max(300)
		.refine((value) => {
			try {
				const url = new URL(value);
				return (
					url.protocol === "https:" &&
					(url.hostname === domain || url.hostname.endsWith(`.${domain}`))
				);
			} catch {
				return false;
			}
		});

export const siteContactSchema = z.object({
	github_url: siteUrl("github.com"),
	linkedin_url: siteUrl("linkedin.com"),
	linkedin_name: z.string().trim().min(1).max(100),
	phone: z
		.string()
		.trim()
		.max(30)
		.regex(/^\+[\d\s().-]+$/)
		.refine((phone) => {
			const digits = phone.replace(/\D/g, "").length;
			return digits >= 8 && digits <= 15;
		}),
	email: z.string().trim().max(254).pipe(z.email()),
});

export type SiteContact = z.infer<typeof siteContactSchema>;
