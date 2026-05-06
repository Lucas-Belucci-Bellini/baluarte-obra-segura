/**
 * CHATBOTS & AI SYSTEM
 * Market analysis, price tracking, recommendations, and automated reporting
 */

// ==================== MARKET PRICE BOT ====================

export interface MarketData {
  materialId: string;
  materialName: string;
  region: string;
  currentPrice: number;
  historicalPrices: number[];
  suppliers: Array<{ name: string; price: number; availability: number }>;
  trend: 'up' | 'down' | 'stable';
  volatility: number;
}

/**
 * Analyze market prices and generate insights
 */
export function analyzePriceMarket(marketData: MarketData[]): {
  averagePrice: number;
  priceRange: { min: number; max: number };
  bestDeals: Array<{ material: string; supplier: string; price: number; savings: number }>;
  riskingMaterials: string[];
  recommendations: string[];
} {
  if (marketData.length === 0) {
    throw new Error('No market data provided');
  }

  const allPrices = marketData.flatMap((m) => m.currentPrice);
  const averagePrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;

  const bestDeals = marketData
    .flatMap((m) =>
      m.suppliers.map((s) => ({
        material: m.materialName,
        supplier: s.name,
        price: s.price,
        savings: m.currentPrice - s.price,
      }))
    )
    .filter((d) => d.savings > 0)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);

  const riskingMaterials = marketData
    .filter((m) => m.trend === 'up' && m.volatility > 0.15)
    .map((m) => m.materialName);

  const recommendations: string[] = [];
  if (riskingMaterials.length > 0) {
    recommendations.push(`⚠️ Preços em alta: ${riskingMaterials.join(', ')}`);
  }

  const stableMaterials = marketData.filter((m) => m.trend === 'stable').length;
  if (stableMaterials > 0) {
    recommendations.push(`✅ ${stableMaterials} materiais com preços estáveis`);
  }

  return {
    averagePrice: Math.round(averagePrice * 100) / 100,
    priceRange: {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices),
    },
    bestDeals,
    riskingMaterials,
    recommendations,
  };
}

/**
 * Generate weekly price report
 */
export function generateWeeklyPriceReport(
  weeklyData: Array<{ date: string; prices: MarketData[] }>
): {
  weekStart: string;
  weekEnd: string;
  averagePriceChange: number;
  topGainers: Array<{ material: string; change: number }>;
  topLosers: Array<{ material: string; change: number }>;
  summary: string;
} {
  if (weeklyData.length === 0) {
    throw new Error('No weekly data provided');
  }

  const firstDay = weeklyData[0];
  const lastDay = weeklyData[weeklyData.length - 1];

  const priceChanges: Record<string, number> = {};

  firstDay.prices.forEach((p) => {
    const lastPrice = lastDay.prices.find((lp) => lp.materialId === p.materialId);
    if (lastPrice) {
      const change = ((lastPrice.currentPrice - p.currentPrice) / p.currentPrice) * 100;
      priceChanges[p.materialName] = change;
    }
  });

  const sorted = Object.entries(priceChanges)
    .map(([material, change]) => ({ material, change }))
    .sort((a, b) => b.change - a.change);

  const topGainers = sorted.slice(0, 3);
  const topLosers = sorted.slice(-3).reverse();

  const averagePriceChange =
    Object.values(priceChanges).reduce((a, b) => a + b, 0) / Object.values(priceChanges).length;

  const summary =
    averagePriceChange > 0
      ? `Preços em alta na semana (+${averagePriceChange.toFixed(2)}%)`
      : `Preços em queda na semana (${averagePriceChange.toFixed(2)}%)`;

  return {
    weekStart: firstDay.date,
    weekEnd: lastDay.date,
    averagePriceChange: Math.round(averagePriceChange * 100) / 100,
    topGainers,
    topLosers,
    summary,
  };
}

// ==================== SUPPLIER RECOMMENDATION BOT ====================

export interface Supplier {
  id: string;
  name: string;
  region: string;
  rating: number;
  deliveryTime: number;
  reliability: number;
  priceCompetitiveness: number;
  specialties: string[];
}

/**
 * Recommend best suppliers based on criteria
 */
