/**
 * TIER 2: UNIT CONVERTERS (20 Functions)
 * Comprehensive unit conversion tools for engineering calculations
 */

// ==================== LENGTH CONVERSIONS ====================

export function convertLength(value: number, fromUnit: string, toUnit: string): number {
  const toMeters: Record<string, number> = {
    'mm': 0.001,
    'cm': 0.01,
    'm': 1,
    'km': 1000,
    'in': 0.0254,
    'ft': 0.3048,
    'yd': 0.9144,
    'mi': 1609.34,
  };

  if (!toMeters[fromUnit] || !toMeters[toUnit]) {
    throw new Error(`Unsupported length unit: ${fromUnit} or ${toUnit}`);
  }

  const meters = value * toMeters[fromUnit];
  return meters / toMeters[toUnit];
}

// ==================== WEIGHT/MASS CONVERSIONS ====================

export function convertWeight(value: number, fromUnit: string, toUnit: string): number {
  const toKg: Record<string, number> = {
    'mg': 0.000001,
    'g': 0.001,
    'kg': 1,
    'ton': 1000,
    'oz': 0.0283495,
    'lb': 0.453592,
  };

  if (!toKg[fromUnit] || !toKg[toUnit]) {
    throw new Error(`Unsupported weight unit: ${fromUnit} or ${toUnit}`);
  }

  const kg = value * toKg[fromUnit];
  return kg / toKg[toUnit];
}

// ==================== PRESSURE CONVERSIONS ====================

export function convertPressure(value: number, fromUnit: string, toUnit: string): number {
  const toPa: Record<string, number> = {
    'Pa': 1,
    'kPa': 1000,
    'MPa': 1000000,
    'bar': 100000,
    'atm': 101325,
    'psi': 6894.76,
    'mmHg': 133.322,
  };

  if (!toPa[fromUnit] || !toPa[toUnit]) {
    throw new Error(`Unsupported pressure unit: ${fromUnit} or ${toUnit}`);
  }

  const pa = value * toPa[fromUnit];
  return pa / toPa[toUnit];
}

// ==================== TEMPERATURE CONVERSIONS ====================

export function convertTemperature(value: number, fromUnit: string, toUnit: string): number {
  let celsius: number;

  if (fromUnit === 'C') {
    celsius = value;
  } else if (fromUnit === 'F') {
    celsius = (value - 32) * 5 / 9;
  } else if (fromUnit === 'K') {
    celsius = value - 273.15;
  } else {
    throw new Error(`Unsupported temperature unit: ${fromUnit}`);
  }

  if (toUnit === 'C') {
    return celsius;
  } else if (toUnit === 'F') {
    return celsius * 9 / 5 + 32;
  } else if (toUnit === 'K') {
    return celsius + 273.15;
  } else {
    throw new Error(`Unsupported temperature unit: ${toUnit}`);
  }
}

// ==================== VOLUME CONVERSIONS ====================

export function convertVolume(value: number, fromUnit: string, toUnit: string): number {
  const toLiters: Record<string, number> = {
    'mL': 0.001,
    'L': 1,
    'm³': 1000,
    'cm³': 0.001,
    'in³': 0.0163871,
    'ft³': 28.3168,
    'gal': 3.78541,
  };

  if (!toLiters[fromUnit] || !toLiters[toUnit]) {
    throw new Error(`Unsupported volume unit: ${fromUnit} or ${toUnit}`);
  }

  const liters = value * toLiters[fromUnit];
  return liters / toLiters[toUnit];
}

// ==================== FORCE CONVERSIONS ====================

export function convertForce(value: number, fromUnit: string, toUnit: string): number {
  const toNewtons: Record<string, number> = {
    'N': 1,
    'kN': 1000,
    'MN': 1000000,
    'kgf': 9.80665,
    'lbf': 4.44822,
    'dyn': 0.00001,
  };

  if (!toNewtons[fromUnit] || !toNewtons[toUnit]) {
    throw new Error(`Unsupported force unit: ${fromUnit} or ${toUnit}`);
  }

  const newtons = value * toNewtons[fromUnit];
  return newtons / toNewtons[toUnit];
}

