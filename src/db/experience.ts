import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const LOCALES = ["en", "es", "fr"] as const;

export const experience = sqliteTable("experience", {
  experience_id: int("id").primaryKey().notNull(),
  work_default: text("work_default"),
  title_default: text("title_default").notNull(),
  subtitle_default: text("subtitle_default").notNull(),
  img: text("img").notNull(),
  alt: text("alt").notNull(),
  time_default: text("time_default").notNull(),
  location_default: text("location_default").notNull(),
});

export const experienceTranslations = sqliteTable("experience_translations", {
  experience_translate_id: int("id").primaryKey().notNull(),
  experience_id: int("experience_id")
    .notNull()
    .references(() => experience.experience_id, { onDelete: "cascade" }),
  locale: text("locale", { enum: LOCALES }).notNull(),
  work: text("work_default"),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
});

export const projectRelations = relations(experience, ({ many }) => ({
  experienceTranslations: many(experienceTranslations),
}));

export const projectTranslationsRelations = relations(
  experienceTranslations,
  ({ one }) => ({
    project: one(experience, {
      fields: [experienceTranslations.experience_id],
      references: [experience.experience_id],
    }),
  }),
);
