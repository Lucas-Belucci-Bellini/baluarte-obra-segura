import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as bm from "./businessModel";

/**
 * BUSINESS MODEL ROUTER
 * Subscription management and feature access control
 */
export const businessModelRouter = router({
  /**
   * SUBSCRIPTION PLANS
   */
  plans: router({
    list: publicProcedure.query(() => {
      return Object.values(bm.SUBSCRIPTION_PLANS);
    }),

    getById: publicProcedure
      .input(z.enum(["free", "pro", "enterprise"]))
      .query(({ input }) => bm.SUBSCRIPTION_PLANS[input]),

    compare: publicProcedure.query(() => {
      const plans = Object.values(bm.SUBSCRIPTION_PLANS);
      return {
        plans,
        comparison: {
          free: { price: 0, calculations: 50, projects: 3, storage: 1 },
          pro: { price: 29, calculations: 5000, projects: 50, storage: 50 },
          enterprise: { price: 'Custom', calculations: '∞', projects: '∞', storage: '∞' },
        },
      };
    }),
  }),

  /**
   * FEATURE ACCESS CONTROL
   */
  features: router({
    canPerform: protectedProcedure
      .input(
        z.object({
          action: z.string(),
          currentUsage: z.number().default(0),
        })
      )
      .query(({ input, ctx }) => {
        const userTier = (ctx.user?.role === 'admin' ? 'enterprise' : 'free') as bm.SubscriptionTier;
        return bm.canPerformAction(userTier, input.action, input.currentUsage);
      }),

    checkLimit: protectedProcedure
      .input(
        z.object({
          action: z.enum(['createCalculation', 'createProject', 'useApiCall']),
          currentUsage: z.number(),
        })
      )
      .query(({ input, ctx }) => {
        const userTier = (ctx.user?.role === 'admin' ? 'enterprise' : 'free') as bm.SubscriptionTier;
        return bm.canPerformAction(userTier, input.action, input.currentUsage);
      }),
  }),

  /**
   * USAGE & ANALYTICS
   */
  usage: router({
    generateReport: protectedProcedure
      .input(
        z.object({
          calculationsPerMonth: z.number(),
          projectsPerMonth: z.number(),
          apiCallsPerDay: z.number(),
          storageUsedGB: z.number(),
          teamMembers: z.number(),
        })
      )
      .query(({ input, ctx }) => {
        const userTier = (ctx.user?.role === 'admin' ? 'enterprise' : 'free') as bm.SubscriptionTier;
        return bm.generateUsageReport(userTier, input);
      }),

    recommendUpgrade: protectedProcedure
      .input(
        z.object({
          calculationsPerMonth: z.number(),
          projectsPerMonth: z.number(),
          apiCallsPerDay: z.number(),
          teamMembers: z.number(),
        })
      )
      .query(({ input, ctx }) => {
        const userTier = (ctx.user?.role === 'admin' ? 'enterprise' : 'free') as bm.SubscriptionTier;
        return bm.recommendUpgrade(userTier, input);
      }),
  }),

  /**
   * BILLING
   */
  billing: router({
    calculateCost: publicProcedure
      .input(
        z.object({
          tier: z.enum(['free', 'pro', 'enterprise']),
          months: z.number().min(1),
          additionalCharges: z.number().default(0),
        })
      )
      .query(({ input }) => bm.calculateBilling(input.tier, input.months, input.additionalCharges)),

    estimateMonthly: publicProcedure
      .input(
        z.object({
          tier: z.enum(['free', 'pro', 'enterprise']),
        })
      )
      .query(({ input }) => {
        const plan = bm.SUBSCRIPTION_PLANS[input.tier];
        return {
          tier: plan.name,
          monthlyPrice: plan.price,
          annualPrice: plan.price * 12,
          savings: plan.price > 0 ? Math.round(plan.price * 12 * 0.15) : 0,
        };
      }),
  }),
});
