import { api } from "@/config/api";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const listProjectsServices = async ({ currentLocale }: PropsLang) => {
  const response = await api.get(`/projects?currentLocale=${currentLocale}`);
  return response.data;
};
