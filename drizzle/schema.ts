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