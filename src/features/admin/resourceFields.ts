import { CATEGORIES } from "@/types/currentLang.interface";

export type Resource = "projects" | "experiences" | "comments";

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
	/** For "tags": join/split character shown to the admin. */
	help?: string;
}

export const RESOURCES: { key: Resource; label: string }[] = [
	{ key: "projects", label: "Proyectos" },
	{ key: "experiences", label: "Experiencias" },
	{ key: "comments", label: "Comentarios" },
];

// Field shapes mirror the Projects/Experiences/Testimonial interfaces in
// src/types/currentLang.interface.ts, which are already proven correct
// against the real backend (they're what the public read-side renders).
// Server-generated fields (ids, created_at, direction) are deliberately
// left out - they're never admin-editable.
export const RESOURCE_FIELDS: Record<Resource, FieldConfig[]> = {
	projects: [
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
			help: "Separados por comas",
		},
		{ key: "link_repo", label: "Repositorio (URL)", type: "url" },
		{ key: "link_web", label: "Demo (URL)", type: "url" },
		{ key: "title", label: "Título", type: "text", required: true },
		{
			key: "description",
			label: "Descripción",
			type: "textarea",
			required: true,
		},
		{ key: "fork", label: "Es colaboración", type: "checkbox" },
	],
	experiences: [
		{ key: "work", label: "Empresa / trabajo", type: "text", required: true },
		{ key: "title", label: "Puesto", type: "text", required: true },
		{
			key: "description",
			label: "Descripción",
			type: "textarea",
			required: true,
		},
		{ key: "img", label: "Logo (URL)", type: "url" },
		{ key: "alt", label: "Texto alternativo de la imagen", type: "text" },
		{
			key: "time",
			label: "Periodo",
			type: "text",
			help: "Ej. 2022 - Presente",
		},
		{ key: "location", label: "Ubicación", type: "text" },
	],
	comments: [
		{ key: "name", label: "Nombre", type: "text", required: true },
		{ key: "job", label: "Puesto", type: "text" },
		{
			key: "description",
			label: "Comentario",
			type: "textarea",
			required: true,
		},
		{ key: "country", label: "País", type: "text" },
		{
			key: "country_flag",
			label: "Código de país",
			type: "text",
			help: "ISO 3166-1 alpha-2, ej. MX",
		},
	],
};

const emptyDraftFor = (resource: Resource): Record<string, unknown> => {
	const draft: Record<string, unknown> = {};
	for (const field of RESOURCE_FIELDS[resource]) {
		draft[field.key] =
			field.type === "checkbox" ? false : field.type === "tags" ? [] : "";
	}
	return draft;
};

/** Build a draft object from an existing item, keeping only known fields. */
// biome-ignore lint/suspicious/noExplicitAny: item shape comes from an external, admin-proxied backend
export const draftFromItem = (
	resource: Resource,
	item: Record<string, any>,
): Record<string, unknown> => {
	const draft = emptyDraftFor(resource);
	for (const field of RESOURCE_FIELDS[resource]) {
		if (!(field.key in item)) continue;
		draft[field.key] = item[field.key];
	}
	return draft;
};

export const emptyDraft = emptyDraftFor;
