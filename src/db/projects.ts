import { relations } from "drizzle-orm";
import { int, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const CATEGORIES = [
  "frontend",
  "backend",
  "companies",
  "dataAnalyst",
] as const;
export const LOCALES = ["en", "es", "fr"] as const;

export const projects = sqliteTable("projects", {
  project_id: int("id").primaryKey().notNull(),
  slug: text("slug").notNull(),
  category: text("category", { enum: CATEGORIES }).notNull(),
  card_image: text("card_image").notNull(),
  images_topics: text("images_topics").notNull(), // Podrías usar JSON.stringify para array
  link_repo: text("link_repo"),
  link_web: text("link_web"),
  title_default: text("title_default").notNull(),
  description_default: text("description_default").notNull(),
  fork: int("fork", { mode: "boolean" }).notNull(), // true/false directamente
});

export const projectTranslations = sqliteTable("project_translations", {
  project_translate_id: int("id").primaryKey().notNull(),
  project_id: int("project_id")
    .notNull()
    .references(() => projects.project_id, { onDelete: "cascade" }),
  locale: text("locale", { enum: LOCALES }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const projectRelations = relations(projects, ({ many }) => ({
  projectTranslations: many(projectTranslations),
}));

export const projectTranslationsRelations = relations(
  projectTranslations,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTranslations.project_id],
      references: [projects.project_id],
    }),
  }),
);
