import { LOCALES } from "@/i18n/locales";
import { CATEGORIES } from "@/types/currentLang.interface";

// Resources the generic ResourceEditor island knows how to CRUD. Comments
// and contact-messages are deliberately NOT here - they're moderation
// queues (status changes only, never create/delete from the admin), each
// gets its own dedicated component (CommentsModeration/MessagesInbox).
export type Resource =
	| "projects"
	| "experiences"
	| "education"
	| "skills"
	| "about";

export type FieldType =
	| "text"
	| "textarea"
	| "url"
	| "select"
	| "checkbox"
	| "tags";

export interface FieldConfig {
	key: string;
	label: string;
	type: FieldType;
	required?: boolean;
	options?: { value: string; label: string }[];
	/** For "tags": comma-separated list shown to the admin. */
	help?: string;
}

/** Per-locale field shown under each locale tab (translations[]). */
export interface TranslationFieldConfig {
	key: string;
	label: string;
	type: "text" | "textarea";
	required?: boolean;
}

export interface ResourceConfig {
	label: string;
	/** true = one row only (about): no list, no create/delete, PUT with no id. */
	singleton?: boolean;
	/** Primary key field name as returned by GET, e.g. "project_id". */
	idKey: string;
	/** Field shown as each list row's title (from the flat, locale-resolved GET shape). */
	titleKey: string;
	fields: FieldConfig[];
	translationFields: TranslationFieldConfig[];
}

// Every resource here also has a "<key>_default" column per translation
// field on the Backend_Portafolio side (schemas/*.ts) - the admin never
// edits those directly (see buildSubmitPayload in ResourceEditor.tsx):
// they're auto-filled from the "es" locale tab on submit, since their
// only real purpose is "what GET falls back to when a translation row is
// missing for the requested locale" (fallbackLanguage is "es" - see
// Backend_Portafolio docs/05-hono-language-and-best-practices.md).
export const RESOURCE_CONFIG: Record<Resource, ResourceConfig> = {
	projects: {
		label: "Proyectos",
		idKey: "project_id",
		titleKey: "title",
		fields: [
			{ key: "slug", label: "Slug", type: "text", required: true },
			{
				key: "category",
				label: "Categoría",
				type: "select",
				required: true,
				options: CATEGORIES.map((c) => ({ value: c, label: c })),
			},
			{
				key: "card_image",
				label: "Imagen de la tarjeta (URL)",
				type: "url",
				required: true,
			},
			{
				key: "images_topics",
				label: "Iconos de tecnologías",
				type: "tags",
				help: "Separados por comas, ej: react, astro, ts",
			},
			{ key: "link_repo", label: "Repositorio (URL)", type: "url" },
			{ key: "link_web", label: "Demo (URL)", type: "url" },
			{ key: "fork", label: "Es colaboración", type: "checkbox" },
		],
		translationFields: [
			{ key: "title", label: "Título", type: "text", required: true },
			{
				key: "description",
				label: "Descripción",
				type: "textarea",
				required: true,
			},
		],
	},
	experiences: {
		label: "Experiencia",
		idKey: "experience_id",
		titleKey: "title",
		fields: [
			{ key: "img", label: "Logo (URL)", type: "url", required: true },
			{
				key: "alt",
				label: "Texto alternativo de la imagen",
				type: "text",
				required: true,
			},
		],
		translationFields: [
			{ key: "work", label: "Empresa", type: "text" },
			{ key: "title", label: "Puesto", type: "text", required: true },
			{
				key: "subtitle",
				label: "Descripción",
				type: "textarea",
				required: true,
			},
			{ key: "time", label: "Periodo", type: "text", required: true },
			{ key: "location", label: "Ubicación", type: "text", required: true },
		],
	},
	education: {
		label: "Educación",
		idKey: "education_id",
		titleKey: "institution",
		fields: [
			{ key: "image", label: "Imagen (URL)", type: "url", required: true },
		],
		translationFields: [
			{ key: "institution", label: "Institución", type: "text" },
			{
				key: "subtitle",
				label: "Carrera / grado",
				type: "text",
				required: true,
			},
			{
				key: "description",
				label: "Descripción",
				type: "textarea",
				required: true,
			},
			{ key: "period", label: "Periodo", type: "text", required: true },
		],
	},
	skills: {
		label: "Habilidades",
		idKey: "skill_id",
		titleKey: "title",
		fields: [
			{
				key: "images_topics",
				label: "Iconos de tecnologías",
				type: "tags",
				help: "Separados por comas, ej: react, astro, ts (go-skill-icons)",
			},
		],
		translationFields: [
			{
				key: "title",
				label: "Título de la categoría",
				type: "text",
				required: true,
			},
		],
	},
	about: {
		label: "Acerca de mí",
		singleton: true,
		idKey: "about_id",
		titleKey: "title_card",
		fields: [
			{ key: "image", label: "Imagen (URL)", type: "url", required: true },
		],
		translationFields: [
			{ key: "title_card", label: "Título", type: "text", required: true },
			{ key: "subtitle", label: "Subtítulo", type: "text", required: true },
			{
				key: "description",
				label: "Descripción",
				type: "textarea",
				required: true,
			},
		],
	},
};

