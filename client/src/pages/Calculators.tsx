import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalculatorInterface } from '@/components/CalculatorInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

type SpecialtyType = 'civil' | 'electrical' | 'hydraulic' | 'mechanical';

interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  specialty: SpecialtyType;
  fields: Array<{
    name: string;
    label: string;
    type: 'number' | 'select' | 'text';
    required?: boolean;
    options?: { value: string; label: string }[];
    unit?: string;
  }>;
  procedure: string;
}

const calculators: CalculatorConfig[] = [
  // CIVIL
  {
    id: 'concrete-volume',
    name: 'Concrete Volume Calculator',
    description: 'Calculate volume for slabs, beams, and columns',
    specialty: 'civil',
    fields: [
      { name: 'length', label: 'Length', type: 'number', required: true, unit: 'm' },
      { name: 'width', label: 'Width', type: 'number', required: true, unit: 'm' },
      { name: 'height', label: 'Height', type: 'number', required: true, unit: 'm' },
      {
        name: 'shape',
        label: 'Shape',
        type: 'select',
        options: [
          { value: 'rectangular', label: 'Rectangular' },
          { value: 'circular', label: 'Circular' },
        ],
      },
    ],
    procedure: 'concreteVolume',
  },
  {
    id: 'rebar-quantity',
    name: 'Rebar Quantity Calculator',
    description: 'Calculate steel reinforcement needed',
    specialty: 'civil',
    fields: [
      { name: 'length', label: 'Length', type: 'number', required: true, unit: 'm' },
      { name: 'width', label: 'Width', type: 'number', required: true, unit: 'm' },
      { name: 'height', label: 'Height', type: 'number', required: true, unit: 'm' },
      { name: 'barDiameter', label: 'Bar Diameter', type: 'number', required: true, unit: 'mm' },
      { name: 'spacing', label: 'Spacing', type: 'number', required: true, unit: 'cm' },
    ],
    procedure: 'rebarQuantity',
  },
  {
    id: 'foundation-load',
    name: 'Foundation Load Calculator',
    description: 'Calculate bearing capacity and settlement',
    specialty: 'civil',
    fields: [
      { name: 'appliedLoad', label: 'Applied Load', type: 'number', required: true, unit: 'kN' },
      { name: 'foundationArea', label: 'Foundation Area', type: 'number', required: true, unit: 'm²' },
      { name: 'soilBearingCapacity', label: 'Soil Bearing Capacity', type: 'number', required: true, unit: 'kPa' },
    ],
    procedure: 'foundationLoad',
  },
  {
    id: 'beam-deflection',
    name: 'Beam Deflection Calculator',
    description: 'Calculate deflection under load',
    specialty: 'civil',
    fields: [
      { name: 'load', label: 'Load', type: 'number', required: true, unit: 'kN' },
      { name: 'length', label: 'Length', type: 'number', required: true, unit: 'm' },
      { name: 'youngModulus', label: 'Young Modulus', type: 'number', required: true, unit: 'GPa' },
      { name: 'momentOfInertia', label: 'Moment of Inertia', type: 'number', required: true, unit: 'cm⁴' },
    ],
    procedure: 'beamDeflection',
  },
  {
    id: 'column-buckling',
    name: 'Column Buckling Calculator',
    description: 'Calculate critical buckling load',
    specialty: 'civil',
    fields: [
      { name: 'youngModulus', label: 'Young Modulus', type: 'number', required: true, unit: 'GPa' },
      { name: 'momentOfInertia', label: 'Moment of Inertia', type: 'number', required: true, unit: 'cm⁴' },
      { name: 'length', label: 'Length', type: 'number', required: true, unit: 'm' },
      {
        name: 'endCondition',
        label: 'End Condition',
        type: 'select',
        options: [
          { value: 'fixed-fixed', label: 'Fixed-Fixed' },
          { value: 'pinned-pinned', label: 'Pinned-Pinned' },
          { value: 'fixed-free', label: 'Fixed-Free' },
          { value: 'fixed-pinned', label: 'Fixed-Pinned' },
        ],
      },
    ],
    procedure: 'columnBuckling',
  },
  {
    id: 'concrete-strength',
    name: 'Concrete Strength Estimator',
    description: 'Estimate strength based on mix design',
    specialty: 'civil',
    fields: [
      { name: 'cementContent', label: 'Cement Content', type: 'number', required: true, unit: 'kg/m³' },
      { name: 'waterCementRatio', label: 'Water-Cement Ratio', type: 'number', required: true },
      { name: 'cureTime', label: 'Cure Time', type: 'number', required: true, unit: 'days' },
    ],
    procedure: 'concreteStrength',
  },
  {
    id: 'excavation-volume',
    name: 'Excavation Volume Calculator',
    description: 'Calculate cut/fill volumes',
    specialty: 'civil',
    fields: [
      { name: 'length', label: 'Length', type: 'number', required: true, unit: 'm' },
      { name: 'width', label: 'Width', type: 'number', required: true, unit: 'm' },
      { name: 'depth', label: 'Depth', type: 'number', required: true, unit: 'm' },
      {
        name: 'shape',
        label: 'Shape',
        type: 'select',
        options: [
          { value: 'rectangular', label: 'Rectangular' },
          { value: 'trapezoidal', label: 'Trapezoidal' },
        ],
      },
    ],
    procedure: 'excavationVolume',
  },

  // ELECTRICAL
  {
    id: 'wire-gauge',
    name: 'Wire Gauge Calculator',
    description: 'Calculate correct wire size for current',
    specialty: 'electrical',
    fields: [
      { name: 'current', label: 'Current', type: 'number', required: true, unit: 'A' },
      { name: 'length', label: 'Length', type: 'number', required: true, unit: 'm' },
      { name: 'allowableVoltDrop', label: 'Allowable Voltage Drop', type: 'number', unit: '%' },
    ],
    procedure: 'wireGauge',
  },
  {
    id: 'voltage-drop',
    name: 'Voltage Drop Calculator',
    description: 'Calculate voltage drop in circuits',
    specialty: 'electrical',
    fields: [
      { name: 'current', label: 'Current', type: 'number', required: true, unit: 'A' },
      { name: 'resistance', label: 'Resistance', type: 'number', required: true, unit: 'Ω' },
      { name: 'length', label: 'Length', type: 'number', required: true, unit: 'm' },
    ],
    procedure: 'voltageDrop',
  },
  {
    id: 'circuit-breaker',
    name: 'Circuit Breaker Selector',
    description: 'Select appropriate breaker size',
    specialty: 'electrical',
    fields: [
      { name: 'loadCurrent', label: 'Load Current', type: 'number', required: true, unit: 'A' },
      { name: 'safetyFactor', label: 'Safety Factor', type: 'number', unit: 'x' },
    ],
    procedure: 'circuitBreaker',
  },
  {
    id: 'transformer-size',
    name: 'Transformer Sizing Calculator',
    description: 'Calculate transformer capacity needed',
    specialty: 'electrical',
    fields: [
      { name: 'totalLoad', label: 'Total Load', type: 'number', required: true, unit: 'kW' },
      { name: 'powerFactor', label: 'Power Factor', type: 'number', unit: 'PF' },
      { name: 'demandFactor', label: 'Demand Factor', type: 'number', unit: 'x' },
    ],
    procedure: 'transformerSize',
  },
  {
    id: 'power-factor',
    name: 'Power Factor Calculator',
    description: 'Calculate reactive power and corrections',
    specialty: 'electrical',
    fields: [
      { name: 'activePower', label: 'Active Power', type: 'number', required: true, unit: 'kW' },
      { name: 'apparentPower', label: 'Apparent Power', type: 'number', required: true, unit: 'kVA' },
    ],
    procedure: 'powerFactor',
  },
  {
    id: 'three-phase-power',
    name: 'Three-Phase Power Calculator',
    description: 'Calculate power in 3-phase systems',
    specialty: 'electrical',
    fields: [
      { name: 'voltage', label: 'Voltage', type: 'number', required: true, unit: 'V' },
      { name: 'current', label: 'Current', type: 'number', required: true, unit: 'A' },
      { name: 'powerFactor', label: 'Power Factor', type: 'number', unit: 'PF' },
    ],
    procedure: 'threePhasePower',
  },

  // HYDRAULIC
  {
    id: 'pipe-flow',
    name: 'Pipe Flow Calculator',
    description: 'Calculate flow rate and pressure drop',
    specialty: 'hydraulic',
    fields: [
      { name: 'pipeDiameter', label: 'Pipe Diameter', type: 'number', required: true, unit: 'mm' },
      { name: 'flowVelocity', label: 'Flow Velocity', type: 'number', required: true, unit: 'm/s' },
    ],
    procedure: 'pipeFlow',
  },
  {
    id: 'pump-selection',
    name: 'Pump Selection Tool',
    description: 'Select pump based on flow/pressure requirements',
    specialty: 'hydraulic',
    fields: [
      { name: 'requiredFlow', label: 'Required Flow', type: 'number', required: true, unit: 'L/min' },
      { name: 'requiredHead', label: 'Required Head', type: 'number', required: true, unit: 'm' },
    ],
    procedure: 'pumpSelection',
  },
  {
    id: 'valve-size',
    name: 'Valve Sizing Calculator',
    description: 'Calculate valve size for flow control',
    specialty: 'hydraulic',
    fields: [
      { name: 'flowRate', label: 'Flow Rate', type: 'number', required: true, unit: 'L/min' },
      { name: 'maxVelocity', label: 'Max Velocity', type: 'number', unit: 'm/s' },
    ],
    procedure: 'valveSize',
  },
  {
    id: 'pressure-drop',
    name: 'Pressure Drop Calculator',
    description: 'Calculate pressure loss in piping',
    specialty: 'hydraulic',
    fields: [
      { name: 'flowRate', label: 'Flow Rate', type: 'number', required: true, unit: 'L/min' },
      { name: 'pipeDiameter', label: 'Pipe Diameter', type: 'number', required: true, unit: 'mm' },
      { name: 'pipeLength', label: 'Pipe Length', type: 'number', required: true, unit: 'm' },
      { name: 'roughness', label: 'Roughness', type: 'number', unit: 'mm' },
    ],
    procedure: 'pressureDrop',
  },
  {
    id: 'hydraulic-cylinder',
    name: 'Hydraulic Cylinder Calculator',
    description: 'Calculate force and speed',
    specialty: 'hydraulic',
    fields: [
      { name: 'pressure', label: 'Pressure', type: 'number', required: true, unit: 'bar' },
      { name: 'rodDiameter', label: 'Rod Diameter', type: 'number', required: true, unit: 'mm' },
      { name: 'cylinderDiameter', label: 'Cylinder Diameter', type: 'number', required: true, unit: 'mm' },
      { name: 'flowRate', label: 'Flow Rate', type: 'number', required: true, unit: 'L/min' },
    ],
    procedure: 'hydraulicCylinder',
  },
  {
    id: 'fluid-density',
    name: 'Fluid Density Calculator',
    description: 'Calculate density at different temperatures',
    specialty: 'hydraulic',
    fields: [
      { name: 'baseTemperature', label: 'Base Temperature', type: 'number', required: true, unit: '°C' },
      { name: 'currentTemperature', label: 'Current Temperature', type: 'number', required: true, unit: '°C' },
      { name: 'baseDensity', label: 'Base Density', type: 'number', unit: 'kg/m³' },
      { name: 'thermalExpansionCoefficient', label: 'Thermal Expansion Coefficient', type: 'number' },
    ],
    procedure: 'fluidDensity',
  },

  // MECHANICAL
  {
    id: 'stress',
    name: 'Stress Calculator',
    description: 'Calculate stress in materials',
    specialty: 'mechanical',
    fields: [
      { name: 'force', label: 'Force', type: 'number', required: true, unit: 'N' },
      { name: 'area', label: 'Area', type: 'number', required: true, unit: 'mm²' },
    ],
    procedure: 'stress',
  },
  {
    id: 'torque',
    name: 'Torque Calculator',
    description: 'Calculate torque and rotational force',
    specialty: 'mechanical',
    fields: [
      { name: 'force', label: 'Force', type: 'number', required: true, unit: 'N' },
      { name: 'momentArm', label: 'Moment Arm', type: 'number', required: true, unit: 'm' },
    ],
    procedure: 'torque',
  },
  {
    id: 'gear-ratio',
    name: 'Gear Ratio Calculator',
    description: 'Calculate gear ratios and speeds',
    specialty: 'mechanical',
    fields: [
      { name: 'driverTeeth', label: 'Driver Teeth', type: 'number', required: true },
      { name: 'drivenTeeth', label: 'Driven Teeth', type: 'number', required: true },
      { name: 'driverSpeed', label: 'Driver Speed', type: 'number', required: true, unit: 'rpm' },
    ],
    procedure: 'gearRatio',
  },
  {
    id: 'belt-drive',
    name: 'Belt Drive Calculator',
    description: 'Calculate belt length and tension',
    specialty: 'mechanical',
    fields: [
      { name: 'pulleyDiameter1', label: 'Pulley 1 Diameter', type: 'number', required: true, unit: 'mm' },
      { name: 'pulleyDiameter2', label: 'Pulley 2 Diameter', type: 'number', required: true, unit: 'mm' },
      { name: 'centerDistance', label: 'Center Distance', type: 'number', required: true, unit: 'mm' },
    ],
    procedure: 'beltDrive',
  },
  {
    id: 'bearing-life',
    name: 'Bearing Life Calculator',
    description: 'Calculate bearing service life (L10)',
    specialty: 'mechanical',
    fields: [
      { name: 'basicDynamicLoad', label: 'Basic Dynamic Load', type: 'number', required: true, unit: 'N' },
      { name: 'actualLoad', label: 'Actual Load', type: 'number', required: true, unit: 'N' },
      { name: 'speed', label: 'Speed', type: 'number', required: true, unit: 'rpm' },
    ],
    procedure: 'bearingLife',
  },
  {
    id: 'thermal-expansion',
    name: 'Thermal Expansion Calculator',
    description: 'Calculate material expansion',
    specialty: 'mechanical',
    fields: [
      { name: 'originalLength', label: 'Original Length', type: 'number', required: true, unit: 'm' },
      { name: 'temperatureChange', label: 'Temperature Change', type: 'number', required: true, unit: '°C' },
      { name: 'linearExpansionCoefficient', label: 'Linear Expansion Coefficient', type: 'number', required: true, unit: '1/°C' },
    ],
    procedure: 'thermalExpansion',
  },
];

