import { and, eq, like, or, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  categories, materials, toolCategories, tools,
  stores, materialPrices, toolPrices,
  knowledgeBaseArticles, calculators,
  savedItems, projects,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod", "avatarUrl", "bio", "profession"] as const;
    for (const field of textFields) {
      const value = user[field as keyof InsertUser];
      if (value === undefined) continue;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(
  userId: number,
  patch: { name?: string | null; bio?: string | null; profession?: string | null; avatarUrl?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Record<string, unknown> = {};
  for (const k of ["name", "bio", "profession", "avatarUrl"] as const) {
    if (patch[k] !== undefined) updateSet[k] = patch[k];
  }
  if (Object.keys(updateSet).length === 0) return;
  await db.update(users).set(updateSet).where(eq(users.id, userId));
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

// ─── Materials ───────────────────────────────────────────────────────────────

export async function getMaterials(opts?: {
  categoryId?: number;
  search?: string;
  riskLevel?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  let query = db.select().from(materials);
  const conditions = [];

  if (opts?.categoryId) conditions.push(eq(materials.categoryId, opts.categoryId));
  if (opts?.riskLevel) conditions.push(eq(materials.riskLevel, opts.riskLevel as any));
  if (opts?.featured) conditions.push(eq(materials.featured, 1));
  if (opts?.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(or(
      like(materials.namePortuguese, term),
      like(materials.nameEnglish, term),
      like(materials.descriptionPortuguese, term),
    )!);
  }

  if (conditions.length > 0) {
    return (query as any).where(and(...conditions)).limit(limit).offset(offset);
  }
  return query.limit(limit).offset(offset);
}

export async function getMaterialById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
  return result[0];
}

export async function getMaterialBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(materials).where(eq(materials.slug, slug)).limit(1);
  return result[0];
}

export async function getMaterialPrices(materialId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ price: materialPrices, store: stores })
    .from(materialPrices)
    .innerJoin(stores, eq(materialPrices.storeId, stores.id))
    .where(eq(materialPrices.materialId, materialId))
    .orderBy(asc(materialPrices.price));
}

// ─── Tools ──────────────────────────────────────────────────────────────────

export async function getToolCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(toolCategories).orderBy(asc(toolCategories.sortOrder));
}

export async function getTools(opts?: {
  toolCategoryId?: number;
  search?: string;
  powerType?: string;
  professionLevel?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  let query = db.select().from(tools);
  const conditions = [];

  if (opts?.toolCategoryId) conditions.push(eq(tools.toolCategoryId, opts.toolCategoryId));
  if (opts?.powerType) conditions.push(eq(tools.powerType, opts.powerType as any));
  if (opts?.professionLevel) conditions.push(eq(tools.professionLevel, opts.professionLevel as any));
  if (opts?.featured) conditions.push(eq(tools.featured, 1));
  if (opts?.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(or(
      like(tools.namePortuguese, term),
      like(tools.nameEnglish, term),
      like(tools.descriptionPortuguese, term),
    )!);
  }

  if (conditions.length > 0) {
    return (query as any).where(and(...conditions)).limit(limit).offset(offset);
  }
  return query.limit(limit).offset(offset);
}

export async function getToolById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tools).where(eq(tools.id, id)).limit(1);
  return result[0];
}

export async function getToolPrices(toolId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ price: toolPrices, store: stores })
    .from(toolPrices)
    .innerJoin(stores, eq(toolPrices.storeId, stores.id))
    .where(eq(toolPrices.toolId, toolId))
    .orderBy(asc(toolPrices.price));
}

// ─── Knowledge Base ──────────────────────────────────────────────────────────

export async function getKnowledgeBaseArticles(opts?: {
  categoryId?: number;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 10;
  const offset = opts?.offset ?? 0;

  let query = db.select().from(knowledgeBaseArticles);
  const conditions = [];

  if (opts?.categoryId) conditions.push(eq(knowledgeBaseArticles.categoryId, opts.categoryId));
  if (opts?.featured) conditions.push(eq(knowledgeBaseArticles.featured, 1));
  if (opts?.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(or(
      like(knowledgeBaseArticles.titlePortuguese, term),
      like(knowledgeBaseArticles.titleEnglish, term),
    )!);
  }

  if (conditions.length > 0) {
    return (query as any).where(and(...conditions))
      .orderBy(desc(knowledgeBaseArticles.featured), desc(knowledgeBaseArticles.createdAt))
      .limit(limit).offset(offset);
  }
  return query
    .orderBy(desc(knowledgeBaseArticles.featured), desc(knowledgeBaseArticles.createdAt))
    .limit(limit).offset(offset);
}

export async function getKnowledgeBaseArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, id)).limit(1);
  return result[0];
}

