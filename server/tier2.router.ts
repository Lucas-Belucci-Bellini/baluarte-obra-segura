import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as unitConverters from "./unitConverters";
import * as quickCalcs from "./quickCalculators";

/**
 * TIER 2 ROUTER
 * Handles unit converters and quick calculators
 */
export const tier2Router = router({
  /**
   * UNIT CONVERTERS
   */
  unitConverters: router({
    length: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertLength(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    weight: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertWeight(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    pressure: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertPressure(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    temperature: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertTemperature(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    volume: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertVolume(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    force: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertForce(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    power: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertPower(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    density: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertDensity(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    stress: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertStress(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    energy: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertEnergy(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    flowRate: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertFlowRate(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    velocity: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertVelocity(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    acceleration: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertAcceleration(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    torque: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertTorque(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    viscosity: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertViscosity(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    frequency: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertFrequency(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    angle: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertAngle(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),

    area: publicProcedure
      .input(z.object({ value: z.number(), from: z.string(), to: z.string() }))
      .query(({ input }) => ({
        result: unitConverters.convertArea(input.value, input.from, input.to),
        from: input.from,
        to: input.to,
        value: input.value,
      })),
  }),

  /**
   * QUICK CALCULATORS
   */
  quickCalculators: router({
    circleArea: publicProcedure
      .input(z.object({ radius: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.circleArea(input.radius),
        formula: 'A = π × r²',
        radius: input.radius,
      })),

    circlePerimeter: publicProcedure
      .input(z.object({ radius: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.circlePerimeter(input.radius),
        formula: 'P = 2π × r',
        radius: input.radius,
      })),

    rectangleArea: publicProcedure
      .input(z.object({ width: z.number(), height: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.rectangleArea(input.width, input.height),
        formula: 'A = width × height',
        width: input.width,
        height: input.height,
      })),

    rectanglePerimeter: publicProcedure
      .input(z.object({ width: z.number(), height: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.rectanglePerimeter(input.width, input.height),
        formula: 'P = 2 × (width + height)',
        width: input.width,
        height: input.height,
      })),

    cylinderVolume: publicProcedure
      .input(z.object({ radius: z.number(), height: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.cylinderVolume(input.radius, input.height),
        formula: 'V = π × r² × h',
        radius: input.radius,
        height: input.height,
      })),

    rectangularPrismVolume: publicProcedure
      .input(z.object({ width: z.number(), height: z.number(), depth: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.rectangularPrismVolume(input.width, input.height, input.depth),
        formula: 'V = width × height × depth',
        width: input.width,
        height: input.height,
        depth: input.depth,
      })),

    sphereVolume: publicProcedure
      .input(z.object({ radius: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.sphereVolume(input.radius),
        formula: 'V = (4/3) × π × r³',
        radius: input.radius,
      })),

    percentageOf: publicProcedure
      .input(z.object({ value: z.number(), percentage: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.percentageOf(input.value, input.percentage),
        formula: '(value × percentage) / 100',
        value: input.value,
        percentage: input.percentage,
      })),

    percentageIs: publicProcedure
      .input(z.object({ part: z.number(), whole: z.number() }))
      .query(({ input }) => ({
        result: quickCalcs.percentageIs(input.part, input.whole),
        formula: '(part / whole) × 100',
        part: input.part,
        whole: input.whole,
      })),

    ratio: publicProcedure
      .input(z.object({ value1: z.number(), value2: z.number() }))
      .query(({ input }) => quickCalcs.ratio(input.value1, input.value2)),

    average: publicProcedure
      .input(z.object({ values: z.array(z.number()) }))
      .query(({ input }) => ({
        result: quickCalcs.average(...input.values),
        count: input.values.length,
        values: input.values,
      })),

    slope: publicProcedure
      .input(z.object({ rise: z.number(), run: z.number() }))
      .query(({ input }) => quickCalcs.slope(input.rise, input.run)),
  }),
});
