import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as chatbots from "./chatbots";

/**
 * CHATBOTS ROUTER
 * Market analysis, recommendations, and automated reporting
 */
export const chatbotsRouter = router({
  /**
   * MARKET PRICE BOT
   */
  priceBot: router({
    analyzeMarket: publicProcedure
      .input(
        z.object({
          marketData: z.array(
            z.object({
              materialId: z.string(),
              materialName: z.string(),
              region: z.string(),
              currentPrice: z.number(),
              historicalPrices: z.array(z.number()),
              suppliers: z.array(
                z.object({
                  name: z.string(),
                  price: z.number(),
                  availability: z.number(),
                })
              ),
              trend: z.enum(["up", "down", "stable"]),
              volatility: z.number(),
            })
          ),
        })
      )
      .query(({ input }) => chatbots.analyzePriceMarket(input.marketData)),

    generateWeeklyReport: publicProcedure
      .input(
        z.object({
          weeklyData: z.array(
            z.object({
              date: z.string(),
              prices: z.array(
                z.object({
                  materialId: z.string(),
                  materialName: z.string(),
                  region: z.string(),
                  currentPrice: z.number(),
                  historicalPrices: z.array(z.number()),
                  suppliers: z.array(
                    z.object({
                      name: z.string(),
                      price: z.number(),
                      availability: z.number(),
                    })
                  ),
                  trend: z.enum(["up", "down", "stable"]),
                  volatility: z.number(),
                })
              ),
            })
          ),
        })
      )
      .query(({ input }) => chatbots.generateWeeklyPriceReport(input.weeklyData)),
  }),

  /**
   * SUPPLIER RECOMMENDATION BOT
   */
  supplierBot: router({
    recommend: publicProcedure
      .input(
        z.object({
          suppliers: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              region: z.string(),
              rating: z.number(),
              deliveryTime: z.number(),
              reliability: z.number(),
              priceCompetitiveness: z.number(),
              specialties: z.array(z.string()),
            })
          ),
          requirements: z.object({
            material: z.string(),
            quantity: z.number(),
            urgency: z.enum(["low", "medium", "high"]),
            budget: z.number(),
            region: z.string().optional(),
          }),
        })
      )
      .query(({ input }) =>
        chatbots.recommendSuppliers(input.suppliers, input.requirements)
      ),
  }),

  /**
   * TECHNICAL SUPPORT BOT
   */
  supportBot: router({
    answer: publicProcedure
      .input(
        z.object({
          category: z.string(),
          question: z.string(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        })
      )
      .query(({ input }) => chatbots.generateTechnicalSupport(input)),
  }),

  /**
   * AUTOMATED REPORTING
   */
  reports: router({
    generateWeekly: publicProcedure
      .input(
        z.object({
          weekData: z.object({
            priceData: z.array(
              z.object({
                materialId: z.string(),
                materialName: z.string(),
                region: z.string(),
                currentPrice: z.number(),
                historicalPrices: z.array(z.number()),
                suppliers: z.array(
                  z.object({
                    name: z.string(),
                    price: z.number(),
                    availability: z.number(),
                  })
                ),
                trend: z.enum(["up", "down", "stable"]),
                volatility: z.number(),
              })
            ),
            projectsCompleted: z.number(),
            calculationsPerformed: z.number(),
            topMaterials: z.array(z.string()),
            alerts: z.array(z.string()),
          }),
        })
      )
      .query(({ input }) => chatbots.generateWeeklyReport(input.weekData)),
  }),
});
