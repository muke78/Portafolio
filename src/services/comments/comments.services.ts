import { api } from "@/config/api";
import type { FormOpinions } from "@/interfaces/currentLang.interface";

// export const listCommentsServices = async () => {
//   const response = await api.get("/comments");
//   return response.data;
// };

export const postCommentsServices = async ({
  name,
  job,
  description,
}: FormOpinions) => {
  const response = await api.post("/comments", { name, job, description });
  return response.data;
};
