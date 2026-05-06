/**
 * TIER 3: ADVANCED FEATURES (150+ Functions)
 * AI, Machine Learning, Simulations, and Enterprise Features
 */

// ==================== AI & PREDICTIVE ANALYTICS ====================

/**
 * Predict material costs based on historical data
 */
export function predictMaterialCost(
  historicalPrices: number[],
  marketTrend: number,
  demandIndex: number
): { predictedPrice: number; confidence: number; trend: string } {
  if (historicalPrices.length === 0) {
    throw new Error('Historical prices required');
  }

  const avgPrice = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
  const volatility = Math.sqrt(
    historicalPrices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) /
      historicalPrices.length
  );

  const trendFactor = 1 + marketTrend / 100;
  const demandFactor = 1 + demandIndex / 100;
  const predictedPrice = avgPrice * trendFactor * demandFactor;

  const confidence = Math.max(0, Math.min(100, 100 - volatility * 10));
  const trend = marketTrend > 0 ? 'upward' : marketTrend < 0 ? 'downward' : 'stable';

  return {
    predictedPrice: Math.round(predictedPrice * 100) / 100,
    confidence: Math.round(confidence),
    trend,
  };
}

/**
 * Recommend optimal material based on requirements
 */
export function recommendMaterial(
  requirements: {
    strength: number;
    cost: number;
    weight: number;
    durability: number;
    workability: number;
  },
  availableMaterials: Array<{
    name: string;
    strength: number;
    cost: number;
    weight: number;
    durability: number;
    workability: number;
  }>
): { material: string; score: number; reasoning: string[] } {
  if (availableMaterials.length === 0) {
    throw new Error('No materials available');
  }

  const scores = availableMaterials.map((material) => {
    const strengthScore = (material.strength / requirements.strength) * 25;
    const costScore = (requirements.cost / material.cost) * 25;
    const weightScore = (requirements.weight / material.weight) * 15;
    const durabilityScore = (material.durability / requirements.durability) * 20;
    const workabilityScore = (material.workability / requirements.workability) * 15;

    const totalScore = Math.min(100, strengthScore + costScore + weightScore + durabilityScore + workabilityScore);

    return {
      name: material.name,
      score: Math.round(totalScore),
      strengthScore,
      costScore,
      weightScore,
      durabilityScore,
      workabilityScore,
    };
  });

  const best = scores.reduce((prev, current) => (prev.score > current.score ? prev : current));

  const reasoning: string[] = [];
  if (best.strengthScore > 20) reasoning.push('Excellent strength properties');
  if (best.costScore > 20) reasoning.push('Good cost efficiency');
  if (best.weightScore > 10) reasoning.push('Optimal weight');
  if (best.durabilityScore > 15) reasoning.push('High durability');
  if (best.workabilityScore > 10) reasoning.push('Easy to work with');

  return {
    material: best.name,
    score: best.score,
    reasoning,
  };
}

/**
 * Analyze structural performance under load
 */
export function analyzeStructuralPerformance(
  loadType: 'static' | 'dynamic' | 'cyclic',
  appliedLoad: number,
  materialStrength: number,
  safetyFactor: number
): {
  stressLevel: number;
  safetyMargin: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
} {
  const stress = appliedLoad / materialStrength;
  const allowableStress = 1 / safetyFactor;
  let safetyMargin = ((allowableStress - stress) / allowableStress) * 100;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let recommendation = 'Structure is safe';

  if (safetyMargin < 10) {
    riskLevel = 'high';
    recommendation = 'CRITICAL: Immediate reinforcement required';
  } else if (safetyMargin < 25) {
    riskLevel = 'medium';
    recommendation = 'Consider reinforcement or load reduction';
  }

  if (loadType === 'cyclic') {
    safetyMargin *= 0.8; // Reduce margin for cyclic loads
    if (safetyMargin < 20) riskLevel = 'high';
  }

  return {
    stressLevel: Math.round(stress * 100) / 100,
    safetyMargin: Math.round(safetyMargin),
    riskLevel,
    recommendation,
  };
}

// ==================== SIMULATION ENGINES ====================

/**
 * Simulate concrete curing process
 */
export function simulateConcreteCuring(
  daysToSimulate: number,
  temperature: number,
  humidity: number,
  cementType: 'I' | 'II' | 'III' | 'IV' | 'V'
): Array<{ day: number; strength: number; hydration: number }> {
  const results = [];
  const cementFactors: Record<string, number> = {
    'I': 1.0,
    'II': 0.95,
    'III': 1.15,
    'IV': 0.85,
    'V': 0.9,
  };

  const factor = cementFactors[cementType];
  const tempFactor = Math.max(0.5, Math.min(1.5, temperature / 20));
  const humidityFactor = humidity / 100;

  for (let day = 1; day <= daysToSimulate; day++) {
    const hydration = Math.min(100, (day / 28) * 100 * factor * tempFactor * humidityFactor);
    const strength = 35 * (hydration / 100) * (hydration / 100);

    results.push({
      day,
      strength: Math.round(strength * 100) / 100,
      hydration: Math.round(hydration),
    });
  }

  return results;
}

/**
 * Simulate thermal stress in materials
 */
export function simulateThermalStress(
  initialTemp: number,
  finalTemp: number,
  thermalExpansionCoeff: number,
  materialLength: number,
  elasticModulus: number
): {
  expansion: number;
  thermalStress: number;
  strainPercentage: number;
} {
  const tempChange = finalTemp - initialTemp;
  const expansion = materialLength * thermalExpansionCoeff * tempChange;
  const strain = thermalExpansionCoeff * tempChange;
  const thermalStress = strain * elasticModulus;

  return {
    expansion: Math.round(expansion * 10000) / 10000,
    thermalStress: Math.round(thermalStress),
    strainPercentage: Math.round(strain * 100 * 10000) / 10000,
  };
}

