/**
 * BUSINESS MODEL SYSTEM
 * Subscription tiers, feature limits, and monetization
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'custom';
  features: {
    maxCalculations: number;
    maxProjects: number;
    maxTeamMembers: number;
    maxStorageGB: number;
    maxApiCallsPerDay: number;
    hasOfflineApp: boolean;
    hasAdvancedAnalytics: boolean;
    hasAiFeatures: boolean;
    hasPrioritySupport: boolean;
    hasCustomIntegrations: boolean;
    hasWhiteLabel: boolean;
    hasDataExport: boolean;
    hasApiAccess: boolean;
    hasWebhooks: boolean;
    maxPartnerConnections: number;
  };
  limits: {
    calculatorsPerMonth: number;
    projectsPerMonth: number;
    apiCallsPerDay: number;
    storageGB: number;
    teamMembers: number;
    concurrentUsers: number;
  };
  support: {
    email: boolean;
    chat: boolean;
    phone: boolean;
    dedicatedAccount: boolean;
    responseTime: string;
  };
}

/**
 * Define subscription plans
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    billingCycle: 'monthly',
    features: {
      maxCalculations: 50,
      maxProjects: 3,
      maxTeamMembers: 1,
      maxStorageGB: 1,
      maxApiCallsPerDay: 100,
      hasOfflineApp: false,
      hasAdvancedAnalytics: false,
      hasAiFeatures: false,
      hasPrioritySupport: false,
      hasCustomIntegrations: false,
      hasWhiteLabel: false,
      hasDataExport: false,
      hasApiAccess: false,
      hasWebhooks: false,
      maxPartnerConnections: 0,
    },
    limits: {
      calculatorsPerMonth: 50,
      projectsPerMonth: 3,
      apiCallsPerDay: 100,
      storageGB: 1,
      teamMembers: 1,
      concurrentUsers: 1,
    },
    support: {
      email: true,
      chat: false,
      phone: false,
      dedicatedAccount: false,
      responseTime: '48 hours',
    },
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 29,
    billingCycle: 'monthly',
    features: {
      maxCalculations: 5000,
      maxProjects: 50,
      maxTeamMembers: 5,
      maxStorageGB: 50,
      maxApiCallsPerDay: 10000,
      hasOfflineApp: true,
      hasAdvancedAnalytics: true,
      hasAiFeatures: true,
      hasPrioritySupport: true,
      hasCustomIntegrations: false,
      hasWhiteLabel: false,
      hasDataExport: true,
      hasApiAccess: true,
      hasWebhooks: false,
      maxPartnerConnections: 5,
    },
    limits: {
      calculatorsPerMonth: 5000,
      projectsPerMonth: 50,
      apiCallsPerDay: 10000,
      storageGB: 50,
      teamMembers: 5,
      concurrentUsers: 3,
    },
    support: {
      email: true,
      chat: true,
      phone: false,
      dedicatedAccount: false,
      responseTime: '24 hours',
    },
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    billingCycle: 'custom',
    features: {
      maxCalculations: 1000000,
      maxProjects: 1000,
      maxTeamMembers: 100,
      maxStorageGB: 1000,
      maxApiCallsPerDay: 1000000,
      hasOfflineApp: true,
      hasAdvancedAnalytics: true,
      hasAiFeatures: true,
      hasPrioritySupport: true,
      hasCustomIntegrations: true,
      hasWhiteLabel: true,
      hasDataExport: true,
      hasApiAccess: true,
      hasWebhooks: true,
      maxPartnerConnections: 100,
    },
    limits: {
      calculatorsPerMonth: 1000000,
      projectsPerMonth: 1000,
      apiCallsPerDay: 1000000,
      storageGB: 1000,
      teamMembers: 100,
      concurrentUsers: 50,
    },
    support: {
      email: true,
      chat: true,
      phone: true,
      dedicatedAccount: true,
      responseTime: '1 hour',
    },
  },
};

/**
 * Check if user can perform an action based on their subscription
 */
export function canPerformAction(
  tier: SubscriptionTier,
  action: string,
  currentUsage: number
): { allowed: boolean; reason?: string; remaining?: number } {
  const plan = SUBSCRIPTION_PLANS[tier];

  const checks: Record<string, () => { allowed: boolean; reason?: string; remaining?: number }> = {
    createCalculation: () => {
      if (currentUsage >= plan.limits.calculatorsPerMonth) {
        return {
          allowed: false,
          reason: `Limite mensal de ${plan.limits.calculatorsPerMonth} cálculos atingido`,
        };
      }
      return { allowed: true, remaining: plan.limits.calculatorsPerMonth - currentUsage };
    },
    createProject: () => {
      if (currentUsage >= plan.limits.projectsPerMonth) {
        return {
          allowed: false,
          reason: `Limite mensal de ${plan.limits.projectsPerMonth} projetos atingido`,
        };
      }
      return { allowed: true, remaining: plan.limits.projectsPerMonth - currentUsage };
    },
    useApiCall: () => {
      if (currentUsage >= plan.limits.apiCallsPerDay) {
        return {
          allowed: false,
          reason: `Limite diário de ${plan.limits.apiCallsPerDay} chamadas de API atingido`,
        };
      }
      return { allowed: true, remaining: plan.limits.apiCallsPerDay - currentUsage };
    },
    accessOfflineApp: () => {
      return {
        allowed: plan.features.hasOfflineApp,
        reason: plan.features.hasOfflineApp ? undefined : 'Recurso não disponível neste plano',
      };
    },
    accessAdvancedAnalytics: () => {
      return {
        allowed: plan.features.hasAdvancedAnalytics,
        reason: plan.features.hasAdvancedAnalytics ? undefined : 'Recurso não disponível neste plano',
      };
    },
    accessAiFeatures: () => {
      return {
        allowed: plan.features.hasAiFeatures,
        reason: plan.features.hasAiFeatures ? undefined : 'Recurso não disponível neste plano',
      };
    },
  };

  return checks[action]?.() || { allowed: false, reason: 'Ação desconhecida' };
}

