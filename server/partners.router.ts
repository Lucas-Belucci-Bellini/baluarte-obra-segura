import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as partnerDb from "./partners.db";
import { TRPCError } from "@trpc/server";

/**
 * Partner B2B Router
 * Handles all partner-related operations including registration, data sync, and analytics
 */
export const partnerRouter = router({
  /**
   * PARTNER MANAGEMENT
   */

  /**
   * Register a new partner company
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const partner = await partnerDb.createPartner({
        ...input,
        tier: "free",
        status: "pending",
        dataSourceType: "api",
      });

      if (!partner) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create partner",
        });
      }

      return {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        apiKey: partner.apiKey,
        apiSecret: partner.apiSecret, // Only shown once
        message: "Partner registered successfully. Save your API credentials securely.",
      };
    }),

  /**
   * Get partner profile
   */
  getProfile: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      return {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        tier: partner.tier,
        status: partner.status,
        createdAt: partner.createdAt,
        lastSyncAt: partner.lastSyncAt,
      };
    }),

  /**
   * Update partner profile
   */
  updateProfile: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        name: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      const updated = await partnerDb.updatePartner(partner.id, {
        name: input.name || partner.name,
        phone: input.phone || partner.phone,
        website: input.website || partner.website,
        industry: input.industry || partner.industry,
        country: input.country || partner.country,
      });

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }

      return { success: true };
    }),

  /**
   * DATA SOURCE MANAGEMENT
   */

  /**
   * Create data source
   */
  createDataSource: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        name: z.string(),
        type: z.enum(["products", "materials", "suppliers", "prices", "specifications"]),
        sourceUrl: z.string().optional(),
        sourceFormat: z.enum(["json", "csv", "xml", "database"]).optional(),
        mappingConfig: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      const result = await partnerDb.createDataSource(partner.id, {
        name: input.name,
        type: input.type,
        sourceUrl: input.sourceUrl || undefined,
        sourceFormat: input.sourceFormat || "json",
        mappingConfig: input.mappingConfig ? JSON.stringify(input.mappingConfig) : undefined,
      });

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create data source",
        });
      }

      return { success: true, dataSourceId: result[0] };
    }),

  /**
   * Get data sources
   */
  getDataSources: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      return await partnerDb.getPartnerDataSources(partner.id);
    }),

  /**
   * PRODUCT MANAGEMENT
   */

  /**
   * Import products (batch)
   */
  importProducts: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        dataSourceId: z.number(),
        products: z.array(
          z.object({
            externalId: z.string(),
            name: z.string(),
            description: z.string().optional(),
            category: z.string().optional(),
            price: z.string().optional(),
            currency: z.string().optional(),
            stock: z.number().optional(),
            specifications: z.record(z.string(), z.any()).optional(),
            certifications: z.array(z.string()).optional(),
            leadTime: z.number().optional(),
            minOrder: z.number().optional(),
            maxOrder: z.number().optional(),
            imageUrl: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      let successCount = 0;
      let errorCount = 0;

      for (const product of input.products) {
        try {
          await partnerDb.addPartnerProduct(partner.id, {
            externalId: product.externalId,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            currency: product.currency || "BRL",
            stock: product.stock,
            specifications: product.specifications ? JSON.stringify(product.specifications) : undefined,
            certifications: product.certifications ? JSON.stringify(product.certifications) : undefined,
            leadTime: product.leadTime,
            minOrder: product.minOrder || 1,
            maxOrder: product.maxOrder,
            imageUrl: product.imageUrl,
            dataSourceId: input.dataSourceId,
          });

          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      return {
        success: true,
        imported: successCount,
        failed: errorCount,
        total: input.products.length,
      };
    }),

  /**
   * Get partner products
   */
  getProducts: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      return await partnerDb.getPartnerProducts(partner.id, input.limit, input.offset);
    }),

  /**
   * ANALYTICS & REPORTING
   */

  /**
   * Get partner dashboard analytics
   */
  getAnalytics: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      const analytics = await partnerDb.getPartnerAnalytics(
        partner.id,
        input.startDate,
        input.endDate
      );

      // Calculate aggregates
      const totals = analytics.reduce(
        (acc, day) => ({
          productViews: acc.productViews + (day.productViews || 0),
          productClicks: acc.productClicks + (day.productClicks || 0),
          addToCart: acc.addToCart + (day.addToCart || 0),
          purchases: acc.purchases + (day.purchases || 0),
          revenue: acc.revenue + parseFloat(day.revenue || 0),
          leads: acc.leads + (day.leads || 0),
          uniqueUsers: acc.uniqueUsers + (day.uniqueUsers || 0),
        }),
        {
          productViews: 0,
          productClicks: 0,
          addToCart: 0,
          purchases: 0,
          revenue: 0,
          leads: 0,
          uniqueUsers: 0,
        }
      );

      return {
        partner: {
          id: partner.id,
          name: partner.name,
          tier: partner.tier,
        },
        totals,
        dailyData: analytics,
      };
    }),

  /**
   * Get API logs
   */
  getApiLogs: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      return await partnerDb.getPartnerApiLogs(partner.id, input.limit, input.offset);
    }),

  /**
   * WEBHOOK MANAGEMENT
   */

  /**
   * Create webhook
   */
  createWebhook: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        url: z.string().url(),
        events: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      const secret = partnerDb.generateApiCredentials().apiSecret;

      const result = await partnerDb.createWebhook(
        partner.id,
        input.url,
        input.events,
        secret || ""
      );

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create webhook",
        });
      }

      return {
        success: true,
        webhookId: result[0],
        secret: secret, // Only shown once
      };
    }),

  /**
   * Get webhooks
   */
  getWebhooks: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      return await partnerDb.getPartnerWebhooks(partner.id);
    }),

  /**
   * SYNC MANAGEMENT
   */

  /**
   * Get pending sync items
   */
  getPendingSyncItems: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      return await partnerDb.getPendingSyncItems(100);
    }),

  /**
   * Mark sync item as synced
   */
  markSyncItemAsSynced: publicProcedure
    .input(z.object({ apiKey: z.string(), syncItemId: z.number() }))
    .mutation(async ({ input }) => {
      const partner = await partnerDb.getPartnerByApiKey(input.apiKey);

      if (!partner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      const success = await partnerDb.markSyncItemAsSynced(input.syncItemId);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark sync item as synced",
        });
      }

      return { success: true };
    }),
});
