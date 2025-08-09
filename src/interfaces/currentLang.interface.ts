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

export interface Repo {
  id: string;
  title: string;
  description?: string;
  topics?: string[];
  link: string;
  img: string;
  label: string;
  type: string;
  fork?: boolean;
}

export interface Testimonial extends FormOpinions {
  id: number;
  direction: "left" | "bottom";
}

export interface DataTestimonials extends PropsLang {
  data: Testimonial[];
}

export type RepoEmpres = Omit<Repo, "label" | "type">;
