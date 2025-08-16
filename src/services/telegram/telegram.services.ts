import { api } from "@/config/api";
import type { FormData } from "@/interfaces/currentLang.interface";

export const postCommentsChatBotServices = async ({
  name,
  email,
  phone,
  moreInformation,
}: FormData) => {
  const response = await api.post("/tlgrm", {
    name,
    email,
    phone,
    moreInformation,
  });
  return response.data;
};
