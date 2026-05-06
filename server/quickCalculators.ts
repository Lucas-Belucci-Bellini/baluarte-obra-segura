/**
 * TIER 2: QUICK CALCULATORS (12 Functions)
 * Fast and simple calculation tools for common engineering tasks
 */

// ==================== GEOMETRY CALCULATORS ====================

/**
 * Calculate area of a circle
 */
export function circleArea(radius: number): number {
  if (radius < 0) throw new Error('Radius cannot be negative');
  return Math.PI * radius * radius;
}

/**
 * Calculate perimeter of a circle
 */
export function circlePerimeter(radius: number): number {
  if (radius < 0) throw new Error('Radius cannot be negative');
  return 2 * Math.PI * radius;
}

/**
 * Calculate area of a rectangle
 */
export function rectangleArea(width: number, height: number): number {
  if (width < 0 || height < 0) throw new Error('Dimensions cannot be negative');
  return width * height;
}

/**
 * Calculate perimeter of a rectangle
 */
export function rectanglePerimeter(width: number, height: number): number {
  if (width < 0 || height < 0) throw new Error('Dimensions cannot be negative');
  return 2 * (width + height);
}

/**
 * Calculate volume of a cylinder
 */
export function cylinderVolume(radius: number, height: number): number {
  if (radius < 0 || height < 0) throw new Error('Dimensions cannot be negative');
  return Math.PI * radius * radius * height;
}

/**
 * Calculate volume of a rectangular prism (box)
 */
export function rectangularPrismVolume(width: number, height: number, depth: number): number {
  if (width < 0 || height < 0 || depth < 0) throw new Error('Dimensions cannot be negative');
  return width * height * depth;
}

/**
 * Calculate volume of a sphere
 */
export function sphereVolume(radius: number): number {
  if (radius < 0) throw new Error('Radius cannot be negative');
  return (4 / 3) * Math.PI * radius * radius * radius;
}

// ==================== PERCENTAGE & RATIO CALCULATORS ====================

/**
 * Calculate percentage of a value
 */
export function percentageOf(value: number, percentage: number): number {
  return (value * percentage) / 100;
}

/**
 * Calculate what percentage one value is of another
 */
export function percentageIs(part: number, whole: number): number {
  if (whole === 0) throw new Error('Whole cannot be zero');
  return (part / whole) * 100;
}

/**
 * Calculate ratio between two values
 */
export function ratio(value1: number, value2: number): { ratio: string; decimal: number } {
  if (value2 === 0) throw new Error('Second value cannot be zero');
  
  const decimal = value1 / value2;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  
  const divisor = gcd(Math.round(value1), Math.round(value2));
  const ratio1 = Math.round(value1) / divisor;
  const ratio2 = Math.round(value2) / divisor;
  
  return {
    ratio: `${ratio1}:${ratio2}`,
    decimal,
  };
}

/**
 * Calculate average of multiple values
 */
export function average(...values: number[]): number {
  if (values.length === 0) throw new Error('At least one value required');
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate slope/gradient
 */
export function slope(rise: number, run: number): { percentage: number; degrees: number; ratio: string } {
  if (run === 0) throw new Error('Run cannot be zero');
  
  const percentage = (rise / run) * 100;
  const degrees = Math.atan(rise / run) * (180 / Math.PI);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(Math.abs(rise)), Math.round(Math.abs(run)));
  const ratio = `${Math.round(rise) / divisor}:${Math.round(run) / divisor}`;
  
  return {
    percentage,
    degrees,
    ratio,
  };
}

export default {
  circleArea,
  circlePerimeter,
  rectangleArea,
  rectanglePerimeter,
  cylinderVolume,
  rectangularPrismVolume,
  sphereVolume,
  percentageOf,
  percentageIs,
  ratio,
  average,
  slope,
};
