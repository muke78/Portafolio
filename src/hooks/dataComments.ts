import { comments } from "@/db/schema";
import { db } from "@/lib/db";

export const test = async () => {
  try {
    const result = await db.select().from(comments).all();
    return result;
  } catch (error) {
    throw Error("Ocurrio un error", error);
  }
};
