import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories for materials (Elétrica, Estrutural, Hidráulica, Fundações, Ferramentas, Acabamentos)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  namePortuguese: varchar("namePortuguese", { length: 100 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  itemCount: int("itemCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Risk levels: RISCO_ALTO (red), ATENCAO (yellow), NORMAL (green)
 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  namePortuguese: varchar("namePortuguese", { length: 255 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
  descriptionPortuguese: text("descriptionPortuguese"),
  descriptionEnglish: text("descriptionEnglish"),
  riskLevel: mysqlEnum("riskLevel", ["RISCO_ALTO", "ATENCAO", "NORMAL"]).default("NORMAL").notNull(),
  safetyWarningsPortuguese: text("safetyWarningsPortuguese"),
  safetyWarningsEnglish: text("safetyWarningsEnglish"),
  usageTipsPortuguese: text("usageTipsPortuguese"),
  usageTipsEnglish: text("usageTipsEnglish"),
  storeCount: int("storeCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/**
 * Stores carrying materials
 */
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  namePortuguese: varchar("namePortuguese", { length: 255 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Material-Store relationship (many-to-many)
 */
export const materialStores = mysqlTable("materialStores", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  storeId: int("storeId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MaterialStore = typeof materialStores.$inferSelect;
export type InsertMaterialStore = typeof materialStores.$inferInsert;

/**
 * Knowledge base articles (WikiBuild)
 */
export const knowledgeBaseArticles = mysqlTable("knowledgeBaseArticles", {
  id: int("id").autoincrement().primaryKey(),
  titlePortuguese: varchar("titlePortuguese", { length: 255 }).notNull(),
  titleEnglish: varchar("titleEnglish", { length: 255 }).notNull(),
  contentPortuguese: text("contentPortuguese").notNull(),
  contentEnglish: text("contentEnglish").notNull(),
  categoryId: int("categoryId"),
  featured: int("featured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;
export type InsertKnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferInsert;

/**
 * Engineering Specialties (Civil, Electrical, Hydraulic, Mechanical)
 */
export const specialties = mysqlTable("specialties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  descriptionPortuguese: text("descriptionPortuguese"),
  descriptionEnglish: text("descriptionEnglish"),
  icon: varchar("icon", { length: 64 }),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

/**
 * Calculators for engineering functions
 */
export const calculators = mysqlTable("calculators", {
  id: int("id").autoincrement().primaryKey(),
  namePortuguese: varchar("namePortuguese", { length: 255 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
  descriptionPortuguese: text("descriptionPortuguese"),
  descriptionEnglish: text("descriptionEnglish"),
  specialtyId: int("specialtyId").notNull(),
  formula: text("formula"),
  inputs: text("inputs"),
  outputs: text("outputs"),
  standards: varchar("standards", { length: 255 }),
  category: varchar("category", { length: 64 }),
  tier: mysqlEnum("tier", ["free", "pro", "enterprise"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Calculator = typeof calculators.$inferSelect;
export type InsertCalculator = typeof calculators.$inferInsert;

/**
 * Calculation Results History
 */
export const calculationResults = mysqlTable("calculationResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  calculatorId: int("calculatorId").notNull(),
  inputs: text("inputs"),
  outputs: text("outputs"),
  projectId: int("projectId"),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalculationResult = typeof calculationResults.$inferSelect;
export type InsertCalculationResult = typeof calculationResults.$inferInsert;

/**
 * Safety Standards and Compliance
 */
export const safetyStandards = mysqlTable("safetyStandards", {
  id: int("id").autoincrement().primaryKey(),
  namePortuguese: varchar("namePortuguese", { length: 255 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  descriptionPortuguese: text("descriptionPortuguese"),
  descriptionEnglish: text("descriptionEnglish"),
  specialtyId: int("specialtyId"),
  type: varchar("type", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SafetyStandard = typeof safetyStandards.$inferSelect;
export type InsertSafetyStandard = typeof safetyStandards.$inferInsert;

/**
 * Engineering Projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  specialtyId: int("specialtyId"),
  status: mysqlEnum("status", ["active", "completed", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;


/**
 * B2B PARTNERSHIP SYSTEM TABLES
 */

/**
 * Partner Companies
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  country: varchar("country", { length: 100 }),
  tier: mysqlEnum("tier", ["free", "pro", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["pending", "active", "suspended", "inactive"]).default("pending").notNull(),
  apiKey: varchar("apiKey", { length: 64 }).notNull().unique(),
  apiSecret: varchar("apiSecret", { length: 64 }).notNull(),
  dataSourceType: mysqlEnum("dataSourceType", ["api", "upload", "direct_db", "webhook"]).default("api").notNull(),
  maxRecords: int("maxRecords").default(1000).notNull(),
  syncFrequency: int("syncFrequency").default(3600).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Partner Data Sources
 */
export const partnerDataSources = mysqlTable("partnerDataSources", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["products", "materials", "suppliers", "prices", "specifications"]).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 500 }),
  sourceFormat: mysqlEnum("sourceFormat", ["json", "csv", "xml", "database"]).default("json").notNull(),
  mappingConfig: text("mappingConfig"), // JSON
  isActive: int("isActive").default(1).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  syncStatus: mysqlEnum("syncStatus", ["pending", "syncing", "success", "error"]).default("pending").notNull(),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerDataSource = typeof partnerDataSources.$inferSelect;
export type InsertPartnerDataSource = typeof partnerDataSources.$inferInsert;

/**
 * Partner Products/Materials
 */
export const partnerProducts = mysqlTable("partnerProducts", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  externalId: varchar("externalId", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  price: varchar("price", { length: 20 }), // Decimal as string to preserve precision
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  stock: int("stock"),
  specifications: text("specifications"), // JSON
  certifications: text("certifications"), // JSON
  leadTime: int("leadTime"), // days
  minOrder: int("minOrder").default(1).notNull(),
  maxOrder: int("maxOrder"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  dataSourceId: int("dataSourceId"),
  syncedAt: timestamp("syncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerProduct = typeof partnerProducts.$inferSelect;
export type InsertPartnerProduct = typeof partnerProducts.$inferInsert;

/**
 * Partner API Logs
 */
export const partnerApiLogs = mysqlTable("partnerApiLogs", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  method: varchar("method", { length: 10 }),
  endpoint: varchar("endpoint", { length: 500 }),
  statusCode: int("statusCode"),
  requestSize: int("requestSize"),
  responseSize: int("responseSize"),
  duration: int("duration"), // milliseconds
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerApiLog = typeof partnerApiLogs.$inferSelect;
export type InsertPartnerApiLog = typeof partnerApiLogs.$inferInsert;

/**
 * Sync Queue (for offline/online sync)
 */
export const syncQueue = mysqlTable("syncQueue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  partnerId: int("partnerId"),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  data: text("data"), // JSON
  status: mysqlEnum("status", ["pending", "synced", "failed"]).default("pending").notNull(),
  retryCount: int("retryCount").default(0).notNull(),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  syncedAt: timestamp("syncedAt"),
});

export type SyncQueueItem = typeof syncQueue.$inferSelect;
export type InsertSyncQueueItem = typeof syncQueue.$inferInsert;

/**
 * Partner Analytics
 */
export const partnerAnalytics = mysqlTable("partnerAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  productViews: int("productViews").default(0).notNull(),
  productClicks: int("productClicks").default(0).notNull(),
  addToCart: int("addToCart").default(0).notNull(),
  purchases: int("purchases").default(0).notNull(),
  revenue: varchar("revenue", { length: 20 }).default("0").notNull(), // Decimal as string
  leads: int("leads").default(0).notNull(),
  uniqueUsers: int("uniqueUsers").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerAnalytic = typeof partnerAnalytics.$inferSelect;
export type InsertPartnerAnalytic = typeof partnerAnalytics.$inferInsert;

/**
 * Partner Webhooks
 */
export const partnerWebhooks = mysqlTable("partnerWebhooks", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  events: text("events").notNull(), // JSON array of event types
  isActive: int("isActive").default(1).notNull(),
  secret: varchar("secret", { length: 64 }).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  failureCount: int("failureCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerWebhook = typeof partnerWebhooks.$inferSelect;
export type InsertPartnerWebhook = typeof partnerWebhooks.$inferInsert;

/**
 * Offline Sync Metadata
 */
export const offlineSyncMetadata = mysqlTable("offlineSyncMetadata", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceId: varchar("deviceId", { length: 255 }).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  lastSyncHash: varchar("lastSyncHash", { length: 64 }),
  pendingChanges: int("pendingChanges").default(0).notNull(),
  cacheSize: int("cacheSize").default(0).notNull(),
  isOnline: int("isOnline").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OfflineSyncMetadata = typeof offlineSyncMetadata.$inferSelect;
export type InsertOfflineSyncMetadata = typeof offlineSyncMetadata.$inferInsert;
