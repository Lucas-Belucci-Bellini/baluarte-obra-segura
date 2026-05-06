import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, materials, stores, materialStores, knowledgeBaseArticles } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

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

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getMaterials(categoryId?: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  if (categoryId) {
    return db.select().from(materials)
      .where(eq(materials.categoryId, categoryId))
      .limit(limit)
      .offset(offset);
  }
  return db.select().from(materials).limit(limit).offset(offset);
}

export async function getMaterialById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
  return result[0];
}

export async function searchMaterials(searchQuery: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  // Simple search - returns all materials if empty query
  if (!searchQuery || searchQuery.trim() === '') {
    return db.select().from(materials).limit(limit);
  }
  // In a real app, you'd use LIKE or full-text search
  // For now, return all materials (implement proper search in frontend)
  return db.select().from(materials).limit(limit);
}

export async function getStoresForMaterial(materialId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ store: stores })
    .from(materialStores)
    .innerJoin(stores, eq(materialStores.storeId, stores.id))
    .where(eq(materialStores.materialId, materialId));
}

export async function getKnowledgeBaseArticles(categoryId?: number, featured = false, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  if (categoryId && featured) {
    return db.select().from(knowledgeBaseArticles)
      .where(eq(knowledgeBaseArticles.categoryId, categoryId))
      .limit(limit)
      .offset(offset);
  }
  if (categoryId) {
    return db.select().from(knowledgeBaseArticles)
      .where(eq(knowledgeBaseArticles.categoryId, categoryId))
      .limit(limit)
      .offset(offset);
  }
  if (featured) {
    return db.select().from(knowledgeBaseArticles)
      .where(eq(knowledgeBaseArticles.featured, 1))
      .limit(limit)
      .offset(offset);
  }
  return db.select().from(knowledgeBaseArticles).limit(limit).offset(offset);
}

export async function getKnowledgeBaseArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, id)).limit(1);
  return result[0];
}
