import { describe, it, expect } from 'vitest';
import * as unitConverters from './unitConverters';
import * as quickCalcs from './quickCalculators';

describe('TIER 2: Unit Converters', () => {
  describe('Length Conversion', () => {
    it('should convert mm to m', () => {
      expect(unitConverters.convertLength(1000, 'mm', 'm')).toBe(1);
    });

    it('should convert m to ft', () => {
      const result = unitConverters.convertLength(1, 'm', 'ft');
      expect(result).toBeCloseTo(3.28084, 4);
    });

    it('should convert km to mi', () => {
      const result = unitConverters.convertLength(1.60934, 'km', 'mi');
      expect(result).toBeCloseTo(1, 4);
    });
  });

  describe('Weight Conversion', () => {
    it('should convert kg to lb', () => {
      const result = unitConverters.convertWeight(1, 'kg', 'lb');
      expect(result).toBeCloseTo(2.20462, 4);
    });

    it('should convert g to oz', () => {
      const result = unitConverters.convertWeight(28.3495, 'g', 'oz');
      expect(result).toBeCloseTo(1, 4);
    });

    it('should convert ton to kg', () => {
      expect(unitConverters.convertWeight(1, 'ton', 'kg')).toBe(1000);
    });
  });

  describe('Pressure Conversion', () => {
    it('should convert Pa to kPa', () => {
      expect(unitConverters.convertPressure(1000, 'Pa', 'kPa')).toBe(1);
    });

    it('should convert bar to psi', () => {
      const result = unitConverters.convertPressure(1, 'bar', 'psi');
      expect(result).toBeCloseTo(14.5038, 4);
    });

    it('should convert atm to Pa', () => {
      expect(unitConverters.convertPressure(1, 'atm', 'Pa')).toBe(101325);
    });
  });

  describe('Temperature Conversion', () => {
    it('should convert 0°C to 32°F', () => {
      expect(unitConverters.convertTemperature(0, 'C', 'F')).toBe(32);
    });

    it('should convert 100°C to 212°F', () => {
      expect(unitConverters.convertTemperature(100, 'C', 'F')).toBe(212);
    });

    it('should convert 0°C to 273.15K', () => {
      expect(unitConverters.convertTemperature(0, 'C', 'K')).toBeCloseTo(273.15, 2);
    });
  });

  describe('Volume Conversion', () => {
    it('should convert L to mL', () => {
      expect(unitConverters.convertVolume(1, 'L', 'mL')).toBe(1000);
    });

    it('should convert m³ to L', () => {
      expect(unitConverters.convertVolume(1, 'm³', 'L')).toBe(1000);
    });

    it('should convert gal to L', () => {
      const result = unitConverters.convertVolume(1, 'gal', 'L');
      expect(result).toBeCloseTo(3.78541, 4);
    });
  });

  describe('Force Conversion', () => {
    it('should convert kN to N', () => {
      expect(unitConverters.convertForce(1, 'kN', 'N')).toBe(1000);
    });

    it('should convert lbf to N', () => {
      const result = unitConverters.convertForce(1, 'lbf', 'N');
      expect(result).toBeCloseTo(4.44822, 4);
    });

    it('should convert kgf to N', () => {
      const result = unitConverters.convertForce(1, 'kgf', 'N');
      expect(result).toBeCloseTo(9.80665, 4);
    });
  });

  describe('Power Conversion', () => {
    it('should convert kW to W', () => {
      expect(unitConverters.convertPower(1, 'kW', 'W')).toBe(1000);
    });

    it('should convert hp to W', () => {
      const result = unitConverters.convertPower(1, 'hp', 'W');
      expect(result).toBeCloseTo(745.7, 1);
    });

    it('should convert cv to W', () => {
      const result = unitConverters.convertPower(1, 'cv', 'W');
      expect(result).toBeCloseTo(735.5, 1);
    });
  });

  describe('Density Conversion', () => {
    it('should convert g/cm³ to kg/m³', () => {
      expect(unitConverters.convertDensity(1, 'g/cm³', 'kg/m³')).toBe(1000);
    });

    it('should convert lb/ft³ to kg/m³', () => {
      const result = unitConverters.convertDensity(1, 'lb/ft³', 'kg/m³');
      expect(result).toBeCloseTo(16.0185, 4);
    });
  });

  describe('Stress Conversion', () => {
    it('should convert MPa to kPa', () => {
      expect(unitConverters.convertStress(1, 'MPa', 'kPa')).toBe(1000);
    });

    it('should convert psi to MPa', () => {
      const result = unitConverters.convertStress(1, 'psi', 'MPa');
      expect(result).toBeCloseTo(0.00689476, 6);
    });
  });

  describe('Energy Conversion', () => {
    it('should convert kJ to J', () => {
      expect(unitConverters.convertEnergy(1, 'kJ', 'J')).toBe(1000);
    });

    it('should convert kWh to J', () => {
      expect(unitConverters.convertEnergy(1, 'kWh', 'J')).toBe(3600000);
    });

    it('should convert cal to J', () => {
      const result = unitConverters.convertEnergy(1, 'cal', 'J');
      expect(result).toBeCloseTo(4.184, 3);
    });
  });

  describe('Flow Rate Conversion', () => {
    it('should convert L/min to L/s', () => {
      expect(unitConverters.convertFlowRate(60, 'L/min', 'L/s')).toBe(1);
    });

    it('should convert m³/h to L/s', () => {
      const result = unitConverters.convertFlowRate(1, 'm³/h', 'L/s');
      expect(result).toBeCloseTo(0.277778, 5);
    });
  });

  describe('Velocity Conversion', () => {
    it('should convert km/h to m/s', () => {
      const result = unitConverters.convertVelocity(3.6, 'km/h', 'm/s');
      expect(result).toBe(1);
    });

    it('should convert mph to m/s', () => {
      const result = unitConverters.convertVelocity(1, 'mph', 'm/s');
      expect(result).toBeCloseTo(0.44704, 5);
    });
  });

  describe('Acceleration Conversion', () => {
    it('should convert g to m/s²', () => {
      const result = unitConverters.convertAcceleration(1, 'g', 'm/s²');
      expect(result).toBeCloseTo(9.80665, 4);
    });
  });

  describe('Torque Conversion', () => {
    it('should convert kN·m to N·m', () => {
      expect(unitConverters.convertTorque(1, 'kN·m', 'N·m')).toBe(1000);
    });

    it('should convert lb·ft to N·m', () => {
      const result = unitConverters.convertTorque(1, 'lb·ft', 'N·m');
      expect(result).toBeCloseTo(1.35582, 4);
    });
  });

  describe('Viscosity Conversion', () => {
    it('should convert cP to Pa·s', () => {
      expect(unitConverters.convertViscosity(1, 'cP', 'Pa·s')).toBe(0.001);
    });
  });

  describe('Frequency Conversion', () => {
    it('should convert rpm to Hz', () => {
      expect(unitConverters.convertFrequency(60, 'rpm', 'Hz')).toBe(1);
    });

    it('should convert kHz to Hz', () => {
      expect(unitConverters.convertFrequency(1, 'kHz', 'Hz')).toBe(1000);
    });
  });

  describe('Angle Conversion', () => {
    it('should convert 180 degrees to π radians', () => {
      const result = unitConverters.convertAngle(180, 'deg', 'rad');
      expect(result).toBeCloseTo(Math.PI, 5);
    });
  });

  describe('Area Conversion', () => {
    it('should convert m² to cm²', () => {
      expect(unitConverters.convertArea(1, 'm²', 'cm²')).toBe(10000);
    });

    it('should convert hectare to m²', () => {
      expect(unitConverters.convertArea(1, 'hectare', 'm²')).toBe(10000);
    });
  });
});

