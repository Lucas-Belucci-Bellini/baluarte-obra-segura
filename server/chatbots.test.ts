import { describe, it, expect } from 'vitest';
import * as chatbots from './chatbots';

describe('CHATBOTS: Market & AI System', () => {
  describe('Price Market Bot', () => {
    it('should analyze market prices', () => {
      const marketData = [
        {
          materialId: '1',
          materialName: 'Concreto',
          region: 'SP',
          currentPrice: 500,
          historicalPrices: [480, 490, 500],
          suppliers: [
            { name: 'Supplier A', price: 480, availability: 100 },
            { name: 'Supplier B', price: 510, availability: 80 },
          ],
          trend: 'up' as const,
          volatility: 0.05,
        },
      ];

      const result = chatbots.analyzePriceMarket(marketData);

      expect(result.averagePrice).toBeGreaterThan(0);
      expect(result.priceRange.min).toBeLessThanOrEqual(result.priceRange.max);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify best deals', () => {
      const marketData = [
        {
          materialId: '1',
          materialName: 'Aço',
          region: 'RJ',
          currentPrice: 1000,
          historicalPrices: [950, 1000, 1000],
          suppliers: [
            { name: 'Cheap Supplier', price: 800, availability: 100 },
            { name: 'Normal Supplier', price: 1000, availability: 80 },
          ],
          trend: 'stable' as const,
          volatility: 0.02,
        },
      ];

      const result = chatbots.analyzePriceMarket(marketData);

      expect(result.bestDeals.length).toBeGreaterThan(0);
      expect(result.bestDeals[0].savings).toBeGreaterThan(0);
    });

    it('should generate weekly price report', () => {
      const weeklyData = [
        {
          date: '2026-05-01',
          prices: [
            {
              materialId: '1',
              materialName: 'Cimento',
              region: 'SP',
              currentPrice: 400,
              historicalPrices: [400],
              suppliers: [{ name: 'S1', price: 400, availability: 100 }],
              trend: 'stable' as const,
              volatility: 0.01,
            },
          ],
        },
        {
          date: '2026-05-07',
          prices: [
            {
              materialId: '1',
              materialName: 'Cimento',
              region: 'SP',
              currentPrice: 420,
              historicalPrices: [420],
              suppliers: [{ name: 'S1', price: 420, availability: 100 }],
              trend: 'up' as const,
              volatility: 0.05,
            },
          ],
        },
      ];

      const result = chatbots.generateWeeklyPriceReport(weeklyData);

      expect(result.weekStart).toBe('2026-05-01');
      expect(result.weekEnd).toBe('2026-05-07');
      expect(result.summary).toBeTruthy();
    });
  });

  describe('Supplier Recommendation Bot', () => {
    it('should recommend suppliers', () => {
      const suppliers = [
        {
          id: '1',
          name: 'Supplier A',
          region: 'SP',
          rating: 4.8,
          deliveryTime: 2,
          reliability: 0.98,
          priceCompetitiveness: 0.9,
          specialties: ['Concreto', 'Aço'],
        },
        {
          id: '2',
          name: 'Supplier B',
          region: 'SP',
          rating: 4.2,
          deliveryTime: 5,
          reliability: 0.85,
          priceCompetitiveness: 0.75,
          specialties: ['Cerâmica'],
        },
      ];

      const requirements = {
        material: 'Concreto',
        quantity: 100,
        urgency: 'high' as const,
        budget: 50000,
        region: 'SP',
      };

      const result = chatbots.recommendSuppliers(suppliers, requirements);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].score).toBeGreaterThan(0);
      expect(result[0].reasoning.length).toBeGreaterThan(0);
    });

    it('should prioritize fast delivery for urgent requests', () => {
      const suppliers = [
        {
          id: '1',
          name: 'Fast Supplier',
          region: 'SP',
          rating: 4.0,
          deliveryTime: 1,
          reliability: 0.9,
          priceCompetitiveness: 0.8,
          specialties: ['Concreto'],
        },
        {
          id: '2',
          name: 'Slow Supplier',
          region: 'SP',
          rating: 4.8,
          deliveryTime: 10,
          reliability: 0.95,
          priceCompetitiveness: 0.85,
          specialties: ['Concreto'],
        },
      ];

      const urgentRequirements = {
        material: 'Concreto',
        quantity: 100,
        urgency: 'high' as const,
        budget: 50000,
      };

      const result = chatbots.recommendSuppliers(suppliers, urgentRequirements);

      expect(result[0].supplier).toBe('Fast Supplier');
    });
  });

  describe('Technical Support Bot', () => {
    it('should provide concrete calculation support', () => {
      const question = {
        category: 'concrete',
        question: 'How to calculate concrete volume?',
        difficulty: 'beginner' as const,
      };

      const result = chatbots.generateTechnicalSupport(question);

      expect(result.answer).toBeTruthy();
      expect(result.relatedTopics.length).toBeGreaterThan(0);
      expect(result.resources.length).toBeGreaterThan(0);
      expect(result.nextSteps.length).toBeGreaterThan(0);
    });

    it('should provide electrical support', () => {
      const question = {
        category: 'electrical',
        question: 'How to select wire gauge?',
        difficulty: 'intermediate' as const,
      };

      const result = chatbots.generateTechnicalSupport(question);

      expect(result.answer).toContain('Wire Area');
    });

    it('should provide hydraulic support', () => {
      const question = {
        category: 'hydraulic',
        question: 'How to calculate pipe flow rate?',
        difficulty: 'intermediate' as const,
      };

      const result = chatbots.generateTechnicalSupport(question);

      expect(result.answer).toContain('Flow Rate');
    });

    it('should handle unknown questions', () => {
      const question = {
        category: 'unknown',
        question: 'Unknown question?',
        difficulty: 'beginner' as const,
      };

      const result = chatbots.generateTechnicalSupport(question);

      expect(result.answer).toBeTruthy();
    });
  });

  describe('Automated Reporting', () => {
    it('should generate weekly report', () => {
      const weekData = {
        priceData: [
          {
            materialId: '1',
            materialName: 'Concreto',
            region: 'SP',
            currentPrice: 500,
            historicalPrices: [480, 490, 500],
            suppliers: [{ name: 'S1', price: 480, availability: 100 }],
            trend: 'up' as const,
            volatility: 0.05,
          },
        ],
        projectsCompleted: 5,
        calculationsPerformed: 50,
        topMaterials: ['Concreto', 'Aço', 'Cimento'],
        alerts: ['Preço do aço em alta'],
      };

      const result = chatbots.generateWeeklyReport(weekData);

      expect(result.title).toContain('Relatório');
      expect(result.summary).toContain('5 projetos');
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should include price analysis in report', () => {
      const weekData = {
        priceData: [
          {
            materialId: '1',
            materialName: 'Aço',
            region: 'RJ',
            currentPrice: 1000,
            historicalPrices: [950, 1000, 1000],
            suppliers: [{ name: 'S1', price: 1000, availability: 100 }],
            trend: 'stable' as const,
            volatility: 0.02,
          },
        ],
        projectsCompleted: 3,
        calculationsPerformed: 30,
        topMaterials: ['Aço'],
        alerts: [],
      };

      const result = chatbots.generateWeeklyReport(weekData);

      const priceSection = result.sections.find((s) => s.title === 'Análise de Preços');
      expect(priceSection).toBeTruthy();
      expect(priceSection?.content).toContain('R$');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty market data', () => {
      expect(() => chatbots.analyzePriceMarket([])).toThrow();
    });

    it('should throw error for empty suppliers', () => {
      expect(() =>
        chatbots.recommendSuppliers([], {
          material: 'Concreto',
          quantity: 100,
          urgency: 'high',
          budget: 50000,
        })
      ).toThrow();
    });

    it('should throw error for empty weekly data', () => {
      expect(() => chatbots.generateWeeklyPriceReport([])).toThrow();
    });
  });
});
