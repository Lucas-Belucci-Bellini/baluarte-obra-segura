import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getCategories, getMaterials, getMaterialById, getStoresForMaterial, searchMaterials, getKnowledgeBaseArticles, getKnowledgeBaseArticleById } from "./db";
import { calculatorsRouter } from "./calculators.router";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  materials: router({
    list: publicProcedure
      .input(z.object({ categoryId: z.number().optional(), limit: z.number().default(20), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return getMaterials(input?.categoryId, input?.limit, input?.offset);
      }),
    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const material = await getMaterialById(input);
        if (!material) return null;
        const stores = await getStoresForMaterial(input);
        return { ...material, stores };
      }),
    search: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return searchMaterials(input, 10);
      }),
  }),

  categories: router({
    list: publicProcedure
      .query(async () => {
        return getCategories();
      }),
  }),

  knowledgeBase: router({
    articles: publicProcedure
      .input(z.object({ categoryId: z.number().optional(), featured: z.boolean().default(false), limit: z.number().default(10), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return getKnowledgeBaseArticles(input?.categoryId, input?.featured, input?.limit, input?.offset);
      }),
    byId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getKnowledgeBaseArticleById(input);
      }),
  }),

  calculators: calculatorsRouter,
});

export type AppRouter = typeof appRouter;