// ==================== POWER CONVERSIONS ====================

export function convertPower(value: number, fromUnit: string, toUnit: string): number {
  const toWatts: Record<string, number> = {
    'W': 1,
    'kW': 1000,
    'MW': 1000000,
    'hp': 745.7,
    'cv': 735.5,
    'BTU/h': 0.293071,
  };

  if (!toWatts[fromUnit] || !toWatts[toUnit]) {
    throw new Error(`Unsupported power unit: ${fromUnit} or ${toUnit}`);
  }

  const watts = value * toWatts[fromUnit];
  return watts / toWatts[toUnit];
}

// ==================== DENSITY CONVERSIONS ====================

export function convertDensity(value: number, fromUnit: string, toUnit: string): number {
  const toKgM3: Record<string, number> = {
    'kg/m³': 1,
    'g/cm³': 1000,
    'lb/ft³': 16.0185,
    'lb/gal': 119.827,
  };

  if (!toKgM3[fromUnit] || !toKgM3[toUnit]) {
    throw new Error(`Unsupported density unit: ${fromUnit} or ${toUnit}`);
  }

  const kgM3 = value * toKgM3[fromUnit];
  return kgM3 / toKgM3[toUnit];
}

// ==================== STRESS/STRENGTH CONVERSIONS ====================

export function convertStress(value: number, fromUnit: string, toUnit: string): number {
  const toPa: Record<string, number> = {
    'Pa': 1,
    'kPa': 1000,
    'MPa': 1000000,
    'GPa': 1000000000,
    'psi': 6894.76,
    'ksi': 6894760,
  };

  if (!toPa[fromUnit] || !toPa[toUnit]) {
    throw new Error(`Unsupported stress unit: ${fromUnit} or ${toUnit}`);
  }

  const pa = value * toPa[fromUnit];
  return pa / toPa[toUnit];
}

// ==================== ENERGY CONVERSIONS ====================

export function convertEnergy(value: number, fromUnit: string, toUnit: string): number {
  const toJoules: Record<string, number> = {
    'J': 1,
    'kJ': 1000,
    'MJ': 1000000,
    'cal': 4.184,
    'kcal': 4184,
    'BTU': 1055.06,
    'Wh': 3600,
    'kWh': 3600000,
  };

  if (!toJoules[fromUnit] || !toJoules[toUnit]) {
    throw new Error(`Unsupported energy unit: ${fromUnit} or ${toUnit}`);
  }

  const joules = value * toJoules[fromUnit];
  return joules / toJoules[toUnit];
}

// ==================== FLOW RATE CONVERSIONS ====================

export function convertFlowRate(value: number, fromUnit: string, toUnit: string): number {
  const toLitersPerSecond: Record<string, number> = {
    'L/s': 1,
    'L/min': 1 / 60,
    'L/h': 1 / 3600,
    'm³/s': 1000,
    'm³/h': 1000 / 3600,
    'gal/min': 0.0630902,
    'ft³/s': 28.3168,
  };

  if (!toLitersPerSecond[fromUnit] || !toLitersPerSecond[toUnit]) {
    throw new Error(`Unsupported flow rate unit: ${fromUnit} or ${toUnit}`);
  }

  const lps = value * toLitersPerSecond[fromUnit];
  return lps / toLitersPerSecond[toUnit];
}

// ==================== VELOCITY CONVERSIONS ====================

export function convertVelocity(value: number, fromUnit: string, toUnit: string): number {
  const toMeterPerSecond: Record<string, number> = {
    'm/s': 1,
    'km/h': 1 / 3.6,
    'mph': 0.44704,
    'ft/s': 0.3048,
    'knot': 0.514444,
  };

  if (!toMeterPerSecond[fromUnit] || !toMeterPerSecond[toUnit]) {
    throw new Error(`Unsupported velocity unit: ${fromUnit} or ${toUnit}`);
  }

  const ms = value * toMeterPerSecond[fromUnit];
  return ms / toMeterPerSecond[toUnit];
}

// ==================== ACCELERATION CONVERSIONS ====================

