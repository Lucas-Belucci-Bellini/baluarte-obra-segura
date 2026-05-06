import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as calc from "./calculators";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { calculationResults } from "../drizzle/schema";

/**
 * tRPC Router for Calculator Functions
 * Handles all calculator execution and result management
 */

export const calculatorsRouter = router({
  // ========================================================================
  // CIVIL ENGINEERING CALCULATORS
  // ========================================================================

  concreteVolume: publicProcedure
    .input(
      z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
        shape: z.enum(["rectangular", "circular"]).optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateConcreteVolume(input.length, input.width, input.height, input.shape);
    }),

  rebarQuantity: publicProcedure
    .input(
      z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
        barDiameter: z.number().positive(),
        spacing: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateRebarQuantity(
        input.length,
        input.width,
        input.height,
        input.barDiameter,
        input.spacing
      );
    }),

  foundationLoad: publicProcedure
    .input(
      z.object({
        appliedLoad: z.number().positive(),
        foundationArea: z.number().positive(),
        soilBearingCapacity: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateFoundationLoad(
        input.appliedLoad,
        input.foundationArea,
        input.soilBearingCapacity
      );
    }),

  beamDeflection: publicProcedure
    .input(
      z.object({
        load: z.number().positive(),
        length: z.number().positive(),
        youngModulus: z.number().positive(),
        momentOfInertia: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateBeamDeflection(
        input.load,
        input.length,
        input.youngModulus,
        input.momentOfInertia
      );
    }),

  columnBuckling: publicProcedure
    .input(
      z.object({
        youngModulus: z.number().positive(),
        momentOfInertia: z.number().positive(),
        length: z.number().positive(),
        endCondition: z
          .enum(["fixed-fixed", "pinned-pinned", "fixed-free", "fixed-pinned"])
          .optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateColumnBuckling(
        input.youngModulus,
        input.momentOfInertia,
        input.length,
        input.endCondition
      );
    }),

  concreteStrength: publicProcedure
    .input(
      z.object({
        cementContent: z.number().positive(),
        waterCementRatio: z.number().positive(),
        cureTime: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.estimateConcreteStrength(
        input.cementContent,
        input.waterCementRatio,
        input.cureTime
      );
    }),

  excavationVolume: publicProcedure
    .input(
      z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        depth: z.number().positive(),
        shape: z.enum(["rectangular", "trapezoidal"]).optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateExcavationVolume(input.length, input.width, input.depth, input.shape);
    }),

  // ========================================================================
  // ELECTRICAL ENGINEERING CALCULATORS
  // ========================================================================

  wireGauge: publicProcedure
    .input(
      z.object({
        current: z.number().positive(),
        length: z.number().positive(),
        allowableVoltDrop: z.number().positive().optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateWireGauge(input.current, input.length, input.allowableVoltDrop);
    }),

  voltageDrop: publicProcedure
    .input(
      z.object({
        current: z.number().positive(),
        resistance: z.number().positive(),
        length: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateVoltageDrop(input.current, input.resistance, input.length);
    }),

  circuitBreaker: publicProcedure
    .input(
      z.object({
        loadCurrent: z.number().positive(),
        safetyFactor: z.number().positive().optional(),
      })
    )
    .query(({ input }) => {
      return calc.selectCircuitBreaker(input.loadCurrent, input.safetyFactor);
    }),

  transformerSize: publicProcedure
    .input(
      z.object({
        totalLoad: z.number().positive(),
        powerFactor: z.number().positive().optional(),
        demandFactor: z.number().positive().optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateTransformerSize(
        input.totalLoad,
        input.powerFactor,
        input.demandFactor
      );
    }),

  powerFactor: publicProcedure
    .input(
      z.object({
        activePower: z.number().positive(),
        apparentPower: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculatePowerFactor(input.activePower, input.apparentPower);
    }),

  threePhasePower: publicProcedure
    .input(
      z.object({
        voltage: z.number().positive(),
        current: z.number().positive(),
        powerFactor: z.number().positive().optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateThreePhasePower(
        input.voltage,
        input.current,
        input.powerFactor
      );
    }),

  // ========================================================================
  // HYDRAULIC ENGINEERING CALCULATORS
  // ========================================================================

  pipeFlow: publicProcedure
    .input(
      z.object({
        pipeDiameter: z.number().positive(),
        flowVelocity: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculatePipeFlow(input.pipeDiameter, input.flowVelocity);
    }),

  pumpSelection: publicProcedure
    .input(
      z.object({
        requiredFlow: z.number().positive(),
        requiredHead: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.selectPump(input.requiredFlow, input.requiredHead);
    }),

  valveSize: publicProcedure
    .input(
      z.object({
        flowRate: z.number().positive(),
        maxVelocity: z.number().positive().optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateValveSize(input.flowRate, input.maxVelocity);
    }),

  pressureDrop: publicProcedure
    .input(
      z.object({
        flowRate: z.number().positive(),
        pipeDiameter: z.number().positive(),
        pipeLength: z.number().positive(),
        roughness: z.number().positive().optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculatePressureDrop(
        input.flowRate,
        input.pipeDiameter,
        input.pipeLength,
        input.roughness
      );
    }),

  hydraulicCylinder: publicProcedure
    .input(
      z.object({
        pressure: z.number().positive(),
        rodDiameter: z.number().positive(),
        cylinderDiameter: z.number().positive(),
        flowRate: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateHydraulicCylinder(
        input.pressure,
        input.rodDiameter,
        input.cylinderDiameter,
        input.flowRate
      );
    }),

  fluidDensity: publicProcedure
    .input(
      z.object({
        baseTemperature: z.number(),
        currentTemperature: z.number(),
        baseDensity: z.number().positive().optional(),
        thermalExpansionCoefficient: z.number().positive().optional(),
      })
    )
    .query(({ input }) => {
      return calc.calculateFluidDensity(
        input.baseTemperature,
        input.currentTemperature,
        input.baseDensity,
        input.thermalExpansionCoefficient
      );
    }),

  // ========================================================================
  // MECHANICAL ENGINEERING CALCULATORS
  // ========================================================================

  stress: publicProcedure
    .input(
      z.object({
        force: z.number(),
        area: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateStress(input.force, input.area);
    }),

  torque: publicProcedure
    .input(
      z.object({
        force: z.number().positive(),
        momentArm: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateTorque(input.force, input.momentArm);
    }),

  gearRatio: publicProcedure
    .input(
      z.object({
        driverTeeth: z.number().positive(),
        drivenTeeth: z.number().positive(),
        driverSpeed: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateGearRatio(
        input.driverTeeth,
        input.drivenTeeth,
        input.driverSpeed
      );
    }),

  beltDrive: publicProcedure
    .input(
      z.object({
        pulleyDiameter1: z.number().positive(),
        pulleyDiameter2: z.number().positive(),
        centerDistance: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateBeltDrive(
        input.pulleyDiameter1,
        input.pulleyDiameter2,
        input.centerDistance
      );
    }),

  bearingLife: publicProcedure
    .input(
      z.object({
        basicDynamicLoad: z.number().positive(),
        actualLoad: z.number().positive(),
        speed: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateBearingLife(
        input.basicDynamicLoad,
        input.actualLoad,
        input.speed
      );
    }),

  thermalExpansion: publicProcedure
    .input(
      z.object({
        originalLength: z.number().positive(),
        temperatureChange: z.number(),
        linearExpansionCoefficient: z.number().positive(),
      })
    )
    .query(({ input }) => {
      return calc.calculateThermalExpansion(
        input.originalLength,
        input.temperatureChange,
        input.linearExpansionCoefficient
      );
    }),

  // ========================================================================
  // CALCULATION MANAGEMENT
  // ========================================================================

  saveCalculation: protectedProcedure
    .input(
      z.object({
        calculatorId: z.number(),
        inputs: z.record(z.string(), z.any()),
        outputs: z.record(z.string(), z.any()),
        projectId: z.number().optional(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return null;

      const result = await db.insert(calculationResults).values({
        userId: ctx.user.id,
        calculatorId: input.calculatorId,
        inputs: JSON.stringify(input.inputs),
        outputs: JSON.stringify(input.outputs),
        projectId: input.projectId,
        name: input.name,
      });

      return result;
    }),

  getCalculationHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return [];

      const results = await db
        .select()
        .from(calculationResults)
        .where(eq(calculationResults.userId, ctx.user.id))
        .limit(input.limit)
        .offset(input.offset);

      return results.map((r) => ({
        ...r,
        inputs: r.inputs ? JSON.parse(r.inputs) : null,
        outputs: r.outputs ? JSON.parse(r.outputs) : null,
      }));
    }),

  deleteCalculation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return null;

      await db.delete(calculationResults).where(eq(calculationResults.id, input.id));

      return { success: true };
    }),
});
