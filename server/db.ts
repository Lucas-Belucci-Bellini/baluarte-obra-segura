import { and, eq, like, or, desc, asc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { gt, sql, isNull } from "drizzle-orm";
import {
  InsertUser, users,
  categories, materials, toolCategories, tools,
  stores, materialPrices, toolPrices,
  knowledgeBaseArticles, calculators,
  savedItems, projects, projectItems,
  safetyAlerts, alertReads,
  chatConversations, chatMessages,
  partners, partnerProducts, partnerSyncLogs,
} from "../drizzle/schema";
import { randomBytes } from "crypto";
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

export async function updateUserTier(
  userId: number,
  tier: "free" | "pro" | "enterprise",
  tierExpiresAt?: Date | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ tier, tierExpiresAt: tierExpiresAt ?? null }).where(eq(users.id, userId));
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

// ─── Projects ────────────────────────────────────────────────────────────────

export type ProjectType = "residential" | "commercial" | "industrial" | "rural" | "renovation" | "other";
export type ProjectStatus = "planning" | "active" | "completed" | "archived";
export type ProjectItemType = "material" | "tool";

export async function listProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const projs = await db.select().from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));

  if (projs.length === 0) return [];

  const items = await db.select().from(projectItems)
    .where(or(...projs.map(p => eq(projectItems.projectId, p.id)))!);

  const grouped = new Map<number, { count: number; subtotal: number }>();
  for (const it of items) {
    const cur = grouped.get(it.projectId) ?? { count: 0, subtotal: 0 };
    cur.count += 1;
    const qty = Number(it.quantity ?? 1);
    const price = Number(it.unitPrice ?? 0);
    cur.subtotal += qty * price;
    grouped.set(it.projectId, cur);
  }

  return projs.map(p => ({
    ...p,
    itemCount: grouped.get(p.id)?.count ?? 0,
    computedSubtotal: grouped.get(p.id)?.subtotal ?? 0,
  }));
}

export async function getProjectById(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId))!)
    .limit(1);
  if (result.length === 0) return undefined;

  const items = await db.select().from(projectItems)
    .where(eq(projectItems.projectId, projectId))
    .orderBy(asc(projectItems.itemType), asc(projectItems.id));

  const matIds = items.filter(i => i.itemType === "material").map(i => i.itemId);
  const toolIds = items.filter(i => i.itemType === "tool").map(i => i.itemId);

  const [mats, ts] = await Promise.all([
    matIds.length ? db.select().from(materials).where(or(...matIds.map(id => eq(materials.id, id)))!) : Promise.resolve([]),
    toolIds.length ? db.select().from(tools).where(or(...toolIds.map(id => eq(tools.id, id)))!) : Promise.resolve([]),
  ]);

  const matMap = new Map(mats.map(m => [m.id, m]));
  const toolMap = new Map(ts.map(t => [t.id, t]));

  const enriched = items.map(it => ({
    ...it,
    material: it.itemType === "material" ? matMap.get(it.itemId) ?? null : null,
    tool: it.itemType === "tool" ? toolMap.get(it.itemId) ?? null : null,
  }));

  return { ...result[0], items: enriched };
}

export async function createProject(
  userId: number,
  data: { name: string; description?: string | null; projectType?: ProjectType; areaSqm?: string | null; budgetEstimate?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values({
    userId,
    name: data.name,
    description: data.description ?? null,
    projectType: data.projectType ?? "residential",
    areaSqm: data.areaSqm ?? null,
    budgetEstimate: data.budgetEstimate ?? null,
  });
  const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
  return Number(insertId);
}

export async function updateProject(
  userId: number,
  projectId: number,
  patch: { name?: string; description?: string | null; projectType?: ProjectType; status?: ProjectStatus; areaSqm?: string | null; budgetEstimate?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Record<string, unknown> = {};
  for (const k of ["name", "description", "projectType", "status", "areaSqm", "budgetEstimate"] as const) {
    if (patch[k] !== undefined) updateSet[k] = patch[k];
  }
  if (Object.keys(updateSet).length === 0) return;
  await db.update(projects).set(updateSet)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId))!);
}

export async function deleteProject(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const owned = await db.select({ id: projects.id }).from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId))!)
    .limit(1);
  if (owned.length === 0) throw new Error("Project not found");
  await db.delete(projectItems).where(eq(projectItems.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));
}

