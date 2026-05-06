CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`namePortuguese` varchar(100) NOT NULL,
	`nameEnglish` varchar(100) NOT NULL,
	`icon` varchar(100),
	`itemCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeBaseArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titlePortuguese` varchar(255) NOT NULL,
	`titleEnglish` varchar(255) NOT NULL,
	`contentPortuguese` text NOT NULL,
	`contentEnglish` text NOT NULL,
	`categoryId` int,
	`featured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledgeBaseArticles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materialStores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialId` int NOT NULL,
	`storeId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `materialStores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`namePortuguese` varchar(255) NOT NULL,
	`nameEnglish` varchar(255) NOT NULL,
	`descriptionPortuguese` text,
	`descriptionEnglish` text,
	`riskLevel` enum('RISCO_ALTO','ATENCAO','NORMAL') NOT NULL DEFAULT 'NORMAL',
	`safetyWarningsPortuguese` text,
	`safetyWarningsEnglish` text,
	`usageTipsPortuguese` text,
	`usageTipsEnglish` text,
	`storeCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`namePortuguese` varchar(255) NOT NULL,
	`nameEnglish` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
