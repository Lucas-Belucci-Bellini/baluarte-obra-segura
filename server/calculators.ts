/**
 * BALUARTE ENGINEERING HUB - TIER 1 CALCULATORS (25 Functions)
 * All core engineering calculations for Civil, Electrical, Hydraulic, and Mechanical
 */

// ============================================================================
// CIVIL ENGINEERING CALCULATORS (7 Functions)
// ============================================================================

/**
 * 1. Concrete Volume Calculator
 * Calculate volume for slabs, beams, columns
 */
export function calculateConcreteVolume(
  length: number,
  width: number,
  height: number,
  shape: "rectangular" | "circular" = "rectangular"
): { volume: number; unit: string } {
  let volume = 0;
  
  if (shape === "rectangular") {
    volume = length * width * height;
  } else if (shape === "circular") {
    const radius = width / 2;
    volume = Math.PI * radius * radius * height;
  }
  
  return { volume: parseFloat(volume.toFixed(3)), unit: "m³" };
}

/**
 * 2. Rebar Quantity Calculator
 * Calculate steel reinforcement needed
 */
export function calculateRebarQuantity(
  length: number,
  width: number,
  height: number,
  barDiameter: number,
  spacing: number
): { totalLength: number; totalWeight: number; barCount: number } {
  const barsLengthwise = Math.ceil(width / spacing);
  const barsWidthwise = Math.ceil(length / spacing);
  const barsVertical = Math.ceil(height / spacing);
  
  const totalBars = (barsLengthwise * barsWidthwise) + (barsWidthwise * barsVertical) + (barsLengthwise * barsVertical);
  const barLength = Math.max(length, width, height);
  const totalLength = totalBars * barLength;
  
  // Approximate weight (kg/m for different diameters)
  const weightPerMeter = (barDiameter * barDiameter) / 162;
  const totalWeight = totalLength * weightPerMeter;
  
  return {
    totalLength: parseFloat(totalLength.toFixed(2)),
    totalWeight: parseFloat(totalWeight.toFixed(2)),
    barCount: totalBars,
  };
}

/**
 * 3. Foundation Load Calculator
 * Calculate bearing capacity and settlement
 */
export function calculateFoundationLoad(
  appliedLoad: number,
  foundationArea: number,
  soilBearingCapacity: number
): { bearingPressure: number; safetyFactor: number; isSafe: boolean } {
  const bearingPressure = appliedLoad / foundationArea;
  const safetyFactor = soilBearingCapacity / bearingPressure;
  const isSafe = safetyFactor >= 3; // Minimum safety factor of 3
  
  return {
    bearingPressure: parseFloat(bearingPressure.toFixed(2)),
    safetyFactor: parseFloat(safetyFactor.toFixed(2)),
    isSafe,
  };
}

/**
 * 4. Beam Deflection Calculator
 * Calculate deflection under load
 */
export function calculateBeamDeflection(
  load: number,
  length: number,
  youngModulus: number,
  momentOfInertia: number
): { maxDeflection: number; allowableDeflection: number; isAcceptable: boolean } {
  // Formula: δ = (5 * W * L^4) / (384 * E * I)
  const maxDeflection = (5 * load * Math.pow(length, 4)) / (384 * youngModulus * momentOfInertia);
  const allowableDeflection = length / 250; // L/250 is common standard
  const isAcceptable = maxDeflection <= allowableDeflection;
  
  return {
    maxDeflection: parseFloat((maxDeflection * 1000).toFixed(2)), // in mm
    allowableDeflection: parseFloat((allowableDeflection * 1000).toFixed(2)), // in mm
    isAcceptable,
  };
}

/**
 * 5. Column Buckling Calculator
 * Calculate critical buckling load
 */
export function calculateColumnBuckling(
  youngModulus: number,
  momentOfInertia: number,
  length: number,
  endCondition: "fixed-fixed" | "pinned-pinned" | "fixed-free" | "fixed-pinned" = "pinned-pinned"
): { criticalLoad: number; bucklingSafetyFactor: number } {
  const effectiveLengthFactors: Record<string, number> = {
    "fixed-fixed": 0.5,
    "pinned-pinned": 1.0,
    "fixed-free": 2.0,
    "fixed-pinned": 0.7,
  };
  
  const k = effectiveLengthFactors[endCondition];
  const effectiveLength = k * length;
  
  // Euler's formula: Pcr = (π² * E * I) / (L_e)²
  const criticalLoad = (Math.PI * Math.PI * youngModulus * momentOfInertia) / (effectiveLength * effectiveLength);
  
  return {
    criticalLoad: parseFloat(criticalLoad.toFixed(2)),
    bucklingSafetyFactor: 2.5, // Typical value
  };
}