// ─── Calculators ─────────────────────────────────────────────────────────────

export async function getCalculators(opts?: { categorySlug?: string; featured?: boolean; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  let query = db.select().from(calculators);
  const conditions = [];
  if (opts?.categorySlug) conditions.push(eq(calculators.categorySlug, opts.categorySlug));
  if (opts?.featured) conditions.push(eq(calculators.featured, 1));
  if (conditions.length > 0) {
    return (query as any).where(and(...conditions)).limit(limit);
  }
  return query.limit(limit);
}

// ─── Saved items (favoritos) ─────────────────────────────────────────────────

export type SavedItemType = "material" | "tool" | "article" | "calculator";

export async function listSavedItems(userId: number) {
  const db = await getDb();
  if (!db) return { material: [], tool: [], article: [], calculator: [] };

  const rows = await db.select().from(savedItems)
    .where(eq(savedItems.userId, userId))
    .orderBy(desc(savedItems.createdAt));

  const grouped: Record<SavedItemType, typeof rows> = { material: [], tool: [], article: [], calculator: [] };
  for (const r of rows) (grouped[r.itemType as SavedItemType] ??= []).push(r);

  const matIds = grouped.material.map(r => r.itemId);
  const toolIds = grouped.tool.map(r => r.itemId);
  const artIds = grouped.article.map(r => r.itemId);
  const calcIds = grouped.calculator.map(r => r.itemId);

  const [mats, ts, arts, calcs] = await Promise.all([
    matIds.length ? db.select().from(materials).where(or(...matIds.map(id => eq(materials.id, id)))!) : Promise.resolve([]),
    toolIds.length ? db.select().from(tools).where(or(...toolIds.map(id => eq(tools.id, id)))!) : Promise.resolve([]),
    artIds.length ? db.select().from(knowledgeBaseArticles).where(or(...artIds.map(id => eq(knowledgeBaseArticles.id, id)))!) : Promise.resolve([]),
    calcIds.length ? db.select().from(calculators).where(or(...calcIds.map(id => eq(calculators.id, id)))!) : Promise.resolve([]),
  ]);

  const matMap = new Map(mats.map(m => [m.id, m]));
  const toolMap = new Map(ts.map(t => [t.id, t]));
  const artMap = new Map(arts.map(a => [a.id, a]));
  const calcMap = new Map(calcs.map(c => [c.id, c]));

  return {
    material: grouped.material.map(r => ({ saved: r, item: matMap.get(r.itemId) })).filter(x => x.item),
    tool: grouped.tool.map(r => ({ saved: r, item: toolMap.get(r.itemId) })).filter(x => x.item),
    article: grouped.article.map(r => ({ saved: r, item: artMap.get(r.itemId) })).filter(x => x.item),
    calculator: grouped.calculator.map(r => ({ saved: r, item: calcMap.get(r.itemId) })).filter(x => x.item),
  };
}

export async function listSavedItemKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ itemType: savedItems.itemType, itemId: savedItems.itemId })
    .from(savedItems)
    .where(eq(savedItems.userId, userId));
}

export async function toggleSavedItem(userId: number, itemType: SavedItemType, itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(savedItems)
    .where(and(eq(savedItems.userId, userId), eq(savedItems.itemType, itemType), eq(savedItems.itemId, itemId))!)
    .limit(1);
  if (existing.length > 0) {
    await db.delete(savedItems).where(eq(savedItems.id, existing[0].id));
    return { saved: false } as const;
  }
  await db.insert(savedItems).values({ userId, itemType, itemId });
  return { saved: true } as const;
}

export async function updateSavedItemNotes(userId: number, savedItemId: number, notes: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(savedItems).set({ notes })
    .where(and(eq(savedItems.id, savedItemId), eq(savedItems.userId, userId))!);
}

// ─── Global search ───────────────────────────────────────────────────────────

export async function globalSearch(query: string, limit = 10) {
  const db = await getDb();
  if (!db) return { materials: [], tools: [], articles: [] };
  const term = `%${query.trim()}%`;

  const [mats, ts, arts] = await Promise.all([
    db.select().from(materials)
      .where(or(like(materials.namePortuguese, term), like(materials.nameEnglish, term))!)
      .limit(limit),
    db.select().from(tools)
      .where(or(like(tools.namePortuguese, term), like(tools.nameEnglish, term))!)
      .limit(limit),
    db.select().from(knowledgeBaseArticles)
      .where(or(like(knowledgeBaseArticles.titlePortuguese, term), like(knowledgeBaseArticles.titleEnglish, term))!)
      .limit(limit),
  ]);

  return { materials: mats, tools: ts, articles: arts };
}
