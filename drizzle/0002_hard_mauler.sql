CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`request_payload` text NOT NULL,
	`details` text NOT NULL,
	`created_at` integer NOT NULL
);