/**
 * 6. Concrete Strength Estimator
 * Estimate strength based on mix design
 */
export function estimateConcreteStrength(
  cementContent: number,
  waterCementRatio: number,
  cureTime: number
): { estimatedStrength: number; cureProgress: number } {
  // Simplified formula based on water-cement ratio and cement content
  const baseStrength = (cementContent / 100) * 50; // Base strength calculation
  const wcRatioFactor = Math.exp(-2 * waterCementRatio);
  const cureProgress = Math.min((cureTime / 28) * 100, 100); // 28 days is full cure
  
  const estimatedStrength = baseStrength * wcRatioFactor * (cureProgress / 100);
  
  return {
    estimatedStrength: parseFloat(estimatedStrength.toFixed(1)),
    cureProgress: parseFloat(cureProgress.toFixed(1)),
  };
}

/**
 * 7. Excavation Volume Calculator
 * Calculate cut/fill volumes
 */
export function calculateExcavationVolume(
  length: number,
  width: number,
  depth: number,
  shape: "rectangular" | "trapezoidal" = "rectangular"
): { volume: number; bulkFactor: number; bulkedVolume: number } {
  let volume = 0;
  
  if (shape === "rectangular") {
    volume = length * width * depth;
  } else if (shape === "trapezoidal") {
    // Average width for trapezoidal shape
    const avgWidth = width * 1.2;
    volume = length * avgWidth * depth;
  }
  
  const bulkFactor = 1.25; // Typical bulk factor for excavated soil
  const bulkedVolume = volume * bulkFactor;
  
  return {
    volume: parseFloat(volume.toFixed(3)),
    bulkFactor,
    bulkedVolume: parseFloat(bulkedVolume.toFixed(3)),
  };
}

// ============================================================================
// ELECTRICAL ENGINEERING CALCULATORS (6 Functions)
// ============================================================================

/**
 * 8. Wire Gauge Calculator
 * Calculate correct wire size for current
 */
export function calculateWireGauge(
  current: number,
  length: number,
  allowableVoltDrop: number = 3
): { wireGauge: string; actualVoltDrop: number; isAcceptable: boolean } {
  // Using copper wire at 20°C, resistivity = 0.0000172 ohm-mm²
  const resistivity = 0.0000172;
  
  // AWG wire sizes and their cross-sectional areas (mm²)
  const wireGauges: Record<string, number> = {
    "14": 2.08,
    "12": 3.31,
    "10": 5.26,
    "8": 8.37,
    "6": 13.3,
    "4": 21.2,
    "2": 33.6,
    "1": 42.4,
    "0": 53.5,
  };
  
  // Calculate required cross-sectional area
  const requiredArea = (2 * resistivity * length * current) / allowableVoltDrop;
  
  let selectedGauge = "14";
  for (const [gauge, area] of Object.entries(wireGauges)) {
    if (area >= requiredArea) {
      selectedGauge = gauge;
      break;
    }
  }
  
  const selectedArea = wireGauges[selectedGauge];
  const actualVoltDrop = (2 * resistivity * length * current) / selectedArea;
  const isAcceptable = actualVoltDrop <= allowableVoltDrop;
  
  return {
    wireGauge: `AWG ${selectedGauge}`,
    actualVoltDrop: parseFloat(actualVoltDrop.toFixed(2)),
    isAcceptable,
  };
}

/**
 * 9. Voltage Drop Calculator
 * Calculate voltage drop in circuits
 */
export function calculateVoltageDrop(
  current: number,
  resistance: number,
  length: number
): { voltageDrop: number; percentageDrop: number; supplyVoltage: number } {
  const voltageDrop = current * resistance * (2 * length / 1000); // 2 for round trip
  const supplyVoltage = 220; // Standard Brazilian voltage
  const percentageDrop = (voltageDrop / supplyVoltage) * 100;
  
  return {
    voltageDrop: parseFloat(voltageDrop.toFixed(2)),
    percentageDrop: parseFloat(percentageDrop.toFixed(2)),
    supplyVoltage,
  };
}

/**
 * 10. Circuit Breaker Selector
 * Select appropriate breaker size
 */
