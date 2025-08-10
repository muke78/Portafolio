import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const comments = sqliteTable("comments", {
  comment_id: int().primaryKey(),
  name: text().notNull(),
  job: text(),
  description: text().notNull(),
  direction: text().notNull(),
});
