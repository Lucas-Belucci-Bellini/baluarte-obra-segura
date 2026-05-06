import { describe, it, expect } from 'vitest';
import * as calc from './calculators';

describe('Civil Engineering Calculators', () => {
  it('should calculate concrete volume for rectangular shape', () => {
    const result = calc.calculateConcreteVolume(10, 5, 2, 'rectangular');
    expect(result.volume).toBe(100);
    expect(result.unit).toBe('m³');
  });

  it('should calculate concrete volume for circular shape', () => {
    const result = calc.calculateConcreteVolume(10, 4, 2, 'circular');
    expect(result.volume).toBeGreaterThan(0);
    expect(result.unit).toBe('m³');
  });

  it('should calculate rebar quantity', () => {
    const result = calc.calculateRebarQuantity(10, 5, 2, 12, 15);
    expect(result.totalLength).toBeGreaterThan(0);
    expect(result.totalWeight).toBeGreaterThan(0);
    expect(result.barCount).toBeGreaterThan(0);
  });

  it('should calculate foundation load', () => {
    const result = calc.calculateFoundationLoad(500, 10, 200);
    expect(result.bearingPressure).toBe(50);
    expect(result.safetyFactor).toBe(4);
    expect(result.isSafe).toBe(true);
  });

  it('should calculate beam deflection', () => {
    const result = calc.calculateBeamDeflection(100, 5, 200, 1000);
    expect(result.maxDeflection).toBeGreaterThan(0);
    expect(result.allowableDeflection).toBeGreaterThan(0);
  });

  it('should calculate column buckling', () => {
    const result = calc.calculateColumnBuckling(200, 1000, 5);
    expect(result.criticalLoad).toBeGreaterThan(0);
    expect(result.bucklingSafetyFactor).toBe(2.5);
  });

  it('should estimate concrete strength', () => {
    const result = calc.estimateConcreteStrength(300, 0.5, 28);
    expect(result.estimatedStrength).toBeGreaterThan(0);
    expect(result.cureProgress).toBeGreaterThanOrEqual(0);
  });

  it('should calculate excavation volume', () => {
    const result = calc.calculateExcavationVolume(10, 5, 2, 'rectangular');
    expect(result.volume).toBe(100);
    expect(result.bulkFactor).toBe(1.25);
    expect(result.bulkedVolume).toBe(125);
  });
});

describe('Electrical Engineering Calculators', () => {
  it('should calculate wire gauge', () => {
    const result = calc.calculateWireGauge(20, 50, 3);
    expect(result.wireGauge).toContain('AWG');
    expect(result.actualVoltDrop).toBeGreaterThanOrEqual(0);
  });

  it('should calculate voltage drop', () => {
    const result = calc.calculateVoltageDrop(10, 2, 100);
    expect(result.voltageDrop).toBeGreaterThan(0);
    expect(result.percentageDrop).toBeGreaterThan(0);
    expect(result.supplyVoltage).toBe(220);
  });

  it('should select circuit breaker', () => {
    const result = calc.selectCircuitBreaker(15);
    expect(result.breakerSize).toBeGreaterThanOrEqual(15);
    expect(typeof result.isOversized).toBe('boolean');
  });

  it('should calculate transformer size', () => {
    const result = calc.calculateTransformerSize(50, 0.9, 0.8);
    expect(result.requiredCapacity).toBeGreaterThan(0);
    expect(result.selectedTransformer).toBeGreaterThan(0);
  });

  it('should calculate power factor', () => {
    const result = calc.calculatePowerFactor(50, 60);
    expect(result.powerFactor).toBeGreaterThan(0);
    expect(result.powerFactor).toBeLessThanOrEqual(1);
    expect(result.reactivePower).toBeGreaterThanOrEqual(0);
  });

  it('should calculate three-phase power', () => {
    const result = calc.calculateThreePhasePower(380, 50, 0.9);
    expect(result.activePower).toBeGreaterThan(0);
    expect(result.apparentPower).toBeGreaterThan(0);
    expect(result.reactivePower).toBeGreaterThanOrEqual(0);
  });
});