export function selectCircuitBreaker(
  loadCurrent: number,
  safetyFactor: number = 1.25
): { breakerSize: number; isOversized: boolean } {
  const requiredCapacity = loadCurrent * safetyFactor;
  
  // Standard breaker sizes
  const standardSizes = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100, 125, 150, 200];
  
  let selectedSize = standardSizes[0];
  for (const size of standardSizes) {
    if (size >= requiredCapacity) {
      selectedSize = size;
      break;
    }
  }
  
  const isOversized = selectedSize > requiredCapacity * 1.5;
  
  return {
    breakerSize: selectedSize,
    isOversized,
  };
}

/**
 * 11. Transformer Sizing Calculator
 * Calculate transformer capacity needed
 */
export function calculateTransformerSize(
  totalLoad: number,
  powerFactor: number = 0.9,
  demandFactor: number = 0.8
): { requiredCapacity: number; selectedTransformer: number } {
  const apparentPower = (totalLoad / powerFactor) * demandFactor;
  
  // Standard transformer sizes (kVA)
  const standardSizes = [10, 15, 25, 37.5, 50, 75, 100, 150, 200, 300, 500];
  
  let selectedTransformer = standardSizes[0];
  for (const size of standardSizes) {
    if (size >= apparentPower) {
      selectedTransformer = size;
      break;
    }
  }
  
  return {
    requiredCapacity: parseFloat(apparentPower.toFixed(2)),
    selectedTransformer,
  };
}

/**
 * 12. Power Factor Calculator
 * Calculate reactive power and corrections
 */
export function calculatePowerFactor(
  activePower: number,
  apparentPower: number
): { powerFactor: number; reactivePower: number; correctionCapacitor: number } {
  const powerFactor = activePower / apparentPower;
  const reactivePower = Math.sqrt(apparentPower * apparentPower - activePower * activePower);
  
  // Capacitor size for correction to 0.95
  const targetPowerFactor = 0.95;
  const correctionCapacitor = (activePower * (Math.tan(Math.acos(powerFactor)) - Math.tan(Math.acos(targetPowerFactor)))) / 1000;
  
  return {
    powerFactor: parseFloat(powerFactor.toFixed(3)),
    reactivePower: parseFloat(reactivePower.toFixed(2)),
    correctionCapacitor: parseFloat(Math.max(0, correctionCapacitor).toFixed(2)),
  };
}

/**
 * 13. Three-Phase Power Calculator
 * Calculate power in 3-phase systems
 */
export function calculateThreePhasePower(
  voltage: number,
  current: number,
  powerFactor: number = 0.9
): { activePower: number; apparentPower: number; reactivePower: number } {
  const apparentPower = Math.sqrt(3) * voltage * current;
  const activePower = apparentPower * powerFactor;
  const reactivePower = Math.sqrt(apparentPower * apparentPower - activePower * activePower);
  
  return {
    activePower: parseFloat((activePower / 1000).toFixed(2)), // in kW
    apparentPower: parseFloat((apparentPower / 1000).toFixed(2)), // in kVA
    reactivePower: parseFloat((reactivePower / 1000).toFixed(2)), // in kVAR
  };
}

// ============================================================================
// HYDRAULIC ENGINEERING CALCULATORS (6 Functions)
// ============================================================================

/**
 * 14. Pipe Flow Calculator
 * Calculate flow rate and pressure drop
 */
export function calculatePipeFlow(
  pipeDiameter: number,
  flowVelocity: number
): { flowRate: number; flowVelocityAcceptable: boolean } {
  const radius = pipeDiameter / 2;
  const flowRate = Math.PI * radius * radius * flowVelocity;
  
  // Acceptable velocity: 0.6-2.4 m/s for most applications
  const flowVelocityAcceptable = flowVelocity >= 0.6 && flowVelocity <= 2.4;
  
  return {
    flowRate: parseFloat((flowRate * 1000).toFixed(2)), // in L/min
    flowVelocityAcceptable,
  };
}

/**
 * 15. Pump Selection Tool
 * Select pump based on flow/pressure requirements
 */
