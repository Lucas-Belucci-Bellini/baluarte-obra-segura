import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, tinyint } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  bio: text("bio"),
  profession: varchar("profession", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  namePortuguese: varchar("namePortuguese", { length: 100 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 100 }).notNull(),
  descriptionPortuguese: text("descriptionPortuguese"),
  descriptionEnglish: text("descriptionEnglish"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 20 }).default("#F97316").notNull(),
  itemCount: int("itemCount").default(0).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
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
  antiScamPortuguese: text("antiScamPortuguese"),
  antiScamEnglish: text("antiScamEnglish"),
  technicalSpecsPortuguese: text("technicalSpecsPortuguese"),
  technicalSpecsEnglish: text("technicalSpecsEnglish"),
  standards: varchar("standards", { length: 500 }),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }),
  priceUnit: varchar("priceUnit", { length: 50 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  featured: tinyint("featured").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  storeCount: int("storeCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

export const toolCategories = mysqlTable("toolCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  namePortuguese: varchar("namePortuguese", { length: 100 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ToolCategory = typeof toolCategories.$inferSelect;
export type InsertToolCategory = typeof toolCategories.$inferInsert;

export const tools = mysqlTable("tools", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  toolCategoryId: int("toolCategoryId").notNull(),
  namePortuguese: varchar("namePortuguese", { length: 255 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
  descriptionPortuguese: text("descriptionPortuguese"),
  descriptionEnglish: text("descriptionEnglish"),
  usageTipsPortuguese: text("usageTipsPortuguese"),
  usageTipsEnglish: text("usageTipsEnglish"),
  safetyPortuguese: text("safetyPortuguese"),
  safetyEnglish: text("safetyEnglish"),
  technicalSpecsPortuguese: text("technicalSpecsPortuguese"),
  technicalSpecsEnglish: text("technicalSpecsEnglish"),
  powerType: mysqlEnum("powerType", ["corded", "battery", "manual", "pneumatic", "hydraulic"]).default("manual").notNull(),
  professionLevel: mysqlEnum("professionLevel", ["beginner", "intermediate", "professional"]).default("beginner").notNull(),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  featured: tinyint("featured").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  namePortuguese: varchar("namePortuguese", { length: 255 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  country: varchar("country", { length: 3 }).default("BR").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0.0"),
  reviewCount: int("reviewCount").default(0).notNull(),
  deliveryDays: int("deliveryDays").default(7).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

export const materialPrices = mysqlTable("materialPrices", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  storeId: int("storeId").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: varchar("priceUnit", { length: 50 }),
  inStock: tinyint("inStock").default(1).notNull(),
  url: varchar("url", { length: 500 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MaterialPrice = typeof materialPrices.$inferSelect;
export type InsertMaterialPrice = typeof materialPrices.$inferInsert;

export const toolPrices = mysqlTable("toolPrices", {
  id: int("id").autoincrement().primaryKey(),
  toolId: int("toolId").notNull(),
  storeId: int("storeId").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  inStock: tinyint("inStock").default(1).notNull(),
  url: varchar("url", { length: 500 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ToolPrice = typeof toolPrices.$inferSelect;
export type InsertToolPrice = typeof toolPrices.$inferInsert;

export const knowledgeBaseArticles = mysqlTable("knowledgeBaseArticles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titlePortuguese: varchar("titlePortuguese", { length: 255 }).notNull(),
  titleEnglish: varchar("titleEnglish", { length: 255 }).notNull(),
  contentPortuguese: text("contentPortuguese").notNull(),
  contentEnglish: text("contentEnglish").notNull(),
  summaryPortuguese: text("summaryPortuguese"),
  summaryEnglish: text("summaryEnglish"),
  categoryId: int("categoryId"),
  readingTimeMinutes: int("readingTimeMinutes").default(5).notNull(),
  featured: tinyint("featured").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;
export type InsertKnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferInsert;

export const savedItems = mysqlTable("savedItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["material", "tool", "article", "calculator"]).notNull(),
  itemId: int("itemId").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedItem = typeof savedItems.$inferSelect;
export type InsertSavedItem = typeof savedItems.$inferInsert;

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectType: mysqlEnum("projectType", ["residential", "commercial", "industrial", "rural", "renovation", "other"]).default("residential").notNull(),
  status: mysqlEnum("status", ["planning", "active", "completed", "archived"]).default("planning").notNull(),
  budgetEstimate: decimal("budgetEstimate", { precision: 12, scale: 2 }),
  areaSqm: decimal("areaSqm", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const projectItems = mysqlTable("projectItems", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  itemType: mysqlEnum("itemType", ["material", "tool"]).notNull(),
  itemId: int("itemId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectItem = typeof projectItems.$inferSelect;
export type InsertProjectItem = typeof projectItems.$inferInsert;

export const calculators = mysqlTable("calculators", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  namePortuguese: varchar("namePortuguese", { length: 255 }).notNull(),
  nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
  descriptionPortuguese: text("descriptionPortuguese"),
  descriptionEnglish: text("descriptionEnglish"),
  categorySlug: varchar("categorySlug", { length: 100 }),
  formula: text("formula"),
  inputs: text("inputs"),
  outputs: text("outputs"),
  standards: varchar("standards", { length: 255 }),
  featured: tinyint("featured").default(0).notNull(),
  useCount: int("useCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Calculator = typeof calculators.$inferSelect;
export type InsertCalculator = typeof calculators.$inferInsert;

// ─── Safety alerts ───────────────────────────────────────────────────────────

export const safetyAlerts = mysqlTable("safetyAlerts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  severity: mysqlEnum("severity", ["critical", "warning", "info"]).default("info").notNull(),
  titlePortuguese: varchar("titlePortuguese", { length: 255 }).notNull(),
  titleEnglish: varchar("titleEnglish", { length: 255 }).notNull(),
  contentPortuguese: text("contentPortuguese").notNull(),
  contentEnglish: text("contentEnglish").notNull(),
  categoryId: int("categoryId"),
  materialId: int("materialId"),
  source: varchar("source", { length: 255 }),
  sourceUrl: varchar("sourceUrl", { length: 500 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SafetyAlert = typeof safetyAlerts.$inferSelect;
export type InsertSafetyAlert = typeof safetyAlerts.$inferInsert;

export const alertReads = mysqlTable("alertReads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  alertId: int("alertId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type AlertRead = typeof alertReads.$inferSelect;
export type InsertAlertRead = typeof alertReads.$inferInsert;

// ─── Chat ────────────────────────────────────────────────────────────────────

export const chatConversations = mysqlTable("chatConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).default("Nova conversa").notNull(),
  language: varchar("language", { length: 10 }).default("PT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  tokensUsed: int("tokensUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── B2B Partners ─────────────────────────────────────────────────────────────

export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  companyName: varchar("companyName", { length: 255 }),
  cnpj: varchar("cnpj", { length: 18 }),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  apiKey: varchar("apiKey", { length: 80 }).notNull().unique(),
  apiSecret: varchar("apiSecret", { length: 80 }).notNull(),
  tier: mysqlEnum("tier", ["free", "pro", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["pending", "active", "suspended", "inactive"]).default("pending").notNull(),
  dailyQuota: int("dailyQuota").default(100).notNull(),
  dailyUsage: int("dailyUsage").default(0).notNull(),
  lastQuotaReset: timestamp("lastQuotaReset").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

export const partnerProducts = mysqlTable("partnerProducts", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  materialId: int("materialId"),
  toolId: int("toolId"),
  sku: varchar("sku", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  stockQty: int("stockQty"),
  storeUrl: varchar("storeUrl", { length: 500 }),
  lastSync: timestamp("lastSync").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerProduct = typeof partnerProducts.$inferSelect;
export type InsertPartnerProduct = typeof partnerProducts.$inferInsert;

export const partnerSyncLogs = mysqlTable("partnerSyncLogs", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  itemsSubmitted: int("itemsSubmitted").default(0).notNull(),
  itemsUpdated: int("itemsUpdated").default(0).notNull(),
  itemsFailed: int("itemsFailed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerSyncLog = typeof partnerSyncLogs.$inferSelect;
export type InsertPartnerSyncLog = typeof partnerSyncLogs.$inferInsert;
