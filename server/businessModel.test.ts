import { describe, it, expect } from 'vitest';
import * as bm from './businessModel';

describe('BUSINESS MODEL: Subscription & Billing', () => {
  describe('Subscription Plans', () => {
    it('should have three subscription tiers', () => {
      expect(Object.keys(bm.SUBSCRIPTION_PLANS)).toHaveLength(3);
      expect(bm.SUBSCRIPTION_PLANS.free).toBeDefined();
      expect(bm.SUBSCRIPTION_PLANS.pro).toBeDefined();
      expect(bm.SUBSCRIPTION_PLANS.enterprise).toBeDefined();
    });

    it('should have free plan with no cost', () => {
      const freePlan = bm.SUBSCRIPTION_PLANS.free;
      expect(freePlan.price).toBe(0);
      expect(freePlan.limits.calculatorsPerMonth).toBe(50);
      expect(freePlan.limits.projectsPerMonth).toBe(3);
    });

    it('should have pro plan with monthly cost', () => {
      const proPlan = bm.SUBSCRIPTION_PLANS.pro;
      expect(proPlan.price).toBe(29);
      expect(proPlan.limits.calculatorsPerMonth).toBe(5000);
      expect(proPlan.limits.projectsPerMonth).toBe(50);
      expect(proPlan.features.hasOfflineApp).toBe(true);
      expect(proPlan.features.hasAiFeatures).toBe(true);
    });

    it('should have enterprise plan with unlimited features', () => {
      const enterprisePlan = bm.SUBSCRIPTION_PLANS.enterprise;
      expect(enterprisePlan.limits.calculatorsPerMonth).toBe(1000000);
      expect(enterprisePlan.limits.projectsPerMonth).toBe(1000);
      expect(enterprisePlan.features.hasWhiteLabel).toBe(true);
      expect(enterprisePlan.features.hasCustomIntegrations).toBe(true);
    });
  });

  describe('Feature Access Control', () => {
    it('should allow free tier to create calculation within limit', () => {
      const result = bm.canPerformAction('free', 'createCalculation', 10);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(40);
    });

    it('should deny free tier when calculation limit exceeded', () => {
      const result = bm.canPerformAction('free', 'createCalculation', 50);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Limite mensal');
    });

    it('should allow pro tier to create projects', () => {
      const result = bm.canPerformAction('pro', 'createProject', 25);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(25);
    });

    it('should deny free tier access to offline app', () => {
      const result = bm.canPerformAction('free', 'accessOfflineApp', 0);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('não disponível');
    });

    it('should allow pro tier access to AI features', () => {
      const result = bm.canPerformAction('pro', 'accessAiFeatures', 0);
      expect(result.allowed).toBe(true);
    });

    it('should allow enterprise tier access to all features', () => {
      const offlineResult = bm.canPerformAction('enterprise', 'accessOfflineApp', 0);
      const aiResult = bm.canPerformAction('enterprise', 'accessAiFeatures', 0);
      const analyticsResult = bm.canPerformAction('enterprise', 'accessAdvancedAnalytics', 0);

      expect(offlineResult.allowed).toBe(true);
      expect(aiResult.allowed).toBe(true);
      expect(analyticsResult.allowed).toBe(true);
    });
  });

  describe('Upgrade Recommendations', () => {
    it('should recommend upgrade from free to pro', () => {
      const result = bm.recommendUpgrade('free', {
        calculationsPerMonth: 45,
        projectsPerMonth: 3,
        apiCallsPerDay: 80,
        teamMembers: 1,
      });

      expect(result.recommended).toBe(true);
      expect(result.suggestedTier).toBe('pro');
    });

    it('should recommend upgrade from pro to enterprise', () => {
      const result = bm.recommendUpgrade('pro', {
        calculationsPerMonth: 4500,
        projectsPerMonth: 45,
        apiCallsPerDay: 9000,
        teamMembers: 5,
      });

      expect(result.recommended).toBe(true);
      expect(result.suggestedTier).toBe('enterprise');
    });

    it('should not recommend upgrade if usage is low', () => {
      const result = bm.recommendUpgrade('free', {
        calculationsPerMonth: 10,
        projectsPerMonth: 1,
        apiCallsPerDay: 20,
        teamMembers: 1,
      });

      expect(result.recommended).toBe(false);
    });
  });

  describe('Billing Calculations', () => {
    it('should calculate free plan billing', () => {
      const result = bm.calculateBilling('free', 1);
      expect(result.baseCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('should calculate pro plan monthly billing', () => {
      const result = bm.calculateBilling('pro', 1);
      expect(result.baseCost).toBe(29);
      expect(result.totalCost).toBe(29);
    });

    it('should calculate pro plan annual billing', () => {
      const result = bm.calculateBilling('pro', 12);
      expect(result.baseCost).toBe(348);
      expect(result.totalCost).toBe(348);
    });

    it('should include additional charges in billing', () => {
      const result = bm.calculateBilling('pro', 1, 50);
      expect(result.baseCost).toBe(29);
      expect(result.additionalCost).toBe(50);
      expect(result.totalCost).toBe(79);
    });
  });

  describe('Usage Reports', () => {
    it('should generate usage report for free tier', () => {
      const result = bm.generateUsageReport('free', {
        calculationsPerMonth: 25,
        projectsPerMonth: 2,
        apiCallsPerDay: 50,
        storageUsedGB: 0.5,
        teamMembers: 1,
      });

      expect(result.tier).toBe('Free');
      expect(result.metrics.length).toBe(5);
      expect(result.utilizationPercentage).toBeGreaterThan(0);
    });

    it('should identify high utilization metrics', () => {
      const result = bm.generateUsageReport('free', {
        calculationsPerMonth: 48,
        projectsPerMonth: 3,
        apiCallsPerDay: 95,
        storageUsedGB: 0.95,
        teamMembers: 1,
      });

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should provide recommendations for optimization', () => {
      const result = bm.generateUsageReport('pro', {
        calculationsPerMonth: 4000,
        projectsPerMonth: 40,
        apiCallsPerDay: 8000,
        storageUsedGB: 40,
        teamMembers: 4,
      });

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate average utilization percentage', () => {
      const result = bm.generateUsageReport('pro', {
        calculationsPerMonth: 2500,
        projectsPerMonth: 25,
        apiCallsPerDay: 5000,
        storageUsedGB: 25,
        teamMembers: 2,
      });

      expect(result.utilizationPercentage).toBeCloseTo(50, 0);
    });
  });

  describe('Feature Limits', () => {
    it('free tier should have basic features', () => {
      const freePlan = bm.SUBSCRIPTION_PLANS.free;
      expect(freePlan.features.hasOfflineApp).toBe(false);
      expect(freePlan.features.hasAiFeatures).toBe(false);
      expect(freePlan.features.hasApiAccess).toBe(false);
      expect(freePlan.features.hasWebhooks).toBe(false);
    });

    it('pro tier should have advanced features', () => {
      const proPlan = bm.SUBSCRIPTION_PLANS.pro;
      expect(proPlan.features.hasOfflineApp).toBe(true);
      expect(proPlan.features.hasAiFeatures).toBe(true);
      expect(proPlan.features.hasApiAccess).toBe(true);
      expect(proPlan.features.hasWebhooks).toBe(false);
    });

    it('enterprise tier should have all features', () => {
      const enterprisePlan = bm.SUBSCRIPTION_PLANS.enterprise;
      expect(enterprisePlan.features.hasOfflineApp).toBe(true);
      expect(enterprisePlan.features.hasAiFeatures).toBe(true);
      expect(enterprisePlan.features.hasApiAccess).toBe(true);
      expect(enterprisePlan.features.hasWebhooks).toBe(true);
      expect(enterprisePlan.features.hasWhiteLabel).toBe(true);
      expect(enterprisePlan.features.hasCustomIntegrations).toBe(true);
    });
  });

  describe('Support Levels', () => {
    it('free tier should have email support only', () => {
      const freePlan = bm.SUBSCRIPTION_PLANS.free;
      expect(freePlan.support.email).toBe(true);
      expect(freePlan.support.chat).toBe(false);
      expect(freePlan.support.phone).toBe(false);
      expect(freePlan.support.dedicatedAccount).toBe(false);
    });

    it('pro tier should have email and chat support', () => {
      const proPlan = bm.SUBSCRIPTION_PLANS.pro;
      expect(proPlan.support.email).toBe(true);
      expect(proPlan.support.chat).toBe(true);
      expect(proPlan.support.phone).toBe(false);
      expect(proPlan.support.dedicatedAccount).toBe(false);
    });

    it('enterprise tier should have full support', () => {
      const enterprisePlan = bm.SUBSCRIPTION_PLANS.enterprise;
      expect(enterprisePlan.support.email).toBe(true);
      expect(enterprisePlan.support.chat).toBe(true);
      expect(enterprisePlan.support.phone).toBe(true);
      expect(enterprisePlan.support.dedicatedAccount).toBe(true);
    });
  });
});