/**
 * Simulate fluid flow in pipes
 */
export function simulateFluidFlow(
  flowRate: number,
  pipeLength: number,
  pipeDiameter: number,
  fluidViscosity: number,
  roughness: number
): {
  velocity: number;
  reynoldsNumber: number;
  frictionFactor: number;
  pressureDrop: number;
} {
  const pipeArea = Math.PI * (pipeDiameter / 2) ** 2;
  const velocity = flowRate / pipeArea;
  const reynoldsNumber = (1000 * velocity * pipeDiameter) / fluidViscosity;

  let frictionFactor: number;
  if (reynoldsNumber < 2300) {
    // Laminar flow
    frictionFactor = 64 / reynoldsNumber;
  } else {
    // Turbulent flow (Colebrook-White equation approximation)
    frictionFactor = 0.25 / Math.pow(Math.log10(roughness / (3.7 * pipeDiameter) + 5.74 / Math.pow(reynoldsNumber, 0.9)), 2);
  }

  const pressureDrop = (frictionFactor * pipeLength * 1000 * velocity ** 2) / (2 * pipeDiameter);

  return {
    velocity: Math.round(velocity * 100) / 100,
    reynoldsNumber: Math.round(reynoldsNumber),
    frictionFactor: Math.round(frictionFactor * 10000) / 10000,
    pressureDrop: Math.round(pressureDrop),
  };
}

// ==================== ENTERPRISE FEATURES ====================

/**
 * Calculate project ROI
 */
export function calculateProjectROI(
  initialInvestment: number,
  annualBenefit: number,
  projectYears: number
): {
  totalBenefit: number;
  netProfit: number;
  roi: number;
  paybackPeriod: number;
  irr: number;
} {
  const totalBenefit = annualBenefit * projectYears;
  const netProfit = totalBenefit - initialInvestment;
  const roi = (netProfit / initialInvestment) * 100;
  const paybackPeriod = initialInvestment / annualBenefit;

  // Simple IRR approximation
  const irr = (netProfit / (initialInvestment * projectYears)) * 100;

  return {
    totalBenefit: Math.round(totalBenefit),
    netProfit: Math.round(netProfit),
    roi: Math.round(roi * 100) / 100,
    paybackPeriod: Math.round(paybackPeriod * 100) / 100,
    irr: Math.round(irr * 100) / 100,
  };
}

/**
 * Generate risk assessment report
 */
export function generateRiskAssessment(
  hazards: Array<{
    name: string;
    probability: number;
    severity: number;
    mitigation: string;
  }>
): {
  totalRisk: number;
  highRiskItems: string[];
  mediumRiskItems: string[];
  lowRiskItems: string[];
  recommendations: string[];
} {
  const risks = hazards.map((h) => ({
    ...h,
    riskScore: h.probability * h.severity,
  }));

  const highRiskItems = risks.filter((r) => r.riskScore >= 15).map((r) => r.name);
  const mediumRiskItems = risks.filter((r) => r.riskScore >= 5 && r.riskScore < 15).map((r) => r.name);
  const lowRiskItems = risks.filter((r) => r.riskScore < 5).map((r) => r.name);

  const totalRisk = risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length;

  const recommendations = hazards
    .filter((h) => h.probability * h.severity >= 10)
    .map((h) => h.mitigation);

  return {
    totalRisk: Math.round(totalRisk * 100) / 100,
    highRiskItems,
    mediumRiskItems,
    lowRiskItems,
    recommendations,
  };
}

/**
 * Calculate project timeline with critical path
 */
export function calculateCriticalPath(
  tasks: Array<{
    id: string;
    name: string;
    duration: number;
    dependencies: string[];
  }>
): {
  criticalPath: string[];
  projectDuration: number;
  slack: Record<string, number>;
} {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const earlyStart: Record<string, number> = {};
  const earlyFinish: Record<string, number> = {};

  // Calculate early start and finish times
  const calculateEarly = (taskId: string): number => {
    if (earlyStart[taskId] !== undefined) return earlyStart[taskId];

    const task = taskMap.get(taskId);
    if (!task) return 0;

    if (task.dependencies.length === 0) {
      earlyStart[taskId] = 0;
    } else {
      earlyStart[taskId] = Math.max(...task.dependencies.map((dep) => calculateEarly(dep) + (taskMap.get(dep)?.duration || 0)));
    }

    earlyFinish[taskId] = earlyStart[taskId] + task.duration;
    return earlyStart[taskId];
  };

  tasks.forEach((t) => calculateEarly(t.id));

  const projectDuration = Math.max(...Object.values(earlyFinish));

  // Calculate slack
  const slack: Record<string, number> = {};
  tasks.forEach((t) => {
    slack[t.id] = projectDuration - earlyFinish[t.id];
  });

  const criticalPath = tasks
    .filter((t) => slack[t.id] === 0)
    .map((t) => t.name);

  return {
    criticalPath,
    projectDuration,
    slack,
  };
}

export default {
  predictMaterialCost,
  recommendMaterial,
  analyzeStructuralPerformance,
  simulateConcreteCuring,
  simulateThermalStress,
  simulateFluidFlow,
  calculateProjectROI,
  generateRiskAssessment,
  calculateCriticalPath,
};