export type TranslationDraft = Record<string, Record<string, unknown>>; // locale -> field -> value

const emptyTranslationDraft = (resource: Resource): TranslationDraft => {
	const draft: TranslationDraft = {};
	for (const locale of LOCALES) {
		draft[locale] = {};
		for (const field of RESOURCE_CONFIG[resource].translationFields) {
			draft[locale][field.key] = "";
		}
	}
	return draft;
};

const emptyMainDraft = (resource: Resource): Record<string, unknown> => {
	const draft: Record<string, unknown> = {};
	for (const field of RESOURCE_CONFIG[resource].fields) {
		draft[field.key] =
			field.type === "checkbox" ? false : field.type === "tags" ? [] : "";
	}
	return draft;
};

export const emptyDraft = (
	resource: Resource,
): { main: Record<string, unknown>; translations: TranslationDraft } => ({
	main: emptyMainDraft(resource),
	translations: emptyTranslationDraft(resource),
});

/** Builds an editor draft from an item as returned by GET (already
 * locale-resolved, flat - it does NOT carry the other locales' text). The
 * translation tabs start blank except the currently-viewed locale, which
 * is pre-filled from the flat item - editing another tab and saving is
 * still safe, untouched locales just keep whatever Turso already has
 * (the admin only overwrites a translation row when they's typed
 * something in that tab). */
export const draftFromItem = (
	resource: Resource,
	viewedLocale: string,
	// biome-ignore lint/suspicious/noExplicitAny: item shape comes from an external, admin-proxied backend
	item: Record<string, any>,
): { main: Record<string, unknown>; translations: TranslationDraft } => {
	const draft = emptyDraft(resource);
	for (const field of RESOURCE_CONFIG[resource].fields) {
		if (field.key in item) draft.main[field.key] = item[field.key];
	}
	if (LOCALES.includes(viewedLocale as (typeof LOCALES)[number])) {
		for (const field of RESOURCE_CONFIG[resource].translationFields) {
			if (field.key in item) {
				draft.translations[viewedLocale][field.key] = item[field.key] ?? "";
			}
		}
	}
	return draft;
};

/** A translation tab counts as "filled in" (worth sending) once every
 * required field in it is non-empty - matches what the Zod schemas on
 * Backend_Portafolio actually require per translation entry. */
const isTranslationFilled = (
	resource: Resource,
	values: Record<string, unknown>,
): boolean =>
	RESOURCE_CONFIG[resource].translationFields
		.filter((f) => f.required)
		.every((f) => {
			const v = values[f.key];
			return v !== undefined && v !== null && v !== "";
		});

/** Converts the editor's {main, translations} draft into the exact body
 * shape Backend_Portafolio's *AdminInputSchema expects: flat main fields
 * + "<field>_default" derived from the "es" tab + translations[] (one
 * entry per locale that has its required fields filled in). */
export const buildSubmitPayload = (
	resource: Resource,
	draft: { main: Record<string, unknown>; translations: TranslationDraft },
): Record<string, unknown> => {
	const config = RESOURCE_CONFIG[resource];
	const payload: Record<string, unknown> = { ...draft.main };

	const esValues = draft.translations.es ?? {};
	for (const field of config.translationFields) {
		payload[`${field.key}_default`] = esValues[field.key] || "";
	}

	payload.translations = LOCALES.filter((locale) =>
		isTranslationFilled(resource, draft.translations[locale] ?? {}),
	).map((locale) => ({ locale, ...draft.translations[locale] }));

	return payload;
};