describe('TIER 2: Quick Calculators', () => {
  describe('Geometry Calculators', () => {
    it('should calculate circle area', () => {
      const result = quickCalcs.circleArea(5);
      expect(result).toBeCloseTo(78.5398, 4);
    });

    it('should calculate circle perimeter', () => {
      const result = quickCalcs.circlePerimeter(5);
      expect(result).toBeCloseTo(31.4159, 4);
    });

    it('should calculate rectangle area', () => {
      expect(quickCalcs.rectangleArea(10, 5)).toBe(50);
    });

    it('should calculate rectangle perimeter', () => {
      expect(quickCalcs.rectanglePerimeter(10, 5)).toBe(30);
    });

    it('should calculate cylinder volume', () => {
      const result = quickCalcs.cylinderVolume(2, 10);
      expect(result).toBeCloseTo(125.664, 3);
    });

    it('should calculate rectangular prism volume', () => {
      expect(quickCalcs.rectangularPrismVolume(10, 5, 3)).toBe(150);
    });

    it('should calculate sphere volume', () => {
      const result = quickCalcs.sphereVolume(5);
      expect(result).toBeCloseTo(523.599, 3);
    });
  });

  describe('Percentage & Ratio Calculators', () => {
    it('should calculate percentage of value', () => {
      expect(quickCalcs.percentageOf(100, 25)).toBe(25);
    });

    it('should calculate what percentage one value is of another', () => {
      expect(quickCalcs.percentageIs(25, 100)).toBe(25);
    });

    it('should calculate ratio', () => {
      const result = quickCalcs.ratio(10, 20);
      expect(result.ratio).toBe('1:2');
      expect(result.decimal).toBe(0.5);
    });

    it('should calculate average', () => {
      expect(quickCalcs.average(10, 20, 30)).toBe(20);
    });

    it('should calculate slope', () => {
      const result = quickCalcs.slope(10, 50);
      expect(result.percentage).toBe(20);
      expect(result.ratio).toBe('1:5');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for negative radius', () => {
      expect(() => quickCalcs.circleArea(-5)).toThrow();
    });

    it('should throw error for zero denominator in percentage', () => {
      expect(() => quickCalcs.percentageIs(10, 0)).toThrow();
    });

    it('should throw error for zero run in slope', () => {
      expect(() => quickCalcs.slope(10, 0)).toThrow();
    });
  });
});
