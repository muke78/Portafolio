import type { CATEGORIES, LOCALES } from "@/db/projects";

export interface PropsLang {
  currentLocale: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  moreInformation: string;
}

export interface FormOpinions {
  name: string;
  job: string;
  description: string;
}

export interface NavbarItem {
  to: string;
  label: string;
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
}

export interface DataTestimonials extends PropsLang {
  data: Testimonial[];
}

export interface UseDataProjects extends PropsLang {
  activeTab: string;
}

export interface PropsLangWithData extends PropsLang {
  data: Projects[] | null;
  loading: boolean;
}
