CREATE TABLE `offlineSyncMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`lastSyncAt` timestamp,
	`lastSyncHash` varchar(64),
	`pendingChanges` int NOT NULL DEFAULT 0,
	`cacheSize` int NOT NULL DEFAULT 0,
	`isOnline` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offlineSyncMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`productViews` int NOT NULL DEFAULT 0,
	`productClicks` int NOT NULL DEFAULT 0,
	`addToCart` int NOT NULL DEFAULT 0,
	`purchases` int NOT NULL DEFAULT 0,
	`revenue` varchar(20) NOT NULL DEFAULT '0',
	`leads` int NOT NULL DEFAULT 0,
	`uniqueUsers` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerApiLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`method` varchar(10),
	`endpoint` varchar(500),
	`statusCode` int,
	`requestSize` int,
	`responseSize` int,
	`duration` int,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerApiLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerDataSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('products','materials','suppliers','prices','specifications') NOT NULL,
	`sourceUrl` varchar(500),
	`sourceFormat` enum('json','csv','xml','database') NOT NULL DEFAULT 'json',
	`mappingConfig` text,
	`isActive` int NOT NULL DEFAULT 1,
	`lastSyncAt` timestamp,
	`syncStatus` enum('pending','syncing','success','error') NOT NULL DEFAULT 'pending',
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerDataSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`price` varchar(20),
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`stock` int,
	`specifications` text,
	`certifications` text,
	`leadTime` int,
	`minOrder` int NOT NULL DEFAULT 1,
	`maxOrder` int,
	`imageUrl` varchar(500),
	`dataSourceId` int,
	`syncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnerProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerWebhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`events` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`secret` varchar(64) NOT NULL,
	`lastTriggeredAt` timestamp,
	`failureCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnerWebhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`website` varchar(255),
	`industry` varchar(100),
	`country` varchar(100),
	`tier` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('pending','active','suspended','inactive') NOT NULL DEFAULT 'pending',
	`apiKey` varchar(64) NOT NULL,
	`apiSecret` varchar(64) NOT NULL,
	`dataSourceType` enum('api','upload','direct_db','webhook') NOT NULL DEFAULT 'api',
	`maxRecords` int NOT NULL DEFAULT 1000,
	`syncFrequency` int NOT NULL DEFAULT 3600,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `partners_apiKey_unique` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `syncQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`partnerId` int,
	`entityType` varchar(100) NOT NULL,
	`entityId` int NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`data` text,
	`status` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`retryCount` int NOT NULL DEFAULT 0,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`syncedAt` timestamp,
	CONSTRAINT `syncQueue_id` PRIMARY KEY(`id`)
);
