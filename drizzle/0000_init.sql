CREATE TABLE `enquiries` (
	`id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`name` varchar(120) NOT NULL,
	`business` varchar(160) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`email` varchar(200) NOT NULL,
	`location` varchar(160) NOT NULL,
	`facility_type` varchar(40) NOT NULL,
	`message` text,
	`ip_hash` varchar(64) NOT NULL,
	`user_agent` varchar(300),
	`email_status` varchar(16) NOT NULL DEFAULT 'pending',
	`email_error` text,
	`sms_status` varchar(16) NOT NULL DEFAULT 'pending',
	`sms_error` text,
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `enquiries_ip_created_idx` ON `enquiries` (`ip_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `enquiries_created_idx` ON `enquiries` (`created_at`);