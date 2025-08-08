import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const comments = sqliteTable("comments", {
  id: int().primaryKey(),
  name: text().notNull(),
  course: text(),
  text: text().notNull(),
  direction: text().notNull(),
});
