CREATE TABLE `learner_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`current_lesson` integer DEFAULT 1 NOT NULL,
	`schema_version` integer DEFAULT 1 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`status` text DEFAULT 'completed' NOT NULL,
	`completed_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_progress_user_updated` ON `lesson_progress` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `quiz_progress` (
	`user_id` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`selected_answer` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_quiz_progress_user_updated` ON `quiz_progress` (`user_id`,`updated_at`);