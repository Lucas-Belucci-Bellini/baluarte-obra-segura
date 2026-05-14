import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getCategories, getMaterials, getMaterialById, getMaterialBySlug, getMaterialPrices,
  getToolCategories, getTools, getToolById, getToolPrices,
  getKnowledgeBaseArticles, getKnowledgeBaseArticleById,
  getCalculators, globalSearch,
  updateUserProfile, getUserByOpenId,
  listSavedItems, listSavedItemKeys, toggleSavedItem, updateSavedItemNotes,
  listProjects, getProjectById, createProject, updateProject, deleteProject,
  addProjectItem, updateProjectItem, removeProjectItem,
  listAlerts, getUnreadAlerts, getUnreadAlertsSummary, markAlertRead, markAllAlertsRead,
} from "./db";

const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal");
const projectTypeEnum = z.enum(["residential", "commercial", "industrial", "rural", "renovation", "other"]);
const projectStatusEnum = z.enum(["planning", "active", "completed", "archived"]);
const projectItemTypeEnum = z.enum(["material", "tool"]);
const alertSeverityEnum = z.enum(["critical", "warning", "info"]);

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(120).optional(),
        bio: z.string().max(500).optional(),
        profession: z.string().max(100).optional(),
        avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, {
          name: input.name,
          bio: input.bio,
          profession: input.profession,
          avatarUrl: input.avatarUrl === "" ? null : input.avatarUrl,
        });
        const fresh = await getUserByOpenId(ctx.user.openId);
        return fresh ?? ctx.user;
      }),
  }),

  // ─── Categories ────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => getCategories()),
  }),

  // ─── Materials ─────────────────────────────────────────────────────────────
  materials: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        riskLevel: z.enum(["RISCO_ALTO", "ATENCAO", "NORMAL"]).optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(({ input }) => getMaterials(input ?? {})),

    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const material = await getMaterialById(input);
        if (!material) return null;
        const prices = await getMaterialPrices(input);
        return { ...material, prices };
      }),

    bySlug: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const material = await getMaterialBySlug(input);
        if (!material) return null;
        const prices = await getMaterialPrices(material.id);
        return { ...material, prices };
      }),

    search: publicProcedure
      .input(z.string())
      .query(({ input }) => getMaterials({ search: input, limit: 10 })),
  }),

  // ─── Tools ─────────────────────────────────────────────────────────────────
  toolCategories: router({
    list: publicProcedure.query(() => getToolCategories()),
  }),

  tools: router({
    list: publicProcedure
      .input(z.object({
        toolCategoryId: z.number().optional(),
        search: z.string().optional(),
        powerType: z.enum(["corded", "battery", "manual", "pneumatic", "hydraulic"]).optional(),
        professionLevel: z.enum(["beginner", "intermediate", "professional"]).optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(({ input }) => getTools(input ?? {})),

    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const tool = await getToolById(input);
        if (!tool) return null;
        const prices = await getToolPrices(input);
        return { ...tool, prices };
      }),

    search: publicProcedure
      .input(z.string())
      .query(({ input }) => getTools({ search: input, limit: 10 })),
  }),

  // ─── Knowledge Base ────────────────────────────────────────────────────────
  knowledgeBase: router({
    articles: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        featured: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(({ input }) => getKnowledgeBaseArticles(input ?? {})),

    byId: publicProcedure
      .input(z.number())
      .query(({ input }) => getKnowledgeBaseArticleById(input)),
  }),

  // ─── Calculators ───────────────────────────────────────────────────────────
  calculators: router({
    list: publicProcedure
      .input(z.object({
        categorySlug: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().default(50),
      }).optional())
      .query(({ input }) => getCalculators(input ?? {})),
  }),

  // ─── Safety alerts ─────────────────────────────────────────────────────────
  alerts: router({
    list: publicProcedure
      .input(z.object({
        severity: alertSeverityEnum.optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional())
      .query(({ input }) => listAlerts(input ?? {})),

    unreadSummary: protectedProcedure.query(({ ctx }) => getUnreadAlertsSummary(ctx.user.id)),

    unread: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }).optional())
      .query(({ ctx, input }) => getUnreadAlerts(ctx.user.id, input?.limit ?? 10)),

    markRead: protectedProcedure
      .input(z.object({ alertId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await markAlertRead(ctx.user.id, input.alertId);
        return { success: true } as const;
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllAlertsRead(ctx.user.id);
      return { success: true } as const;
    }),
  }),

  // ─── Global Search ─────────────────────────────────────────────────────────
  search: router({
    global: publicProcedure
      .input(z.string().min(1).max(200))
      .query(({ input }) => globalSearch(input, 8)),
  }),

  // ─── Projects ──────────────────────────────────────────────────────────────
  projects: router({
    list: protectedProcedure.query(({ ctx }) => listProjects(ctx.user.id)),

    byId: protectedProcedure
      .input(z.number().int().positive())
      .query(({ ctx, input }) => getProjectById(ctx.user.id, input)),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(2000).nullable().optional(),
        projectType: projectTypeEnum.optional(),
        areaSqm: decimalString.nullable().optional(),
        budgetEstimate: decimalString.nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createProject(ctx.user.id, input);
        return { id } as const;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).nullable().optional(),
        projectType: projectTypeEnum.optional(),
        status: projectStatusEnum.optional(),
        areaSqm: decimalString.nullable().optional(),
        budgetEstimate: decimalString.nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...patch } = input;
        await updateProject(ctx.user.id, id, patch);
        return { success: true } as const;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await deleteProject(ctx.user.id, input.id);
        return { success: true } as const;
      }),

    addItem: protectedProcedure
      .input(z.object({
        projectId: z.number().int().positive(),
        itemType: projectItemTypeEnum,
        itemId: z.number().int().positive(),
        quantity: decimalString.optional(),
        unitPrice: decimalString.nullable().optional(),
        notes: z.string().max(500).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await addProjectItem(ctx.user.id, input);
        return { id } as const;
      }),

    updateItem: protectedProcedure
      .input(z.object({
        projectItemId: z.number().int().positive(),
        quantity: decimalString.optional(),
        unitPrice: decimalString.nullable().optional(),
        notes: z.string().max(500).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { projectItemId, ...patch } = input;
        await updateProjectItem(ctx.user.id, projectItemId, patch);
        return { success: true } as const;
      }),

    removeItem: protectedProcedure
      .input(z.object({ projectItemId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await removeProjectItem(ctx.user.id, input.projectItemId);
        return { success: true } as const;
      }),
  }),

  // ─── Saved items (favoritos) ───────────────────────────────────────────────
  savedItems: router({
    list: protectedProcedure.query(({ ctx }) => listSavedItems(ctx.user.id)),

    keys: protectedProcedure.query(({ ctx }) => listSavedItemKeys(ctx.user.id)),

    toggle: protectedProcedure
      .input(z.object({
        itemType: z.enum(["material", "tool", "article", "calculator"]),
        itemId: z.number().int().positive(),
      }))
      .mutation(({ ctx, input }) => toggleSavedItem(ctx.user.id, input.itemType, input.itemId)),

    notes: protectedProcedure
      .input(z.object({
        savedItemId: z.number().int().positive(),
        notes: z.string().max(2000).nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateSavedItemNotes(ctx.user.id, input.savedItemId, input.notes);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
