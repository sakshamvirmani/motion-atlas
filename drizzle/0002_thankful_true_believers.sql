CREATE TABLE `mutation_rate_limits` (
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`window_started_at` integer NOT NULL,
	`request_count` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `action`)
);
