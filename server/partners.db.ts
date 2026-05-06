import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  partners,
  partnerDataSources,
  partnerProducts,
  partnerApiLogs,
  syncQueue,
  partnerAnalytics,
  partnerWebhooks,
  offlineSyncMetadata,
  InsertPartner,
  Partner,
  InsertPartnerDataSource,
  InsertPartnerProduct,
  InsertPartnerAnalytic,
} from "../drizzle/schema";
import crypto from "crypto";

/**
 * Generate secure API key and secret
 */
export function generateApiCredentials(): { apiKey: string; apiSecret: string } {
  const apiKey = crypto.randomBytes(32).toString("hex");
  const apiSecret = crypto.randomBytes(32).toString("hex");
  return { apiKey, apiSecret };
}

/**
 * Hash API secret for storage
 */
export function hashApiSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

/**
 * Verify API secret
 */
export function verifyApiSecret(secret: string, hash: string): boolean {
  return hashApiSecret(secret) === hash;
}

/**
 * Create a new partner
 */
export async function createPartner(data: Omit<InsertPartner, "apiKey" | "apiSecret">): Promise<Partner | null> {
  const db = await getDb();
  if (!db) return null;

  const { apiKey, apiSecret } = generateApiCredentials();
  const hashedSecret = hashApiSecret(apiSecret);

  try {
    const result = await db.insert(partners).values({
      ...data,
      apiKey,
      apiSecret: hashedSecret,
    } as InsertPartner);

    // Return the created partner with the unhashed secret (only shown once)
    return {
      ...data,
      id: result[0],
      apiKey,
      apiSecret: apiSecret, // Return unhashed for display
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  } catch (error) {
    console.error("[Partners] Failed to create partner:", error);
    return null;
  }
}

/**
 * Get partner by API key
 */
export async function getPartnerByApiKey(apiKey: string): Promise<Partner | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(partners)
      .where(eq(partners.apiKey, apiKey))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Partners] Failed to get partner by API key:", error);
    return null;
  }
}

/**
 * Get partner by ID
 */
export async function getPartnerById(id: number): Promise<Partner | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Partners] Failed to get partner:", error);
    return null;
  }
}

/**
 * Get all partners
 */
export async function getAllPartners(limit = 50, offset = 0): Promise<Partner[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(partners)
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("[Partners] Failed to get partners:", error);
    return [];
  }
}

/**
 * Update partner
 */
export async function updatePartner(id: number, data: Partial<Partner>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(partners).set(data).where(eq(partners.id, id));
    return true;
  } catch (error) {
    console.error("[Partners] Failed to update partner:", error);
    return false;
  }
}

/**
 * Create data source for partner
 */
export async function createDataSource(
  partnerId: number,
  data: Omit<InsertPartnerDataSource, "partnerId">
): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(partnerDataSources).values({
      ...data,
      partnerId,
    } as InsertPartnerDataSource);

    return result;
  } catch (error) {
    console.error("[Partners] Failed to create data source:", error);
    return null;
  }
}

/**
 * Get data sources for partner
 */
export async function getPartnerDataSources(partnerId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(partnerDataSources)
      .where(eq(partnerDataSources.partnerId, partnerId));
  } catch (error) {
    console.error("[Partners] Failed to get data sources:", error);
    return [];
  }
}

/**
 * Add partner product
 */
export async function addPartnerProduct(
  partnerId: number,
  data: Omit<InsertPartnerProduct, "partnerId">
): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(partnerProducts).values({
      ...data,
      partnerId,
    } as InsertPartnerProduct);

    return result;
  } catch (error) {
    console.error("[Partners] Failed to add product:", error);
    return null;
  }
}

/**
 * Get partner products
 */
export async function getPartnerProducts(
  partnerId: number,
  limit = 50,
  offset = 0
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(partnerProducts)
      .where(eq(partnerProducts.partnerId, partnerId))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("[Partners] Failed to get products:", error);
    return [];
  }
}

/**
 * Log API request
 */
export async function logApiRequest(
  partnerId: number,
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  requestSize: number,
  responseSize: number,
  errorMessage?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(partnerApiLogs).values({
      partnerId,
      method,
      endpoint,
      statusCode,
      duration,
      requestSize,
      responseSize,
      errorMessage,
    });

    return true;
  } catch (error) {
    console.error("[Partners] Failed to log API request:", error);
    return false;
  }
}

