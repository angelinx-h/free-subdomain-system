CREATE TABLE `dns_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subdomain_id` integer NOT NULL,
	`record_type` text NOT NULL,
	`record_value` text NOT NULL,
	`priority` integer,
	`ttl` integer DEFAULT 3600 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`subdomain_id`) REFERENCES `subdomains`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `domains` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`domain_name` text NOT NULL,
	`route53_zone_id` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `domains_domain_name_unique` ON `domains` (`domain_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `domains_route53_zone_id_unique` ON `domains` (`route53_zone_id`);--> statement-breakpoint
CREATE TABLE `subdomains` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`domain_id` integer NOT NULL,
	`subdomain_name` text NOT NULL,
	`full_domain` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);