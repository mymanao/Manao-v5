CREATE TABLE `custom_reply_counters` (
	`reply_id` text NOT NULL,
	`user_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`reply_id`, `user_id`)
);