async function assertProjectOwner(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, projectId: number) {
  const owned = await db.select({ id: projects.id }).from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId))!)
    .limit(1);
  if (owned.length === 0) throw new Error("Project not found");
}

export async function addProjectItem(
  userId: number,
  data: { projectId: number; itemType: ProjectItemType; itemId: number; quantity?: string; unitPrice?: string | null; notes?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await assertProjectOwner(db, userId, data.projectId);

  let unitPrice = data.unitPrice ?? null;
  if (unitPrice == null) {
    if (data.itemType === "material") {
      const m = await db.select({ basePrice: materials.basePrice }).from(materials).where(eq(materials.id, data.itemId)).limit(1);
      unitPrice = m[0]?.basePrice ?? null;
    } else {
      const tl = await db.select({ basePrice: tools.basePrice }).from(tools).where(eq(tools.id, data.itemId)).limit(1);
      unitPrice = tl[0]?.basePrice ?? null;
    }
  }

  const result = await db.insert(projectItems).values({
    projectId: data.projectId,
    itemType: data.itemType,
    itemId: data.itemId,
    quantity: data.quantity ?? "1.00",
    unitPrice,
    notes: data.notes ?? null,
  });
  const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
  return Number(insertId);
}

export async function updateProjectItem(
  userId: number,
  projectItemId: number,
  patch: { quantity?: string; unitPrice?: string | null; notes?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const row = await db.select().from(projectItems).where(eq(projectItems.id, projectItemId)).limit(1);
  if (row.length === 0) throw new Error("Item not found");
  await assertProjectOwner(db, userId, row[0].projectId);

  const updateSet: Record<string, unknown> = {};
  for (const k of ["quantity", "unitPrice", "notes"] as const) {
    if (patch[k] !== undefined) updateSet[k] = patch[k];
  }
  if (Object.keys(updateSet).length === 0) return;
  await db.update(projectItems).set(updateSet).where(eq(projectItems.id, projectItemId));
}

export async function removeProjectItem(userId: number, projectItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const row = await db.select().from(projectItems).where(eq(projectItems.id, projectItemId)).limit(1);
  if (row.length === 0) return;
  await assertProjectOwner(db, userId, row[0].projectId);
  await db.delete(projectItems).where(eq(projectItems.id, projectItemId));
}

// ─── Safety alerts ───────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";

function activeAlertCondition() {
  const now = new Date();
  return or(isNull(safetyAlerts.expiresAt), gt(safetyAlerts.expiresAt, now))!;
}

export async function listAlerts(opts?: { severity?: AlertSeverity; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  const conditions = [activeAlertCondition()];
  if (opts?.severity) conditions.push(eq(safetyAlerts.severity, opts.severity));
  return (db.select().from(safetyAlerts) as any)
    .where(and(...conditions))
    .orderBy(desc(safetyAlerts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getAlertById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(safetyAlerts).where(eq(safetyAlerts.id, id)).limit(1);
  return result[0];
}

export async function getUnreadAlerts(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const reads = await db.select({ alertId: alertReads.alertId }).from(alertReads)
    .where(eq(alertReads.userId, userId));
  const readIds = reads.map(r => r.alertId);

  const conditions = [activeAlertCondition()];
  if (readIds.length > 0) {
    conditions.push(sql`${safetyAlerts.id} NOT IN (${sql.join(readIds.map(id => sql`${id}`), sql`, `)})`);
  }
  return (db.select().from(safetyAlerts) as any)
    .where(and(...conditions))
    .orderBy(desc(safetyAlerts.severity), desc(safetyAlerts.publishedAt))
    .limit(limit);
}

export async function getUnreadAlertsSummary(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, critical: 0 };
  const unread = await getUnreadAlerts(userId, 200);
  return {
    total: unread.length,
    critical: unread.filter((a: any) => a.severity === "critical").length,
  };
}

export async function markAlertRead(userId: number, alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select({ id: alertReads.id }).from(alertReads)
    .where(and(eq(alertReads.userId, userId), eq(alertReads.alertId, alertId))!)
    .limit(1);
  if (existing.length === 0) {
    await db.insert(alertReads).values({ userId, alertId });
  }
}

export async function markAllAlertsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const unread = await getUnreadAlerts(userId, 1000);
  if (unread.length === 0) return;
  await db.insert(alertReads).values(unread.map((a: any) => ({ userId, alertId: a.id })));
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function createConversation(userId: number, language = "PT", title = "Nova conversa") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatConversations).values({ userId, language, title });
  return (result as any).insertId as number;
}

export async function listConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatConversations)
    .where(eq(chatConversations.userId, userId))
    .orderBy(desc(chatConversations.updatedAt))
    .limit(50);
}