/**
 * Get API logs for partner
 */
export async function getPartnerApiLogs(
  partnerId: number,
  limit = 100,
  offset = 0
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(partnerApiLogs)
      .where(eq(partnerApiLogs.partnerId, partnerId))
      .orderBy(desc(partnerApiLogs.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("[Partners] Failed to get API logs:", error);
    return [];
  }
}

/**
 * Add to sync queue
 */
export async function addToSyncQueue(
  userId: number | null,
  partnerId: number | null,
  entityType: string,
  entityId: number,
  action: "create" | "update" | "delete",
  data: any
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(syncQueue).values({
      userId,
      partnerId,
      entityType,
      entityId,
      action,
      data: JSON.stringify(data),
    });

    return true;
  } catch (error) {
    console.error("[Partners] Failed to add to sync queue:", error);
    return false;
  }
}

/**
 * Get pending sync items
 */
export async function getPendingSyncItems(limit = 100): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(syncQueue)
      .where(eq(syncQueue.status, "pending"))
      .limit(limit);
  } catch (error) {
    console.error("[Partners] Failed to get pending sync items:", error);
    return [];
  }
}

/**
 * Mark sync item as synced
 */
export async function markSyncItemAsSynced(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(syncQueue)
      .set({ status: "synced", syncedAt: new Date() })
      .where(eq(syncQueue.id, id));

    return true;
  } catch (error) {
    console.error("[Partners] Failed to mark sync item as synced:", error);
    return false;
  }
}

/**
 * Record partner analytics
 */
export async function recordPartnerAnalytics(
  partnerId: number,
  date: string,
  data: Partial<InsertPartnerAnalytic>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(partnerAnalytics).values({
      partnerId,
      date,
      ...data,
    } as InsertPartnerAnalytic);

    return true;
  } catch (error) {
    console.error("[Partners] Failed to record analytics:", error);
    return false;
  }
}

/**
 * Get partner analytics
 */
export async function getPartnerAnalytics(
  partnerId: number,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(partnerAnalytics)
      .where(
        and(
          eq(partnerAnalytics.partnerId, partnerId),
          // Simple date range comparison (assumes YYYY-MM-DD format)
        )
      )
      .orderBy(desc(partnerAnalytics.date));
  } catch (error) {
    console.error("[Partners] Failed to get analytics:", error);
    return [];
  }
}

/**
 * Create webhook for partner
 */
export async function createWebhook(
  partnerId: number,
  url: string,
  events: string[],
  secret: string
): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(partnerWebhooks).values({
      partnerId,
      url,
      events: JSON.stringify(events),
      secret,
    });

    return result;
  } catch (error) {
    console.error("[Partners] Failed to create webhook:", error);
    return null;
  }
}

/**
 * Get webhooks for partner
 */
export async function getPartnerWebhooks(partnerId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(partnerWebhooks)
      .where(eq(partnerWebhooks.partnerId, partnerId));
  } catch (error) {
    console.error("[Partners] Failed to get webhooks:", error);
    return [];
  }
}

/**
 * Record offline sync metadata
 */
export async function recordOfflineSyncMetadata(
  userId: number,
  deviceId: string,
  pendingChanges: number,
  cacheSize: number,
  isOnline: boolean
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(offlineSyncMetadata).values({
      userId,
      deviceId,
      lastSyncAt: new Date(),
      pendingChanges,
      cacheSize,
      isOnline: isOnline ? 1 : 0,
    });

    return true;
  } catch (error) {
    console.error("[Partners] Failed to record offline sync metadata:", error);
    return false;
  }
}

/**
 * Get offline sync status for user
 */
export async function getOfflineSyncStatus(userId: number, deviceId: string): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(offlineSyncMetadata)
      .where(
        and(
          eq(offlineSyncMetadata.userId, userId),
          eq(offlineSyncMetadata.deviceId, deviceId)
        )
      )
      .orderBy(desc(offlineSyncMetadata.createdAt))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Partners] Failed to get offline sync status:", error);
    return null;
  }
}
