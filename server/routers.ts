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
} from "./db";

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

  // ─── Global Search ─────────────────────────────────────────────────────────
  search: router({
    global: publicProcedure
      .input(z.string().min(1).max(200))
      .query(({ input }) => globalSearch(input, 8)),
  }),
});

export type AppRouter = typeof appRouter;