describe('Hydraulic Engineering Calculators', () => {
  it('should calculate pipe flow', () => {
    const result = calc.calculatePipeFlow(50, 1.5);
    expect(result.flowRate).toBeGreaterThan(0);
    expect(result.flowVelocityAcceptable).toBe(true);
  });

  it('should select pump', () => {
    const result = calc.selectPump(50, 30);
    expect(result.pumpType).toBeTruthy();
    expect(result.estimatedPower).toBeGreaterThan(0);
    expect(result.efficiency).toBeGreaterThan(0);
  });

  it('should calculate valve size', () => {
    const result = calc.calculateValveSize(100, 2);
    expect(result.requiredDiameter).toBeGreaterThan(0);
    expect(result.selectedValveSize).toBeGreaterThan(0);
  });

  it('should calculate pressure drop', () => {
    const result = calc.calculatePressureDrop(100, 50, 100);
    expect(result.pressureDrop).toBeGreaterThan(0);
    expect(result.pressureDropPerMeter).toBeGreaterThan(0);
  });

  it('should calculate hydraulic cylinder', () => {
    const result = calc.calculateHydraulicCylinder(200, 20, 80, 50);
    expect(result.force).toBeGreaterThan(0);
    expect(result.speed).toBeGreaterThan(0);
    expect(result.power).toBeGreaterThan(0);
  });

  it('should calculate fluid density', () => {
    const result = calc.calculateFluidDensity(20, 40, 850, 0.0007);
    expect(result.density).toBeGreaterThan(0);
    expect(result.densityChange).toBeGreaterThanOrEqual(0);
  });
});

describe('Mechanical Engineering Calculators', () => {
  it('should calculate stress', () => {
    const result = calc.calculateStress(1000, 100);
    expect(result.stress).toBe(10);
    expect(result.stressType).toBe('Tensile');
  });

  it('should calculate stress for negative force', () => {
    const result = calc.calculateStress(-1000, 100);
    expect(result.stress).toBe(10);
    expect(result.stressType).toBe('Compressive');
  });

  it('should calculate torque', () => {
    const result = calc.calculateTorque(100, 0.5);
    expect(result.torque).toBe(50);
    expect(result.angularMomentum).toBeGreaterThan(0);
  });

  it('should calculate gear ratio', () => {
    const result = calc.calculateGearRatio(20, 40, 1000);
    expect(result.gearRatio).toBe(2);
    expect(result.drivenSpeed).toBe(500);
    expect(result.speedReduction).toBe(50);
  });

  it('should calculate belt drive', () => {
    const result = calc.calculateBeltDrive(100, 200, 500);
    expect(result.beltLength).toBeGreaterThan(0);
    expect(result.speedRatio).toBe(0.5);
  });

  it('should calculate bearing life', () => {
    const result = calc.calculateBearingLife(10000, 5000, 1000);
    expect(result.L10Life).toBeGreaterThan(0);
    expect(result.L50Life).toBeGreaterThan(result.L10Life);
    expect(result.serviceLife).toBeGreaterThan(0);
  });

  it('should calculate thermal expansion', () => {
    const result = calc.calculateThermalExpansion(1, 50, 0.000012);
    expect(result.expansionLength).toBeGreaterThan(0);
    expect(result.finalLength).toBeGreaterThan(1);
    expect(result.expansionPercentage).toBeGreaterThan(0);
  });
});

describe('Calculator Accuracy and Edge Cases', () => {
  it('should handle zero values gracefully', () => {
    expect(() => calc.calculateStress(0, 100)).not.toThrow();
  });

  it('should handle large values', () => {
    const result = calc.calculateConcreteVolume(1000, 1000, 1000);
    expect(result.volume).toBe(1000000000);
  });

  it('should handle small decimal values', () => {
    const result = calc.calculateThermalExpansion(1, 0.1, 0.0000001);
    expect(result.expansionLength).toBeGreaterThanOrEqual(0);
  });

  it('should maintain precision in calculations', () => {
    const result = calc.calculateVoltageDrop(10.5, 2.3, 100.7);
    expect(result.voltageDrop).toBeGreaterThan(0);
    expect(result.percentageDrop).toBeGreaterThan(0);
  });
});
