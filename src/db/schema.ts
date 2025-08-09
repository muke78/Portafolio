import { int, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const comments = sqliteTable("comments", {
  id: int().primaryKey(),
  name: text().notNull(),
  job: text(),
  description: text().notNull(),
  direction: text().notNull(),
});

export const projects = sqliteTable("projects", {
  id: int().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  images_topics: text().notNull(),
  link_repo: text().notNull(),
  link_web: text().notNull(),
  card_image: text().notNull(),
  fork: numeric().notNull(),
});
