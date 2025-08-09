ALTER TABLE `comments` RENAME COLUMN "course" TO "job";--> statement-breakpoint
ALTER TABLE `comments` RENAME COLUMN "text" TO "description";--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`images_topics` text NOT NULL,
	`link_repo` text NOT NULL,
	`link_web` text NOT NULL,
	`card_image` text NOT NULL,
	`fork` numeric NOT NULL
);