export function convertAcceleration(value: number, fromUnit: string, toUnit: string): number {
  const toMeterPerSecondSquared: Record<string, number> = {
    'm/s²': 1,
    'g': 9.80665,
    'ft/s²': 0.3048,
  };

  if (!toMeterPerSecondSquared[fromUnit] || !toMeterPerSecondSquared[toUnit]) {
    throw new Error(`Unsupported acceleration unit: ${fromUnit} or ${toUnit}`);
  }

  const ms2 = value * toMeterPerSecondSquared[fromUnit];
  return ms2 / toMeterPerSecondSquared[toUnit];
}

// ==================== TORQUE CONVERSIONS ====================

export function convertTorque(value: number, fromUnit: string, toUnit: string): number {
  const toNewtonMeter: Record<string, number> = {
    'N·m': 1,
    'kN·m': 1000,
    'lb·ft': 1.35582,
    'lb·in': 0.112985,
    'kgf·m': 9.80665,
  };

  if (!toNewtonMeter[fromUnit] || !toNewtonMeter[toUnit]) {
    throw new Error(`Unsupported torque unit: ${fromUnit} or ${toUnit}`);
  }

  const nm = value * toNewtonMeter[fromUnit];
  return nm / toNewtonMeter[toUnit];
}

// ==================== VISCOSITY CONVERSIONS ====================

export function convertViscosity(value: number, fromUnit: string, toUnit: string): number {
  const toPascalSecond: Record<string, number> = {
    'Pa·s': 1,
    'cP': 0.001,
    'P': 0.1,
    'lb/(ft·s)': 1.48816,
  };

  if (!toPascalSecond[fromUnit] || !toPascalSecond[toUnit]) {
    throw new Error(`Unsupported viscosity unit: ${fromUnit} or ${toUnit}`);
  }

  const ps = value * toPascalSecond[fromUnit];
  return ps / toPascalSecond[toUnit];
}

// ==================== FREQUENCY CONVERSIONS ====================

export function convertFrequency(value: number, fromUnit: string, toUnit: string): number {
  const toHertz: Record<string, number> = {
    'Hz': 1,
    'kHz': 1000,
    'MHz': 1000000,
    'GHz': 1000000000,
    'rpm': 1 / 60,
  };

  if (!toHertz[fromUnit] || !toHertz[toUnit]) {
    throw new Error(`Unsupported frequency unit: ${fromUnit} or ${toUnit}`);
  }

  const hz = value * toHertz[fromUnit];
  return hz / toHertz[toUnit];
}

// ==================== ANGLE CONVERSIONS ====================

export function convertAngle(value: number, fromUnit: string, toUnit: string): number {
  const toRadians: Record<string, number> = {
    'rad': 1,
    'deg': Math.PI / 180,
    'grad': Math.PI / 200,
    'turn': 2 * Math.PI,
  };

  if (!toRadians[fromUnit] || !toRadians[toUnit]) {
    throw new Error(`Unsupported angle unit: ${fromUnit} or ${toUnit}`);
  }

  const rad = value * toRadians[fromUnit];
  return rad / toRadians[toUnit];
}

// ==================== AREA CONVERSIONS ====================

export function convertArea(value: number, fromUnit: string, toUnit: string): number {
  const toSquareMeters: Record<string, number> = {
    'mm²': 0.000001,
    'cm²': 0.0001,
    'm²': 1,
    'km²': 1000000,
    'in²': 0.00064516,
    'ft²': 0.092903,
    'yd²': 0.836127,
    'acre': 4046.86,
    'hectare': 10000,
  };

  if (!toSquareMeters[fromUnit] || !toSquareMeters[toUnit]) {
    throw new Error(`Unsupported area unit: ${fromUnit} or ${toUnit}`);
  }

  const m2 = value * toSquareMeters[fromUnit];
  return m2 / toSquareMeters[toUnit];
}

export default {
  convertLength,
  convertWeight,
  convertPressure,
  convertTemperature,
  convertVolume,
  convertForce,
  convertPower,
  convertDensity,
  convertStress,
  convertEnergy,
  convertFlowRate,
  convertVelocity,
  convertAcceleration,
  convertTorque,
  convertViscosity,
  convertFrequency,
  convertAngle,
  convertArea,
};
