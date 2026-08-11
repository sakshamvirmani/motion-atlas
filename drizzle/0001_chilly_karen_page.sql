CREATE TABLE `lesson_learning_state` (
	`user_id` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`bookmarked` integer DEFAULT false NOT NULL,
	`mastery_stage` integer DEFAULT 0 NOT NULL,
	`review_due_at` integer,
	`lab_state` text DEFAULT '{}' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_learning_user_review` ON `lesson_learning_state` (`user_id`,`review_due_at`);