export async function getConversationById(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(chatConversations)
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)))
    .limit(1);
  return rows[0];
}

export async function getConversationMessages(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt))
    .limit(limit);
}

export async function saveChatMessage(conversationId: number, role: "user" | "assistant", content: string, tokensUsed?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values({ conversationId, role, content, tokensUsed });
  await db.update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(chatConversations.id, conversationId));
  return (result as any).insertId as number;
}

export async function updateConversationTitle(userId: number, conversationId: number, title: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(chatConversations)
    .set({ title })
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)));
}

export async function deleteConversation(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(chatMessages).where(eq(chatMessages.conversationId, conversationId));
  await db.delete(chatConversations)
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)));
}

// ─── B2B Partners ────────────────────────────────────────────────────────────

const TIER_QUOTAS: Record<string, number> = { free: 100, pro: 10000, enterprise: 1000000 };

function generateApiKey() {
  return `wbp_${randomBytes(20).toString('hex')}`;
}

export async function registerPartner(data: {
  name: string; email: string; companyName?: string; cnpj?: string; website?: string; description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select({ id: partners.id }).from(partners).where(eq(partners.email, data.email)).limit(1);
  if (existing.length > 0) throw new Error("Email already registered");
  const apiKey = generateApiKey();
  const apiSecret = randomBytes(32).toString('hex');
  const result = await db.insert(partners).values({
    ...data, apiKey, apiSecret, tier: "free", status: "pending", dailyQuota: 100, dailyUsage: 0,
  });
  return { id: (result as any).insertId as number, apiKey };
}

export async function getPartnerByApiKey(apiKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(partners).where(eq(partners.apiKey, apiKey)).limit(1);
  return rows[0];
}

export async function getPartnerByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(partners).where(eq(partners.email, email)).limit(1);
  return rows[0];
}

export async function getPartnerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  return rows[0];
}

export async function regenerateApiKey(partnerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const newKey = generateApiKey();
  await db.update(partners).set({ apiKey: newKey }).where(eq(partners.id, partnerId));
  return newKey;
}

export async function checkAndIncrementQuota(partnerId: number): Promise<{ allowed: boolean; remaining: number }> {
  const db = await getDb();
  if (!db) return { allowed: false, remaining: 0 };
  const rows = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1);
  if (!rows[0]) return { allowed: false, remaining: 0 };
  const partner = rows[0];

  // Reset quota if it's a new day (UTC)
  const now = new Date();
  const lastReset = new Date(partner.lastQuotaReset);
  if (now.toUTCString().slice(0, 16) !== lastReset.toUTCString().slice(0, 16)) {
    await db.update(partners).set({ dailyUsage: 0, lastQuotaReset: now }).where(eq(partners.id, partnerId));
    partner.dailyUsage = 0;
  }

  const quota = TIER_QUOTAS[partner.tier] ?? 100;
  if (partner.dailyUsage >= quota) return { allowed: false, remaining: 0 };

  await db.update(partners).set({ dailyUsage: partner.dailyUsage + 1 }).where(eq(partners.id, partnerId));
  return { allowed: true, remaining: quota - partner.dailyUsage - 1 };
}

export async function upsertPartnerPrices(partnerId: number, items: Array<{
  materialId?: number; toolId?: number; sku?: string; price: string;
  unit?: string; stockQty?: number; storeUrl?: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let updated = 0; let failed = 0;

  for (const item of items) {
    try {
      if (!item.materialId && !item.toolId) { failed++; continue; }
      // Check if existing record
      const cond = item.materialId
        ? and(eq(partnerProducts.partnerId, partnerId), eq(partnerProducts.materialId, item.materialId))!
        : and(eq(partnerProducts.partnerId, partnerId), eq(partnerProducts.toolId, item.toolId!))!;

      const existing = await db.select({ id: partnerProducts.id }).from(partnerProducts).where(cond).limit(1);
      if (existing.length > 0) {
        await db.update(partnerProducts)
          .set({ price: item.price, sku: item.sku, unit: item.unit, stockQty: item.stockQty, storeUrl: item.storeUrl, lastSync: new Date() })
          .where(eq(partnerProducts.id, existing[0].id));
      } else {
        await db.insert(partnerProducts).values({ partnerId, ...item, lastSync: new Date() });
      }
      updated++;
    } catch { failed++; }
  }

  await db.insert(partnerSyncLogs).values({ partnerId, itemsSubmitted: items.length, itemsUpdated: updated, itemsFailed: failed });
  return { updated, failed };
}

export async function getPartnerProducts(partnerId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerProducts)
    .where(eq(partnerProducts.partnerId, partnerId))
    .orderBy(desc(partnerProducts.lastSync))
    .limit(limit);
}

