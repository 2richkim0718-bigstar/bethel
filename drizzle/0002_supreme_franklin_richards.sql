ALTER TABLE `users` ADD `age` int;--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `profileCompleted` int DEFAULT 0 NOT NULL;