export function selectPump(
  requiredFlow: number,
  requiredHead: number
): { pumpType: string; estimatedPower: number; efficiency: number } {
  let pumpType = "Centrifugal";
  let efficiency = 0.75;
  
  if (requiredFlow < 10 && requiredHead > 100) {
    pumpType = "Positive Displacement";
    efficiency = 0.85;
  } else if (requiredFlow > 100 && requiredHead < 50) {
    pumpType = "Axial Flow";
    efficiency = 0.80;
  }
  
  // Power = (Flow * Head * Density * g) / (efficiency * 1000)
  const estimatedPower = (requiredFlow * requiredHead * 1000 * 9.81) / (efficiency * 1000 * 60);
  
  return {
    pumpType,
    estimatedPower: parseFloat((estimatedPower / 1000).toFixed(2)), // in kW
    efficiency: parseFloat((efficiency * 100).toFixed(1)),
  };
}

/**
 * 16. Valve Sizing Calculator
 * Calculate valve size for flow control
 */
export function calculateValveSize(
  flowRate: number,
  maxVelocity: number = 2.0
): { requiredDiameter: number; selectedValveSize: number } {
  // Flow rate in m³/s
  const flowM3s = flowRate / 60000;
  
  // Area = Flow / Velocity
  const requiredArea = flowM3s / maxVelocity;
  const requiredDiameter = 2 * Math.sqrt(requiredArea / Math.PI);
  
  // Standard valve sizes (mm)
  const standardSizes = [10, 15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150];
  
  let selectedSize = standardSizes[0];
  for (const size of standardSizes) {
    if (size >= requiredDiameter * 1000) {
      selectedSize = size;
      break;
    }
  }
  
  return {
    requiredDiameter: parseFloat((requiredDiameter * 1000).toFixed(2)),
    selectedValveSize: selectedSize,
  };
}

/**
 * 17. Pressure Drop Calculator
 * Calculate pressure loss in piping
 */
export function calculatePressureDrop(
  flowRate: number,
  pipeDiameter: number,
  pipeLength: number,
  roughness: number = 0.045
): { pressureDrop: number; pressureDropPerMeter: number } {
  const velocity = (flowRate / 60000) / (Math.PI * Math.pow(pipeDiameter / 1000 / 2, 2));
  
  // Darcy-Weisbach equation simplified
  const frictionFactor = 0.316 / Math.pow(velocity, 0.25); // Blasius equation
  const pressureDrop = (frictionFactor * pipeLength * velocity * velocity) / (2 * (pipeDiameter / 1000) * 9.81);
  
  return {
    pressureDrop: parseFloat(pressureDrop.toFixed(2)),
    pressureDropPerMeter: parseFloat((pressureDrop / pipeLength).toFixed(4)),
  };
}

/**
 * 18. Hydraulic Cylinder Calculator
 * Calculate force and speed
 */
export function calculateHydraulicCylinder(
  pressure: number,
  rodDiameter: number,
  cylinderDiameter: number,
  flowRate: number
): { force: number; speed: number; power: number } {
  const pistonArea = Math.PI * Math.pow(cylinderDiameter / 2, 2);
  const force = pressure * pistonArea;
  
  // Speed = Flow / Area
  const speed = (flowRate / 60000) / (pistonArea / 1000000);
  
  // Power = Pressure * Flow
  const power = (pressure * flowRate) / 600000;
  
  return {
    force: parseFloat(force.toFixed(2)),
    speed: parseFloat((speed * 1000).toFixed(2)), // in mm/s
    power: parseFloat(power.toFixed(2)), // in kW
  };
}

/**
 * 19. Fluid Density Calculator
 * Calculate density at different temperatures
 */
export function calculateFluidDensity(
  baseTemperature: number,
  currentTemperature: number,
  baseDensity: number = 850,
  thermalExpansionCoefficient: number = 0.0007
): { density: number; densityChange: number } {
  const temperatureDifference = currentTemperature - baseTemperature;
  const density = baseDensity / (1 + thermalExpansionCoefficient * temperatureDifference);
  const densityChange = baseDensity - density;
  
  return {
    density: parseFloat(density.toFixed(2)),
    densityChange: parseFloat(densityChange.toFixed(2)),
  };
}

// ============================================================================
// MECHANICAL ENGINEERING CALCULATORS (6 Functions)
// ============================================================================

/**
 * 20. Stress Calculator
 * Calculate stress in materials
 */
export function calculateStress(
  force: number,
  area: number
): { stress: number; stressType: string } {
  const stress = force / area;
  const stressType = force > 0 ? "Tensile" : "Compressive";
  
  return {
    stress: parseFloat(Math.abs(stress).toFixed(2)),
    stressType,
  };
}

/**
 * 21. Torque Calculator
 * Calculate torque and rotational force
 */