export async function getPartnerSyncLogs(partnerId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerSyncLogs)
    .where(eq(partnerSyncLogs.partnerId, partnerId))
    .orderBy(desc(partnerSyncLogs.createdAt))
    .limit(limit);
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

// ─── Admin helpers ───────────────────────────────────────────────────────────

export async function getAdminMetrics() {
  const db = await getDb();
  if (!db) return null;

  const [[userCount], [matCount], [toolCount], [artCount], [alertCount], [partnerCount], [savedCount], [projectCount], [convCount]] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(materials),
    db.select({ n: count() }).from(tools),
    db.select({ n: count() }).from(knowledgeBaseArticles),
    db.select({ n: count() }).from(safetyAlerts),
    db.select({ n: count() }).from(partners),
    db.select({ n: count() }).from(savedItems),
    db.select({ n: count() }).from(projects),
    db.select({ n: count() }).from(chatConversations),
  ]);

  const tierCounts = await db.select({ tier: users.tier, n: count() }).from(users).groupBy(users.tier);
  const partnerStatusCounts = await db.select({ status: partners.status, n: count() }).from(partners).groupBy(partners.status);
  const riskCounts = await db.select({ risk: materials.riskLevel, n: count() }).from(materials).groupBy(materials.riskLevel);

  return {
    users: Number(userCount?.n ?? 0),
    materials: Number(matCount?.n ?? 0),
    tools: Number(toolCount?.n ?? 0),
    articles: Number(artCount?.n ?? 0),
    alerts: Number(alertCount?.n ?? 0),
    partners: Number(partnerCount?.n ?? 0),
    savedItems: Number(savedCount?.n ?? 0),
    projects: Number(projectCount?.n ?? 0),
    conversations: Number(convCount?.n ?? 0),
    tierCounts: tierCounts.map(r => ({ tier: r.tier, count: Number(r.n) })),
    partnerStatusCounts: partnerStatusCounts.map(r => ({ status: r.status, count: Number(r.n) })),
    riskCounts: riskCounts.map(r => ({ risk: r.risk, count: Number(r.n) })),
  };
}

export async function listAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function adminUpdateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// Materials admin
export async function adminCreateMaterial(data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(materials).values(data as any);
  return { id: Number((result as any).insertId) };
}

export async function adminUpdateMaterial(id: number, patch: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (Object.keys(patch).length === 0) return;
  await db.update(materials).set(patch as any).where(eq(materials.id, id));
}

export async function adminDeleteMaterial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(materials).where(eq(materials.id, id));
}

// Tools admin
export async function adminCreateTool(data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tools).values(data as any);
  return { id: Number((result as any).insertId) };
}

export async function adminUpdateTool(id: number, patch: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (Object.keys(patch).length === 0) return;
  await db.update(tools).set(patch as any).where(eq(tools.id, id));
}

export async function adminDeleteTool(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tools).where(eq(tools.id, id));
}

// Articles admin
export async function adminCreateArticle(data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(knowledgeBaseArticles).values(data as any);
  return { id: Number((result as any).insertId) };
}

export async function adminUpdateArticle(id: number, patch: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (Object.keys(patch).length === 0) return;
  await db.update(knowledgeBaseArticles).set(patch as any).where(eq(knowledgeBaseArticles.id, id));
}

export async function adminDeleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, id));
}

// Alerts admin
export async function adminCreateAlert(data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(safetyAlerts).values(data as any);
  return { id: Number((result as any).insertId) };
}

export async function adminUpdateAlert(id: number, patch: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (Object.keys(patch).length === 0) return;
  await db.update(safetyAlerts).set(patch as any).where(eq(safetyAlerts.id, id));
}

export async function adminDeleteAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(safetyAlerts).where(eq(safetyAlerts.id, id));
}

// Partners admin
export async function listAllPartners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partners).orderBy(desc(partners.createdAt));
}

export async function adminUpdatePartnerStatus(id: number, status: "pending" | "active" | "suspended" | "inactive") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(partners).set({ status }).where(eq(partners.id, id));
}

