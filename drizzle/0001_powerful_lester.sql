CREATE TABLE `gallery_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`caption` text NOT NULL,
	`created_at` integer NOT NULL
);
