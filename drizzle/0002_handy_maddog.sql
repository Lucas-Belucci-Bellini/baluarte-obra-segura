CREATE TABLE `calculationResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`calculatorId` int NOT NULL,
	`inputs` text,
	`outputs` text,
	`projectId` int,
	`name` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calculationResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calculators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`namePortuguese` varchar(255) NOT NULL,
	`nameEnglish` varchar(255) NOT NULL,
	`descriptionPortuguese` text,
	`descriptionEnglish` text,
	`specialtyId` int NOT NULL,
	`formula` text,
	`inputs` text,
	`outputs` text,
	`standards` varchar(255),
	`category` varchar(64),
	`tier` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calculators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`specialtyId` int,
	`status` enum('active','completed','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `safetyStandards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`namePortuguese` varchar(255) NOT NULL,
	`nameEnglish` varchar(255) NOT NULL,
	`code` varchar(64) NOT NULL,
	`descriptionPortuguese` text,
	`descriptionEnglish` text,
	`specialtyId` int,
	`type` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `safetyStandards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`descriptionPortuguese` text,
	`descriptionEnglish` text,
	`icon` varchar(64),
	`color` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `specialties_name_unique` UNIQUE(`name`)
);