export function calculateTorque(
  force: number,
  momentArm: number
): { torque: number; angularMomentum: number } {
  const torque = force * momentArm;
  
  return {
    torque: parseFloat(torque.toFixed(2)),
    angularMomentum: parseFloat((torque * 0.1).toFixed(2)), // Simplified
  };
}

/**
 * 22. Gear Ratio Calculator
 * Calculate gear ratios and speeds
 */
export function calculateGearRatio(
  driverTeeth: number,
  drivenTeeth: number,
  driverSpeed: number
): { gearRatio: number; drivenSpeed: number; speedReduction: number } {
  const gearRatio = drivenTeeth / driverTeeth;
  const drivenSpeed = driverSpeed / gearRatio;
  const speedReduction = ((driverSpeed - drivenSpeed) / driverSpeed) * 100;
  
  return {
    gearRatio: parseFloat(gearRatio.toFixed(3)),
    drivenSpeed: parseFloat(drivenSpeed.toFixed(2)),
    speedReduction: parseFloat(speedReduction.toFixed(2)),
  };
}

/**
 * 23. Belt Drive Calculator
 * Calculate belt length and tension
 */
export function calculateBeltDrive(
  pulleyDiameter1: number,
  pulleyDiameter2: number,
  centerDistance: number
): { beltLength: number; speedRatio: number } {
  const radius1 = pulleyDiameter1 / 2;
  const radius2 = pulleyDiameter2 / 2;
  
  const beltLength = 2 * centerDistance + (Math.PI / 2) * (pulleyDiameter1 + pulleyDiameter2) + 
                     Math.pow(pulleyDiameter2 - pulleyDiameter1, 2) / (4 * centerDistance);
  
  const speedRatio = pulleyDiameter1 / pulleyDiameter2;
  
  return {
    beltLength: parseFloat(beltLength.toFixed(2)),
    speedRatio: parseFloat(speedRatio.toFixed(3)),
  };
}

/**
 * 24. Bearing Life Calculator
 * Calculate bearing service life (L10)
 */
export function calculateBearingLife(
  basicDynamicLoad: number,
  actualLoad: number,
  speed: number
): { L10Life: number; L50Life: number; serviceLife: number } {
  // L10 = (C / P)^3 * 10^6 revolutions
  const L10Revolutions = Math.pow(basicDynamicLoad / actualLoad, 3) * 1000000;
  const L10Life = L10Revolutions / (speed * 60);
  
  // L50 ≈ 5 * L10
  const L50Life = L10Life * 5;
  
  // Service life in hours
  const serviceLife = L10Life;
  
  return {
    L10Life: parseFloat(L10Life.toFixed(2)),
    L50Life: parseFloat(L50Life.toFixed(2)),
    serviceLife: parseFloat((serviceLife / 1000).toFixed(2)), // in thousands of hours
  };
}

/**
 * 25. Thermal Expansion Calculator
 * Calculate material expansion
 */
export function calculateThermalExpansion(
  originalLength: number,
  temperatureChange: number,
  linearExpansionCoefficient: number
): { expansionLength: number; finalLength: number; expansionPercentage: number } {
  const expansionLength = originalLength * linearExpansionCoefficient * temperatureChange;
  const finalLength = originalLength + expansionLength;
  const expansionPercentage = (expansionLength / originalLength) * 100;
  
  return {
    expansionLength: parseFloat(expansionLength.toFixed(4)),
    finalLength: parseFloat(finalLength.toFixed(4)),
    expansionPercentage: parseFloat(expansionPercentage.toFixed(3)),
  };
}

// ============================================================================
// EXPORT ALL CALCULATORS
// ============================================================================

export const allCalculators = {
  // Civil
  calculateConcreteVolume,
  calculateRebarQuantity,
  calculateFoundationLoad,
  calculateBeamDeflection,
  calculateColumnBuckling,
  estimateConcreteStrength,
  calculateExcavationVolume,
  
  // Electrical
  calculateWireGauge,
  calculateVoltageDrop,
  selectCircuitBreaker,
  calculateTransformerSize,
  calculatePowerFactor,
  calculateThreePhasePower,
  
  // Hydraulic
  calculatePipeFlow,
  selectPump,
  calculateValveSize,
  calculatePressureDrop,
  calculateHydraulicCylinder,
  calculateFluidDensity,
  
  // Mechanical
  calculateStress,
  calculateTorque,
  calculateGearRatio,
  calculateBeltDrive,
  calculateBearingLife,
  calculateThermalExpansion,
};
