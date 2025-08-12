import { comments } from "@/db/comments";
import type { Testimonial } from "@/interfaces/currentLang.interface";
import { db } from "@/lib/db";

export const useDataComments = async () => {
  const rows = (await db.select().from(comments).all()) as Testimonial[];

  return {
    rows,
  };
};
