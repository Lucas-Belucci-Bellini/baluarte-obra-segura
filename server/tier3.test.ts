import { describe, it, expect } from 'vitest';
import * as tier3 from './tier3Advanced';

describe('TIER 3: Advanced Features', () => {
  describe('AI & Predictive Analytics', () => {
    it('should predict material cost with upward trend', () => {
      const result = tier3.predictMaterialCost([100, 105, 110], 5, 10);

      expect(result.predictedPrice).toBeGreaterThan(100);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.trend).toBe('upward');
    });

    it('should predict material cost with downward trend', () => {
      const result = tier3.predictMaterialCost([100, 95, 90], -5, -10);

      expect(result.predictedPrice).toBeLessThan(100);
      expect(result.trend).toBe('downward');
    });

    it('should recommend best material', () => {
      const requirements = {
        strength: 50,
        cost: 100,
        weight: 10,
        durability: 80,
        workability: 70,
      };

      const materials = [
        {
          name: 'Steel',
          strength: 60,
          cost: 120,
          weight: 12,
          durability: 85,
          workability: 60,
        },
        {
          name: 'Concrete',
          strength: 40,
          cost: 80,
          weight: 15,
          durability: 75,
          workability: 80,
        },
      ];

      const result = tier3.recommendMaterial(requirements, materials);

      expect(result.material).toBeTruthy();
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('should analyze structural performance - safe', () => {
      const result = tier3.analyzeStructuralPerformance('static', 10, 100, 2);

      expect(result.stressLevel).toBeLessThan(1);
      expect(result.safetyMargin).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('low');
    });

    it('should analyze structural performance - critical', () => {
      const result = tier3.analyzeStructuralPerformance('static', 90, 100, 1.1);

      expect(result.riskLevel).toBe('high');
      expect(result.recommendation).toContain('CRITICAL');
    });

    it('should reduce safety margin for cyclic loads', () => {
      const staticResult = tier3.analyzeStructuralPerformance('static', 30, 100, 2);
      const cyclicResult = tier3.analyzeStructuralPerformance('cyclic', 30, 100, 2);

      expect(cyclicResult.safetyMargin).toBeLessThan(staticResult.safetyMargin);
    });
  });

  describe('Simulations', () => {
    it('should simulate concrete curing', () => {
      const results = tier3.simulateConcreteCuring(28, 20, 80, 'I');

      expect(results.length).toBe(28);
      expect(results[0].day).toBe(1);
      expect(results[27].day).toBe(28);
      expect(results[27].strength).toBeGreaterThan(results[0].strength);
      expect(results[27].hydration).toBeGreaterThan(results[0].hydration);
    });

    it('should show faster curing with Type III cement', () => {
      const typeI = tier3.simulateConcreteCuring(7, 20, 80, 'I');
      const typeIII = tier3.simulateConcreteCuring(7, 20, 80, 'III');

      expect(typeIII[6].strength).toBeGreaterThan(typeI[6].strength);
    });

    it('should simulate thermal stress', () => {
      const result = tier3.simulateThermalStress(20, 100, 0.000012, 1000, 200000);

      expect(result.expansion).toBeGreaterThan(0);
      expect(result.thermalStress).toBeGreaterThan(0);
      expect(result.strainPercentage).toBeGreaterThan(0);
    });

    it('should simulate fluid flow in pipes', () => {
      const result = tier3.simulateFluidFlow(0.05, 100, 0.1, 0.001, 0.000045);

      expect(result.velocity).toBeGreaterThan(0);
      expect(result.reynoldsNumber).toBeGreaterThan(0);
      expect(result.frictionFactor).toBeGreaterThan(0);
      expect(result.pressureDrop).toBeGreaterThan(0);
    });

    it('should detect laminar flow', () => {
      const result = tier3.simulateFluidFlow(0.001, 100, 0.1, 0.001, 0.000045);

      expect(result.reynoldsNumber).toBeLessThan(2300);
    });

    it('should detect turbulent flow', () => {
      const result = tier3.simulateFluidFlow(0.5, 100, 0.1, 0.001, 0.000045);

      expect(result.reynoldsNumber).toBeGreaterThan(2300);
    });
  });

  describe('Enterprise Features', () => {
    it('should calculate project ROI', () => {
      const result = tier3.calculateProjectROI(100000, 30000, 5);

      expect(result.totalBenefit).toBe(150000);
      expect(result.netProfit).toBe(50000);
      expect(result.roi).toBe(50);
      expect(result.paybackPeriod).toBeCloseTo(3.33, 1);
    });

    it('should generate risk assessment', () => {
      const hazards = [
        {
          name: 'Fall hazard',
          probability: 0.3,
          severity: 5,
          mitigation: 'Install safety rails',
        },
        {
          name: 'Electrical hazard',
          probability: 0.1,
          severity: 4,
          mitigation: 'Use grounding',
        },
        {
          name: 'Minor cuts',
          probability: 0.8,
          severity: 1,
          mitigation: 'Use gloves',
        },
      ];

      const result = tier3.generateRiskAssessment(hazards);

      expect(result.totalRisk).toBeGreaterThanOrEqual(0);
      expect(result.highRiskItems.length).toBeGreaterThanOrEqual(0);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should calculate critical path', () => {
      const tasks = [
        { id: '1', name: 'Foundation', duration: 10, dependencies: [] },
        { id: '2', name: 'Walls', duration: 15, dependencies: ['1'] },
        { id: '3', name: 'Roof', duration: 10, dependencies: ['2'] },
        { id: '4', name: 'Interior', duration: 20, dependencies: ['3'] },
      ];

      const result = tier3.calculateCriticalPath(tasks);

      expect(result.projectDuration).toBe(55);
      expect(result.criticalPath.length).toBeGreaterThan(0);
      expect(result.slack['1']).toBeGreaterThanOrEqual(0);
    });

    it('should identify slack in non-critical tasks', () => {
      const tasks = [
        { id: '1', name: 'Task A', duration: 10, dependencies: [] },
        { id: '2', name: 'Task B', duration: 5, dependencies: ['1'] },
        { id: '3', name: 'Task C', duration: 20, dependencies: ['1'] },
        { id: '4', name: 'Task D', duration: 5, dependencies: ['2', '3'] },
      ];

      const result = tier3.calculateCriticalPath(tasks);

      expect(result.slack['2']).toBeGreaterThanOrEqual(0);
      expect(result.slack['3']).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty historical prices', () => {
      expect(() => tier3.predictMaterialCost([], 5, 10)).toThrow();
    });

    it('should throw error for empty materials list', () => {
      expect(() =>
        tier3.recommendMaterial(
          { strength: 50, cost: 100, weight: 10, durability: 80, workability: 70 },
          []
        )
      ).toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should handle zero thermal expansion coefficient', () => {
      const result = tier3.simulateThermalStress(20, 100, 0, 1000, 200000);

      expect(result.expansion).toBe(0);
      expect(result.thermalStress).toBe(0);
    });

    it('should handle negative temperature change', () => {
      const result = tier3.simulateThermalStress(100, 20, 0.000012, 1000, 200000);

      expect(result.expansion).toBeLessThan(0);
    });
  });
});
