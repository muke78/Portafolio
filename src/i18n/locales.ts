/**
 * Single source of truth for the site's supported locales.
 * Everything that used to hardcode its own `["es", "en", "fr"]` list
 * (astro.config.mjs, src/i18n/index.ts, src/i18n/ui.ts,
 * src/types/currentLang.interface.ts) now derives from this file.
 */
export const LOCALES = ["es", "en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const isLocale = (value: string): value is Locale =>
	(LOCALES as readonly string[]).includes(value);

export const LOCALE_META: Record<
	Locale,
	{ label: string; countryCode: string; bcp47: string }
> = {
	es: { label: "Español", countryCode: "ES", bcp47: "es-ES" },
	en: { label: "English", countryCode: "US", bcp47: "en-US" },
	fr: { label: "Français", countryCode: "FR", bcp47: "fr-FR" },
};
