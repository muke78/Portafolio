import { api } from "@/config/api";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const listExperiencesServices = async ({ currentLocale }: PropsLang) => {
  const response = await api.get(`/experiences?currentLocale=${currentLocale}`);
  return response.data;
};
