ALTER TABLE `comments` RENAME COLUMN "id" TO "comment_id";--> statement-breakpoint
CREATE TABLE `experience` (
	`id` integer PRIMARY KEY NOT NULL,
	`work_default` text,
	`title_default` text NOT NULL,
	`subtitle_default` text NOT NULL,
	`img` text NOT NULL,
	`alt` text NOT NULL,
	`time_default` text NOT NULL,
	`location_default` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experience_translations` (
	`id` integer PRIMARY KEY NOT NULL,
	`experience_id` integer NOT NULL,
	`locale` text NOT NULL,
	`work_default` text,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`time` text NOT NULL,
	`location` text NOT NULL,
	FOREIGN KEY (`experience_id`) REFERENCES `experience`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project_translations` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` integer NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `projects` ALTER COLUMN "fork" TO "fork" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `category` text NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `title_default` text NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `description_default` text NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `title`;--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `description`;