export default function Calculators() {
  const { language } = useLanguage();
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyType | null>(null);
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorConfig | null>(null);

  const specialties = [
    { id: 'civil', name: 'Civil', icon: '🏗️', color: 'bg-blue-100 text-blue-700' },
    { id: 'electrical', name: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'hydraulic', name: 'Hydraulic', icon: '💧', color: 'bg-cyan-100 text-cyan-700' },
    { id: 'mechanical', name: 'Mechanical', icon: '⚙️', color: 'bg-orange-100 text-orange-700' },
  ];

  const filteredCalculators = selectedSpecialty
    ? calculators.filter((c) => c.specialty === selectedSpecialty)
    : calculators;

  if (selectedCalculator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Button
            variant="outline"
            onClick={() => setSelectedCalculator(null)}
            className="mb-6"
          >
            ← {language === 'PT' ? 'Voltar' : 'Back'}
          </Button>
          <CalculatorInterface
            title={selectedCalculator.name}
            description={selectedCalculator.description}
            fields={selectedCalculator.fields}
            specialty={selectedCalculator.specialty}
            onCalculate={async (inputs) => {
              const procedure = (trpc.calculators as any)[selectedCalculator.procedure];
              if (!procedure) throw new Error('Calculator not found');
              return procedure.useQuery(inputs);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">
            {language === 'PT' ? 'Calculadores de Engenharia' : 'Engineering Calculators'}
          </h1>
          <p className="text-lg opacity-90">
            {language === 'PT'
              ? '25 ferramentas profissionais para cálculos de engenharia'
              : '25 professional tools for engineering calculations'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Specialty Filter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Button
            onClick={() => setSelectedSpecialty(null)}
            variant={selectedSpecialty === null ? 'default' : 'outline'}
            className="h-20 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-xs">{language === 'PT' ? 'Todos' : 'All'}</span>
          </Button>
          {specialties.map((specialty) => (
            <Button
              key={specialty.id}
              onClick={() => setSelectedSpecialty(specialty.id as SpecialtyType)}
              variant={selectedSpecialty === specialty.id ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">{specialty.icon}</span>
              <span className="text-xs">{specialty.name}</span>
            </Button>
          ))}
        </div>

        {/* Calculators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalculators.map((calc) => (
            <Card
              key={calc.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCalculator(calc)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex-1">{calc.name}</h3>
                <span className="text-2xl">
                  {calc.specialty === 'civil' && '🏗️'}
                  {calc.specialty === 'electrical' && '⚡'}
                  {calc.specialty === 'hydraulic' && '💧'}
                  {calc.specialty === 'mechanical' && '⚙️'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{calc.description}</p>
              <Button variant="outline" className="w-full">
                {language === 'PT' ? 'Usar Calculadora' : 'Use Calculator'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