export function recommendSuppliers(
  suppliers: Supplier[],
  requirements: {
    material: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high';
    budget: number;
    region?: string;
  }
): Array<{
  supplier: string;
  score: number;
  reasoning: string[];
  estimatedPrice: number;
  deliveryDays: number;
}> {
  if (suppliers.length === 0) {
    throw new Error('No suppliers available');
  }

  const filtered = requirements.region
    ? suppliers.filter((s) => s.region === requirements.region)
    : suppliers;

  const scored = filtered.map((s) => {
    let score = 0;
    const reasoning: string[] = [];

    // Rating score
    score += s.rating * 15;
    if (s.rating >= 4.5) reasoning.push('Excelente avaliação');

    // Delivery time score
    if (requirements.urgency === 'high') {
      score += Math.max(0, 20 - s.deliveryTime);
      if (s.deliveryTime <= 3) reasoning.push('Entrega rápida');
    } else {
      score += 10;
    }

    // Reliability score
    score += s.reliability * 15;
    if (s.reliability >= 0.95) reasoning.push('Altamente confiável');

    // Price competitiveness
    score += s.priceCompetitiveness * 20;
    if (s.priceCompetitiveness >= 0.8) reasoning.push('Preço competitivo');

    // Specialty match
    if (s.specialties.includes(requirements.material)) {
      score += 20;
      reasoning.push(`Especialista em ${requirements.material}`);
    }

    const estimatedPrice = (requirements.budget * (1 - s.priceCompetitiveness * 0.2)) * (requirements.quantity / 100);

    return {
      supplier: s.name,
      score: Math.min(100, score),
      reasoning,
      estimatedPrice: Math.round(estimatedPrice),
      deliveryDays: s.deliveryTime,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

// ==================== TECHNICAL SUPPORT BOT ====================

export interface TechnicalQuestion {
  category: string;
  question: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Generate technical support response
 */
export function generateTechnicalSupport(
  question: TechnicalQuestion
): {
  answer: string;
  relatedTopics: string[];
  resources: string[];
  nextSteps: string[];
} {
  const answers: Record<string, Record<string, string>> = {
    concrete: {
      'How to calculate concrete volume?':
        'Use the formula: Volume = Length × Width × Height. For cylindrical shapes: Volume = π × r² × h',
      'What is concrete curing time?':
        'Standard concrete cures for 28 days to reach full strength. Initial set occurs in 24-48 hours.',
      'How to prevent concrete cracking?':
        'Use proper water-cement ratio, ensure adequate curing, control temperature, and use reinforcement.',
    },
    electrical: {
      'How to select wire gauge?':
        'Use the formula: Wire Area = (2 × Load × Length) / (Voltage Drop × Conductivity)',
      'What is voltage drop?':
        'Voltage drop is the reduction in voltage as current flows through a conductor. Keep it below 3% for branch circuits.',
      'How to calculate circuit breaker size?':
        'Circuit breaker = (Wire ampacity × 1.25) for continuous loads, or wire ampacity for non-continuous loads.',
    },
    hydraulic: {
      'How to calculate pipe flow rate?':
        'Flow Rate = Velocity × Cross-sectional Area. For pipes: Q = π × r² × v',
      'What is pressure drop?':
        'Pressure drop = (Friction factor × Length × Velocity²) / (2 × Diameter)',
      'How to size a hydraulic pump?':
        'Pump size = (Flow rate × Pressure) / Efficiency. Ensure pump can handle maximum pressure.',
    },
  };

  const categoryAnswers = answers[question.category.toLowerCase()] || {};
  const answer = categoryAnswers[question.question] || 'Consulte a documentação técnica ou entre em contato com suporte.';

  const relatedTopics = ['Cálculos relacionados', 'Normas técnicas', 'Boas práticas'];
  const resources = ['Manual técnico', 'Vídeo tutorial', 'Documentação NBR'];
  const nextSteps = ['Aplicar o conhecimento', 'Fazer cálculos práticos', 'Consultar especialista se necessário'];

  return {
    answer,
    relatedTopics,
    resources,
    nextSteps,
  };
}

// ==================== AUTOMATED REPORTING ====================

/**
 * Generate comprehensive weekly report
 */
export function generateWeeklyReport(
  weekData: {
    priceData: MarketData[];
    projectsCompleted: number;
    calculationsPerformed: number;
    topMaterials: string[];
    alerts: string[];
  }
): {
  title: string;
  summary: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  recommendations: string[];
  nextWeekFocus: string[];
} {
  const priceAnalysis = analyzePriceMarket(weekData.priceData);

  return {
    title: `Relatório Semanal - ${new Date().toLocaleDateString('pt-BR')}`,
    summary: `Esta semana: ${weekData.projectsCompleted} projetos concluídos, ${weekData.calculationsPerformed} cálculos realizados`,
    sections: [
      {
        title: 'Análise de Preços',
        content: `Preço médio: R$ ${priceAnalysis.averagePrice}. Variação: R$ ${priceAnalysis.priceRange.min} - R$ ${priceAnalysis.priceRange.max}`,
      },
      {
        title: 'Materiais Mais Utilizados',
        content: weekData.topMaterials.join(', '),
      },
      {
        title: 'Alertas',
        content: weekData.alerts.join('; ') || 'Nenhum alerta crítico',
      },
    ],
    recommendations: priceAnalysis.recommendations,
    nextWeekFocus: [
      'Monitorar materiais em alta',
      'Aproveitar oportunidades de economia',
      'Revisar fornecedores',
    ],
  };
}

export default {
  analyzePriceMarket,
  generateWeeklyPriceReport,
  recommendSuppliers,
  generateTechnicalSupport,
  generateWeeklyReport,
};
