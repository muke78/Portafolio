CREATE TABLE `comments` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`course` text,
	`text` text NOT NULL,
	`direction` text NOT NULL
);
