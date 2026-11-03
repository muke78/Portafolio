/**
 * Enlaces que se derivan de los datos de contacto. Sin dependencias de servidor:
 * lo usan tanto las paginas como la isla del formulario de contacto.
 */

/** `https://github.com/muke78/` -> `muke78`. */
export const githubHandle = (url: string): string => {
	try {
		return new URL(url).pathname.split("/").filter(Boolean)[0] ?? "github.com";
	} catch {
		return "github.com";
	}
};

/** Enlace de WhatsApp con los digitos del telefono (el unico lugar que lo arma). */
export const whatsappUrl = (phone: string): string =>
	`https://wa.me/${phone.replace(/\D/g, "")}`;

export const mailtoUrl = (email: string): string => `mailto:${email}`;
