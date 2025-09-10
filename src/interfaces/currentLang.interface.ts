import type { z } from "zod";
import type { contactSchema } from "@/schemas/contactSchema";
import type { opinionsSchema } from "@/schemas/opinionsSchema";

export const CATEGORIES = [
	"frontend",
	"backend",
	"companies",
	"dataAnalyst",
] as const;

export const LOCALES = ["en", "es", "fr"] as const;

export interface PropsLang {
	currentLocale: string;
}

export type FormData = z.infer<ReturnType<typeof contactSchema>>;
export type FormOpinions = z.infer<ReturnType<typeof opinionsSchema>>;

export interface NavbarItem {
	to: string;
	label: string;
}

export interface ItemsNavProps extends PropsLang {
	onItemClick?: () => void;
}

export interface Projects {
	project_id: number;
	slug: string;
	category: (typeof CATEGORIES)[number];
	card_image: string;
	images_topics: string[];
	link_repo: string;
	link_web: string;
	title: string;
	description: string;
	fork: boolean;
}

export interface Experiences {
	experience_id: number;
	work: string;
	title: string;
	description: string;
	img: string;
	alt: string;
	time: string;
	location: string;
}

export interface ProjectsTranslations {
	translate_project_id: number;
	project_id: number;
	locale: (typeof LOCALES)[number];
	title: string;
	description: string;
}

export interface Testimonial extends FormOpinions {
	comment_id: number;
	direction: "left" | "bottom";
	country_flag: string;
	country: string;
	created_at: string;
}

export interface UseDataProjects extends PropsLang {
	activeTab: string;
}

export interface PropsLangWithData extends PropsLang {
	data: Projects[] | null;
}

export interface CountryFlagProps {
	countryCode?: string;
	size?: string;
}