/**
 * Calculate upgrade recommendation
 */
export function recommendUpgrade(
  currentTier: SubscriptionTier,
  usage: {
    calculationsPerMonth: number;
    projectsPerMonth: number;
    apiCallsPerDay: number;
    teamMembers: number;
  }
): { recommended: boolean; suggestedTier?: SubscriptionTier; reason?: string } {
  const currentPlan = SUBSCRIPTION_PLANS[currentTier];

  const utilizationRate = {
    calculations: usage.calculationsPerMonth / currentPlan.limits.calculatorsPerMonth,
    projects: usage.projectsPerMonth / currentPlan.limits.projectsPerMonth,
    apiCalls: usage.apiCallsPerDay / currentPlan.limits.apiCallsPerDay,
    teamMembers: usage.teamMembers / currentPlan.limits.teamMembers,
  };

  const avgUtilization =
    (utilizationRate.calculations +
      utilizationRate.projects +
      utilizationRate.apiCalls +
      utilizationRate.teamMembers) /
    4;

  if (avgUtilization > 0.8) {
    if (currentTier === 'free') {
      return {
        recommended: true,
        suggestedTier: 'pro',
        reason: 'Você está usando 80%+ dos seus limites. Considere fazer upgrade para Pro',
      };
    } else if (currentTier === 'pro') {
      return {
        recommended: true,
        suggestedTier: 'enterprise',
        reason: 'Você está usando 80%+ dos seus limites. Considere fazer upgrade para Enterprise',
      };
    }
  }

  return { recommended: false };
}

/**
 * Calculate billing for a subscription period
 */
export function calculateBilling(
  tier: SubscriptionTier,
  months: number,
  additionalCharges: number = 0
): {
  baseCost: number;
  additionalCost: number;
  totalCost: number;
  breakdown: string;
} {
  const plan = SUBSCRIPTION_PLANS[tier];
  const baseCost = plan.price * months;
  const totalCost = baseCost + additionalCharges;

  const breakdown =
    tier === 'free'
      ? 'Plano gratuito'
      : `${months} mês(es) × R$ ${plan.price} + R$ ${additionalCharges} em cobranças adicionais`;

  return {
    baseCost,
    additionalCost: additionalCharges,
    totalCost,
    breakdown,
  };
}

/**
 * Generate usage report
 */
export function generateUsageReport(
  tier: SubscriptionTier,
  usage: {
    calculationsPerMonth: number;
    projectsPerMonth: number;
    apiCallsPerDay: number;
    storageUsedGB: number;
    teamMembers: number;
  }
): {
  tier: string;
  utilizationPercentage: number;
  metrics: Array<{
    name: string;
    used: number;
    limit: number;
    percentage: number;
  }>;
  warnings: string[];
  recommendations: string[];
} {
  const plan = SUBSCRIPTION_PLANS[tier];

  const metrics = [
    {
      name: 'Cálculos/Mês',
      used: usage.calculationsPerMonth,
      limit: plan.limits.calculatorsPerMonth,
      percentage: (usage.calculationsPerMonth / plan.limits.calculatorsPerMonth) * 100,
    },
    {
      name: 'Projetos/Mês',
      used: usage.projectsPerMonth,
      limit: plan.limits.projectsPerMonth,
      percentage: (usage.projectsPerMonth / plan.limits.projectsPerMonth) * 100,
    },
    {
      name: 'Chamadas API/Dia',
      used: usage.apiCallsPerDay,
      limit: plan.limits.apiCallsPerDay,
      percentage: (usage.apiCallsPerDay / plan.limits.apiCallsPerDay) * 100,
    },
    {
      name: 'Armazenamento (GB)',
      used: usage.storageUsedGB,
      limit: plan.limits.storageGB,
      percentage: (usage.storageUsedGB / plan.limits.storageGB) * 100,
    },
    {
      name: 'Membros da Equipe',
      used: usage.teamMembers,
      limit: plan.limits.teamMembers,
      percentage: (usage.teamMembers / plan.limits.teamMembers) * 100,
    },
  ];

  const avgUtilization = metrics.reduce((sum, m) => sum + m.percentage, 0) / metrics.length;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  metrics.forEach((m) => {
    if (m.percentage > 90) {
      warnings.push(`⚠️ ${m.name}: ${m.percentage.toFixed(0)}% utilizado`);
    } else if (m.percentage > 70) {
      recommendations.push(`📊 ${m.name}: ${m.percentage.toFixed(0)}% utilizado`);
    }
  });

  return {
    tier: plan.name,
    utilizationPercentage: Math.round(avgUtilization),
    metrics,
    warnings,
    recommendations,
  };
}

export default {
  SUBSCRIPTION_PLANS,
  canPerformAction,
  recommendUpgrade,
  calculateBilling,
  generateUsageReport,
};
