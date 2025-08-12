import { comments } from "@/db/comments";
import type { Testimonial } from "@/interfaces/currentLang.interface";
import { db } from "@/lib/db";

export const useDataComments = async () => {
  const rows = (await db.select().from(comments).all()) as Testimonial[];

  return {
    rows,
  };
};

export const useDataPostComments = async ({ name, job, description }) => {
  try {
    // Contar los comentarios actuales para alternar la dirección
    const existing = await db.select().from(comments);
    const direction = existing.length % 2 === 0 ? "left" : "bottom";
    await db.insert(comments).values({
      name,
      job,
      description,
      direction,
    });
  } catch (error) {
    console.error("Error", error);
  }
};
