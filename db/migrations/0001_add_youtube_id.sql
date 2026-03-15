ALTER TABLE `linked_accounts` ADD `youtube_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `linked_accounts_youtube_id_unique` ON `linked_accounts` (`youtube_id`);