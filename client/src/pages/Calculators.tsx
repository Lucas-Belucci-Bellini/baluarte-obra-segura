import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Calculator, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface FieldDef {
  key: string;
  label: string;
  labelEN: string;
  unit?: string;
  type?: 'number' | 'select';
  options?: { value: string; label: string; labelEN: string }[];
  min?: number;
  step?: number;
}

interface CalcDef {
  id: string;
  label: string;
  labelEN: string;
  description: string;
  descriptionEN: string;
  category: string;
  fields: FieldDef[];
  compute: (vals: Record<string, number | string>) => { value: number; unit: string; extra?: string } | null;
}

const CALCULATORS: CalcDef[] = [
  {
    id: 'concrete_volume',
    label: 'Volume de Concreto',
    labelEN: 'Concrete Volume',
    description: 'Calcule o volume de concreto para lajes, vigas e pilares.',
    descriptionEN: 'Calculate concrete volume for slabs, beams and columns.',
    category: 'Estrutural',
    fields: [
      { key: 'length', label: 'Comprimento', labelEN: 'Length', unit: 'm', type: 'number', min: 0, step: 0.01 },
      { key: 'width', label: 'Largura', labelEN: 'Width', unit: 'm', type: 'number', min: 0, step: 0.01 },
      { key: 'height', label: 'Espessura / Altura', labelEN: 'Thickness / Height', unit: 'm', type: 'number', min: 0, step: 0.01 },
      { key: 'waste', label: 'Acréscimo de perda', labelEN: 'Waste factor', unit: '%', type: 'number', min: 0, step: 1 },
    ],
    compute: (v) => {
      const l = Number(v.length), w = Number(v.width), h = Number(v.height), waste = Number(v.waste) || 10;
      if (!l || !w || !h) return null;
      const vol = l * w * h * (1 + waste / 100);
      return { value: vol, unit: 'm³', extra: `Sacos de 50kg (traço 1:2:3): ~${Math.ceil(vol * 8)} sacos` };
    },
  },
  {
    id: 'paint_area',
    label: 'Tinta — Quantidade',
    labelEN: 'Paint — Quantity',
    description: 'Calcule litros de tinta necessários para uma área.',
    descriptionEN: 'Calculate liters of paint needed for an area.',
    category: 'Acabamento',
    fields: [
      { key: 'area', label: 'Área total', labelEN: 'Total area', unit: 'm²', type: 'number', min: 0 },
      { key: 'coats', label: 'Número de demãos', labelEN: 'Number of coats', type: 'number', min: 1, step: 1 },
      { key: 'yield', label: 'Rendimento da tinta', labelEN: 'Paint coverage', unit: 'm²/L', type: 'number', min: 1 },
    ],
    compute: (v) => {
      const area = Number(v.area), coats = Number(v.coats) || 2, yield_ = Number(v.yield) || 10;
      if (!area) return null;
      const liters = (area * coats) / yield_;
      return { value: liters, unit: 'litros', extra: `Latas de 18L: ${Math.ceil(liters / 18)} | Latas de 3,6L: ${Math.ceil(liters / 3.6)}` };
    },
  },
  {
    id: 'tiles',
    label: 'Revestimento — Azulejos/Porcelanato',
    labelEN: 'Tiles / Porcelain',
    description: 'Calcule a quantidade de revestimento com quebra.',
    descriptionEN: 'Calculate tile quantity including waste.',
    category: 'Acabamento',
    fields: [
      { key: 'area', label: 'Área do ambiente', labelEN: 'Room area', unit: 'm²', type: 'number', min: 0 },
      { key: 'tile_size', label: 'Tamanho da peça', labelEN: 'Tile size', type: 'select', options: [
        { value: '0.09', label: '30×30 cm', labelEN: '30×30 cm' },
        { value: '0.16', label: '40×40 cm', labelEN: '40×40 cm' },
        { value: '0.25', label: '50×50 cm', labelEN: '50×50 cm' },
        { value: '0.36', label: '60×60 cm', labelEN: '60×60 cm' },
        { value: '0.64', label: '80×80 cm', labelEN: '80×80 cm' },
        { value: '1.00', label: '100×100 cm', labelEN: '100×100 cm' },
      ]},
      { key: 'waste', label: 'Acréscimo de quebra', labelEN: 'Breakage factor', unit: '%', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const area = Number(v.area), tileM2 = Number(v.tile_size) || 0.36, waste = Number(v.waste) || 10;
      if (!area) return null;
      const qty = Math.ceil((area / tileM2) * (1 + waste / 100));
      const boxes = Math.ceil(qty / Math.round(1 / tileM2));
      return { value: qty, unit: 'peças', extra: `Aprox. ${boxes} caixas (estimativa por peça/m²)` };
    },
  },
  {
    id: 'mortar',
    label: 'Argamassa — Volume',
    labelEN: 'Mortar — Volume',
    description: 'Calcule a quantidade de argamassa para assentamento.',
    descriptionEN: 'Calculate mortar quantity for tiling.',
    category: 'Acabamento',
    fields: [
      { key: 'area', label: 'Área', labelEN: 'Area', unit: 'm²', type: 'number', min: 0 },
      { key: 'thickness', label: 'Espessura da camada', labelEN: 'Layer thickness', unit: 'cm', type: 'number', min: 0, step: 0.5 },
      { key: 'waste', label: 'Acréscimo', labelEN: 'Waste', unit: '%', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const area = Number(v.area), thick = Number(v.thickness) || 3, waste = Number(v.waste) || 15;
      if (!area) return null;
      const vol = area * (thick / 100) * (1 + waste / 100);
      const kg = vol * 1800;
      return { value: vol, unit: 'm³', extra: `Aprox. ${Math.ceil(kg)}kg | Sacos 20kg: ${Math.ceil(kg / 20)}` };
    },
  },
  {
    id: 'electrical_load',
    label: 'Carga Elétrica — Seção do Fio',
    labelEN: 'Electrical Load — Wire Gauge',
    description: 'Determine a seção mínima do condutor para uma carga.',
    descriptionEN: 'Determine the minimum wire gauge for a load.',
    category: 'Elétrica',
    fields: [
      { key: 'power', label: 'Potência total', labelEN: 'Total power', unit: 'W', type: 'number', min: 0 },
      { key: 'voltage', label: 'Tensão', labelEN: 'Voltage', type: 'select', options: [
        { value: '127', label: '127V (monofásico)', labelEN: '127V (single phase)' },
        { value: '220', label: '220V (monofásico)', labelEN: '220V (single phase)' },
        { value: '380', label: '380V (trifásico)', labelEN: '380V (three phase)' },
      ]},
      { key: 'length', label: 'Comprimento do circuito', labelEN: 'Circuit length', unit: 'm', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const power = Number(v.power), voltage = Number(v.voltage) || 127, length = Number(v.length) || 10;
      if (!power) return null;
      const current = power / voltage;
      const resistivity = 0.0000000172;
      const area = (2 * resistivity * length * current) / (voltage * 0.03);
      const standardSizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
      const minSize = standardSizes.find(s => s >= area * 1e6) || 50;
      return { value: current, unit: 'A', extra: `Seção recomendada: ${minSize} mm² | Disjuntor: ${Math.ceil(current * 1.25 / 5) * 5}A` };
    },
  },
  {
    id: 'brick_count',
    label: 'Alvenaria — Quantidade de Tijolos',
    labelEN: 'Masonry — Brick Count',
    description: 'Calcule tijolos necessários para uma parede.',
    descriptionEN: 'Calculate bricks needed for a wall.',
    category: 'Estrutural',
    fields: [
      { key: 'area', label: 'Área da parede', labelEN: 'Wall area', unit: 'm²', type: 'number', min: 0 },
      { key: 'brick_type', label: 'Tipo de tijolo', labelEN: 'Brick type', type: 'select', options: [
        { value: '70', label: 'Tijolo 6 furos (9×14×19 cm) — 70/m²', labelEN: '6-hole brick (9×14×19 cm) — 70/m²' },
        { value: '35', label: 'Tijolo 8 furos (11,5×14×24 cm) — 35/m²', labelEN: '8-hole brick (11.5×14×24 cm) — 35/m²' },
        { value: '13', label: 'Tijolo maciço (5×10×20 cm) — 13/m²', labelEN: 'Solid brick (5×10×20 cm) — 13/m²' },
      ]},
      { key: 'waste', label: 'Quebra', labelEN: 'Waste', unit: '%', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const area = Number(v.area), perM2 = Number(v.brick_type) || 70, waste = Number(v.waste) || 8;
      if (!area) return null;
      const qty = Math.ceil(area * perM2 * (1 + waste / 100));
      return { value: qty, unit: 'tijolos', extra: `Pallets de 500: ${Math.ceil(qty / 500)}` };
    },
  },
  {
    id: 'steel_rebar',
    label: 'Armadura — Peso do Aço',
    labelEN: 'Rebar — Steel Weight',
    description: 'Calcule o peso total de barras de aço CA-50/CA-60.',
    descriptionEN: 'Calculate total weight of CA-50/CA-60 rebar.',
    category: 'Estrutural',
    fields: [
      { key: 'diameter', label: 'Diâmetro', labelEN: 'Diameter', type: 'select', options: [
        { value: '0.222', label: '6mm — 0.222 kg/m', labelEN: '6mm — 0.222 kg/m' },
        { value: '0.395', label: '8mm — 0.395 kg/m', labelEN: '8mm — 0.395 kg/m' },
        { value: '0.617', label: '10mm — 0.617 kg/m', labelEN: '10mm — 0.617 kg/m' },
        { value: '0.888', label: '12mm — 0.888 kg/m', labelEN: '12mm — 0.888 kg/m' },
        { value: '1.578', label: '16mm — 1.578 kg/m', labelEN: '16mm — 1.578 kg/m' },
        { value: '2.466', label: '20mm — 2.466 kg/m', labelEN: '20mm — 2.466 kg/m' },
      ]},
      { key: 'length', label: 'Comprimento total', labelEN: 'Total length', unit: 'm', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const kgPerM = Number(v.diameter) || 0.617, length = Number(v.length);
      if (!length) return null;
      const kg = kgPerM * length;
      return { value: kg, unit: 'kg', extra: `Barras de 12m: ${Math.ceil(length / 12)}` };
    },
  },
  {
    id: 'water_pipe',
    label: 'Hidráulica — Perda de Carga',
    labelEN: 'Hydraulics — Pressure Drop',
    description: 'Estimativa de perda de carga em tubulação PVC.',
    descriptionEN: 'Estimate pressure drop in PVC piping.',
    category: 'Hidráulica',
    fields: [
      { key: 'flow', label: 'Vazão', labelEN: 'Flow rate', unit: 'L/min', type: 'number', min: 0, step: 0.1 },
      { key: 'diameter', label: 'Diâmetro interno', labelEN: 'Internal diameter', unit: 'mm', type: 'select', options: [
        { value: '16', label: '3/4" (16mm)', labelEN: '3/4" (16mm)' },
        { value: '21', label: '1" (21mm)', labelEN: '1" (21mm)' },
        { value: '27', label: '1¼" (27mm)', labelEN: '1¼" (27mm)' },
        { value: '35', label: '1½" (35mm)', labelEN: '1½" (35mm)' },
        { value: '44', label: '2" (44mm)', labelEN: '2" (44mm)' },
      ]},
      { key: 'length', label: 'Comprimento da tubulação', labelEN: 'Pipe length', unit: 'm', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const Q = Number(v.flow) / 60000, D = Number(v.diameter) / 1000 || 0.021, L = Number(v.length) || 10;
      if (!Q) return null;
      const A = Math.PI * (D / 2) ** 2;
      const vel = Q / A;
      const hf = (0.00183 / (D ** 1.22)) * (vel ** 1.77) * L;
      return { value: Math.round(hf * 100) / 100, unit: 'mca', extra: `Velocidade: ${vel.toFixed(2)} m/s | ${vel > 3 ? '⚠️ Alta velocidade, aumente o diâmetro' : '✓ Velocidade adequada'}` };
    },
  },
  {
    id: 'roof_tiles',
    label: 'Cobertura — Telhas por área',
    labelEN: 'Roofing — Tiles per area',
    description: 'Quantidade de telhas para cobertura cerâmica, fibrocimento ou metálica.',
    descriptionEN: 'Tile quantity for ceramic, fiber-cement or metallic roofing.',
    category: 'Cobertura',
    fields: [
      { key: 'area', label: 'Área da cobertura', labelEN: 'Roof area', unit: 'm²', type: 'number', min: 0 },
      { key: 'tile_type', label: 'Tipo de telha', labelEN: 'Tile type', type: 'select', options: [
        { value: '16', label: 'Cerâmica colonial — 16/m²', labelEN: 'Ceramic colonial — 16/m²' },
        { value: '15', label: 'Cerâmica romana — 15/m²', labelEN: 'Ceramic roman — 15/m²' },
        { value: '12', label: 'Cerâmica portuguesa — 12/m²', labelEN: 'Ceramic portuguese — 12/m²' },
        { value: '0.50', label: 'Fibrocimento 2,44m — 0,50/m²', labelEN: 'Fiber-cement 2.44m — 0.50/m²' },
        { value: '0.85', label: 'Metálica trapezoidal — 0,85/m²', labelEN: 'Metallic trapezoidal — 0.85/m²' },
      ]},
      { key: 'waste', label: 'Quebra', labelEN: 'Waste', unit: '%', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const area = Number(v.area), perM2 = Number(v.tile_type), waste = Number(v.waste) || 5;
      if (!area || !perM2) return null;
      const qty = Math.ceil(area * perM2 * (1 + waste / 100));
      const ridge = Math.ceil(Math.sqrt(area) * 1.2);
      return { value: qty, unit: 'peças', extra: `Cumeeira (estimada): ~${ridge} peças | Considere caibros e ripas separadamente.` };
    },
  },
  {
    id: 'stairs',
    label: 'Escadas — Lei de Blondel',
    labelEN: 'Stairs — Blondel formula',
    description: 'Dimensione degraus, espelho e piso (2e + p ≈ 63 cm).',
    descriptionEN: 'Size steps, riser and tread (2r + t ≈ 63 cm).',
    category: 'Estrutural',
    fields: [
      { key: 'height', label: 'Altura total (pé-direito)', labelEN: 'Total rise', unit: 'm', type: 'number', min: 0, step: 0.01 },
      { key: 'run', label: 'Profundidade disponível', labelEN: 'Available run', unit: 'm', type: 'number', min: 0, step: 0.01 },
      { key: 'riser_target', label: 'Espelho desejado', labelEN: 'Target riser', unit: 'cm', type: 'number', min: 14, step: 0.5 },
    ],
    compute: (v) => {
      const H = Number(v.height), L = Number(v.run);
      const target = Number(v.riser_target) || 17.5;
      if (!H) return null;
      const heightCm = H * 100;
      const steps = Math.max(2, Math.round(heightCm / target));
      const riser = heightCm / steps;
      const tread = 63 - 2 * riser;
      const ok = riser >= 14 && riser <= 19 && tread >= 25 && tread <= 32;
      const totalRun = (steps - 1) * tread / 100;
      const fits = !L || totalRun <= L + 0.01;
      const warn = [];
      if (!ok) warn.push('⚠️ Fora da faixa NBR 9050 (espelho 14–19 cm, piso 25–32 cm)');
      if (!fits) warn.push(`⚠️ Comprimento total ${totalRun.toFixed(2)} m > disponível ${L} m`);
      return {
        value: steps,
        unit: 'degraus',
        extra: `Espelho: ${riser.toFixed(1)} cm | Piso: ${tread.toFixed(1)} cm | Comprimento: ${totalRun.toFixed(2)} m${warn.length ? ' · ' + warn.join(' · ') : ' · ✓ Dentro da norma'}`,
      };
    },
  },
  {
    id: 'isolated_footing',
    label: 'Fundação — Sapata isolada',
    labelEN: 'Foundation — Isolated footing',
    description: 'Pré-dimensionamento da sapata pelo método da tensão admissível.',
    descriptionEN: 'Footing sizing by allowable soil pressure.',
    category: 'Fundações',
    fields: [
      { key: 'load', label: 'Carga do pilar', labelEN: 'Column load', unit: 'kN', type: 'number', min: 0 },
      { key: 'soil', label: 'Tensão admissível do solo', labelEN: 'Allowable soil pressure', type: 'select', options: [
        { value: '50', label: 'Argila mole — 50 kPa', labelEN: 'Soft clay — 50 kPa' },
        { value: '150', label: 'Argila rija — 150 kPa', labelEN: 'Stiff clay — 150 kPa' },
        { value: '200', label: 'Areia média — 200 kPa', labelEN: 'Medium sand — 200 kPa' },
        { value: '300', label: 'Areia compacta — 300 kPa', labelEN: 'Dense sand — 300 kPa' },
        { value: '500', label: 'Rocha alterada — 500 kPa', labelEN: 'Weathered rock — 500 kPa' },
      ]},
      { key: 'column_w', label: 'Lado maior do pilar', labelEN: 'Column larger side', unit: 'cm', type: 'number', min: 10 },
    ],
    compute: (v) => {
      const N = Number(v.load), q = Number(v.soil);
      const colW = Number(v.column_w) || 25;
      if (!N || !q) return null;
      const areaNeeded = (N * 1.05) / q;
      const side = Math.sqrt(areaNeeded);
      const sideRounded = Math.ceil(side * 20) / 20;
      const overhang = (sideRounded * 100 - colW) / 2;
      const height = Math.max(20, Math.ceil(overhang / 1.5 / 5) * 5);
      const concreteVol = (sideRounded ** 2) * (height / 100);
      return {
        value: Math.round(sideRounded * 100) / 100,
        unit: 'm × m',
        extra: `Área: ${areaNeeded.toFixed(2)} m² | Altura mínima: ${height} cm | Volume de concreto: ${concreteVol.toFixed(2)} m³ · ⚠️ Confirme com sondagem e cálculo estrutural.`,
      };
    },
  },
  {
    id: 'exterior_paint',
    label: 'Pintura externa — Fachada',
    labelEN: 'Exterior paint — Facade',
    description: 'Tinta para fachada descontando portas e janelas.',
    descriptionEN: 'Facade paint discounting doors and windows.',
    category: 'Acabamento',
    fields: [
      { key: 'wall', label: 'Área bruta da fachada', labelEN: 'Gross facade area', unit: 'm²', type: 'number', min: 0 },
      { key: 'openings', label: 'Área de aberturas (portas + janelas)', labelEN: 'Openings area', unit: 'm²', type: 'number', min: 0 },
      { key: 'coats', label: 'Demãos', labelEN: 'Coats', type: 'number', min: 1, step: 1 },
      { key: 'yield', label: 'Rendimento (m²/L por demão)', labelEN: 'Coverage (m²/L per coat)', type: 'number', min: 1 },
      { key: 'primer', label: 'Incluir selador?', labelEN: 'Include primer?', type: 'select', options: [
        { value: '0', label: 'Não', labelEN: 'No' },
        { value: '1', label: 'Sim (1 demão)', labelEN: 'Yes (1 coat)' },
      ]},
    ],
    compute: (v) => {
      const wall = Number(v.wall), openings = Number(v.openings) || 0;
      const coats = Number(v.coats) || 2, yieldM2 = Number(v.yield) || 8;
      const primer = Number(v.primer) || 0;
      if (!wall) return null;
      const net = Math.max(wall - openings, 0);
      const paintLiters = (net * coats) / yieldM2;
      const primerLiters = (net * primer) / 10;
      const total = paintLiters + primerLiters;
      return {
        value: Math.round(total * 10) / 10,
        unit: 'litros',
        extra: `Área líquida: ${net.toFixed(1)} m² | Tinta: ${paintLiters.toFixed(1)} L | Selador: ${primerLiters.toFixed(1)} L | Galões 18L: ${Math.ceil(total / 18)}`,
      };
    },
  },
  {
    id: 'laminate_floor',
    label: 'Piso laminado — Pacotes',
    labelEN: 'Laminate floor — Boxes',
    description: 'Réguas, manta e rodapé para piso laminado.',
    descriptionEN: 'Boards, underlay and baseboard for laminate floor.',
    category: 'Acabamento',
    fields: [
      { key: 'area', label: 'Área do ambiente', labelEN: 'Room area', unit: 'm²', type: 'number', min: 0 },
      { key: 'box_m2', label: 'Cobertura por caixa', labelEN: 'Coverage per box', type: 'select', options: [
        { value: '2.21', label: '2,21 m²/cx (padrão)', labelEN: '2.21 m²/box (standard)' },
        { value: '2.50', label: '2,50 m²/cx', labelEN: '2.50 m²/box' },
        { value: '3.00', label: '3,00 m²/cx', labelEN: '3.00 m²/box' },
      ]},
      { key: 'perimeter', label: 'Perímetro do ambiente', labelEN: 'Room perimeter', unit: 'm', type: 'number', min: 0 },
      { key: 'waste', label: 'Quebra', labelEN: 'Waste', unit: '%', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const area = Number(v.area), boxM2 = Number(v.box_m2) || 2.21;
      const perim = Number(v.perimeter) || 0, waste = Number(v.waste) || 10;
      if (!area) return null;
      const effective = area * (1 + waste / 100);
      const boxes = Math.ceil(effective / boxM2);
      const underlay = Math.ceil(area * 1.05);
      const baseboard = perim ? Math.ceil(perim / 2.4) : 0;
      return {
        value: boxes,
        unit: 'caixas',
        extra: `Manta acústica: ${underlay} m² | Rodapé (peças 2,4 m): ${baseboard || '—'} | Cola/perfil de transição: à parte`,
      };
    },
  },
  {
    id: 'btu_calc',
    label: 'Climatização — BTUs (ABNT 16401)',
    labelEN: 'HVAC — BTUs (ABNT 16401)',
    description: 'Capacidade de ar-condicionado por área e ocupação.',
    descriptionEN: 'AC capacity by area and occupancy.',
    category: 'Elétrica',
    fields: [
      { key: 'area', label: 'Área do ambiente', labelEN: 'Room area', unit: 'm²', type: 'number', min: 0 },
      { key: 'people', label: 'Pessoas (uso simultâneo)', labelEN: 'People (simultaneous)', type: 'number', min: 1, step: 1 },
      { key: 'sun', label: 'Insolação', labelEN: 'Sun exposure', type: 'select', options: [
        { value: '600', label: 'Sombra (600 BTU/m²)', labelEN: 'Shade (600 BTU/m²)' },
        { value: '750', label: 'Sol indireto (750 BTU/m²)', labelEN: 'Indirect sun (750 BTU/m²)' },
        { value: '900', label: 'Sol direto (900 BTU/m²)', labelEN: 'Direct sun (900 BTU/m²)' },
      ]},
      { key: 'electronics', label: 'TVs / computadores', labelEN: 'TVs / computers', type: 'number', min: 0, step: 1 },
    ],
    compute: (v) => {
      const area = Number(v.area), people = Number(v.people) || 1;
      const sun = Number(v.sun) || 600, elec = Number(v.electronics) || 0;
      if (!area) return null;
      const base = area * sun;
      const extraPeople = Math.max(0, people - 1) * 600;
      const extraElec = elec * 600;
      const total = base + extraPeople + extraElec;
      const standardSizes = [7500, 9000, 10000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 60000];
      const recommended = standardSizes.find(s => s >= total) || 60000;
      return {
        value: Math.ceil(total / 100) * 100,
        unit: 'BTU/h',
        extra: `Aparelho recomendado: ${recommended.toLocaleString('pt-BR')} BTU/h | Sol: +${sun} BTU/m² | Pessoas extras: ${extraPeople} | Eletrônicos: ${extraElec}`,
      };
    },
  },
  {
    id: 'water_tank',
    label: 'Caixa d\'água — Dimensionamento',
    labelEN: 'Water tank — Sizing',
    description: 'Volume mínimo por habitantes e dias de reserva.',
    descriptionEN: 'Minimum volume by occupants and reserve days.',
    category: 'Hidráulica',
    fields: [
      { key: 'people', label: 'Habitantes', labelEN: 'Occupants', type: 'number', min: 1, step: 1 },
      { key: 'consumption', label: 'Consumo per capita', labelEN: 'Per-capita consumption', unit: 'L/dia', type: 'select', options: [
        { value: '120', label: '120 L/dia (econômico)', labelEN: '120 L/day (low)' },
        { value: '150', label: '150 L/dia (residencial padrão)', labelEN: '150 L/day (standard)' },
        { value: '200', label: '200 L/dia (com piscina/jardim)', labelEN: '200 L/day (pool/garden)' },
        { value: '250', label: '250 L/dia (alto padrão)', labelEN: '250 L/day (high)' },
      ]},
      { key: 'days', label: 'Reserva (dias)', labelEN: 'Reserve (days)', type: 'number', min: 1, step: 1 },
      { key: 'fire', label: 'Reserva de incêndio?', labelEN: 'Fire reserve?', type: 'select', options: [
        { value: '0', label: 'Não', labelEN: 'No' },
        { value: '1', label: 'Sim (+15%)', labelEN: 'Yes (+15%)' },
      ]},
    ],
    compute: (v) => {
      const people = Number(v.people), perCapita = Number(v.consumption) || 150;
      const days = Number(v.days) || 1, fire = Number(v.fire) || 0;
      if (!people) return null;
      const daily = people * perCapita;
      const reserve = daily * days;
      const total = reserve * (1 + fire * 0.15);
      const standardSizes = [250, 310, 500, 750, 1000, 1500, 2000, 3000, 5000, 10000];
      const recommended = standardSizes.find(s => s >= total) || Math.ceil(total / 1000) * 1000;
      return {
        value: Math.ceil(total),
        unit: 'litros',
        extra: `Consumo diário: ${daily} L | Reserva técnica recomendada: ${recommended} L (caixa comercial) | NBR 5626 sugere mínimo 1 dia.`,
      };
    },
  },
  {
    id: 'concrete_beam',
    label: 'Viga de concreto — Pré-dimensionamento',
    labelEN: 'Concrete beam — Pre-sizing',
    description: 'Altura mínima da viga pelo vão (regra prática L/10–L/12).',
    descriptionEN: 'Minimum beam height by span (rule of thumb L/10–L/12).',
    category: 'Estrutural',
    fields: [
      { key: 'span', label: 'Vão livre', labelEN: 'Free span', unit: 'm', type: 'number', min: 0, step: 0.1 },
      { key: 'load', label: 'Carga linear', labelEN: 'Linear load', unit: 'kN/m', type: 'number', min: 0, step: 0.5 },
      { key: 'support', label: 'Apoios', labelEN: 'Supports', type: 'select', options: [
        { value: '12', label: 'Bi-apoiada (L/12)', labelEN: 'Simply supported (L/12)' },
        { value: '14', label: 'Contínua (L/14)', labelEN: 'Continuous (L/14)' },
        { value: '8', label: 'Em balanço (L/8)', labelEN: 'Cantilever (L/8)' },
      ]},
    ],
    compute: (v) => {
      const span = Number(v.span), load = Number(v.load) || 0;
      const factor = Number(v.support) || 12;
      if (!span) return null;
      const heightCm = Math.ceil((span * 100) / factor / 5) * 5;
      const widthCm = Math.max(12, Math.ceil(heightCm / 3 / 2) * 2);
      const M = (load * span ** 2) / 8;
      return {
        value: heightCm,
        unit: 'cm de altura',
        extra: `Largura sugerida: ${widthCm} cm | Seção: ${widthCm}×${heightCm} cm${load ? ` | Momento estimado: ${M.toFixed(1)} kN·m` : ''} · ⚠️ Apenas estimativa, requer cálculo estrutural.`,
      };
    },
  },
  {
    id: 'ac_circuit',
    label: 'Ar-condicionado — Bitola e Disjuntor',
    labelEN: 'AC unit — Wire and Breaker',
    description: 'Seção do fio e disjuntor recomendados por BTU.',
    descriptionEN: 'Wire gauge and breaker by BTU.',
    category: 'Elétrica',
    fields: [
      { key: 'btus', label: 'Capacidade', labelEN: 'Capacity', unit: 'BTU', type: 'select', options: [
        { value: '7500', label: '7.500 BTU', labelEN: '7,500 BTU' },
        { value: '9000', label: '9.000 BTU', labelEN: '9,000 BTU' },
        { value: '12000', label: '12.000 BTU', labelEN: '12,000 BTU' },
        { value: '18000', label: '18.000 BTU', labelEN: '18,000 BTU' },
        { value: '24000', label: '24.000 BTU', labelEN: '24,000 BTU' },
        { value: '30000', label: '30.000 BTU', labelEN: '30,000 BTU' },
        { value: '36000', label: '36.000 BTU', labelEN: '36,000 BTU' },
        { value: '60000', label: '60.000 BTU', labelEN: '60,000 BTU' },
      ]},
      { key: 'voltage', label: 'Tensão', labelEN: 'Voltage', type: 'select', options: [
        { value: '127', label: '127V', labelEN: '127V' },
        { value: '220', label: '220V', labelEN: '220V' },
      ]},
      { key: 'efficiency', label: 'Eficiência', labelEN: 'Efficiency', type: 'select', options: [
        { value: '10', label: 'Convencional (10 W/BTU)', labelEN: 'Conventional (10 W/BTU)' },
        { value: '8', label: 'Inverter (8 W/BTU)', labelEN: 'Inverter (8 W/BTU)' },
      ]},
    ],
    compute: (v) => {
      const btus = Number(v.btus), volt = Number(v.voltage) || 220;
      const eff = Number(v.efficiency) || 10;
      if (!btus) return null;
      const watts = (btus / 1000) * eff * 100;
      const amps = watts / volt;
      const ampsDesign = amps * 1.25;
      const wireTable = [[10, 1.5], [16, 2.5], [21, 4], [27, 6], [37, 10], [50, 16], [66, 25]];
      const wire = wireTable.find(([cap]) => cap >= ampsDesign)?.[1] ?? 25;
      const breakerSizes = [10, 16, 20, 25, 32, 40, 50];
      const breaker = breakerSizes.find(b => b >= ampsDesign) ?? 63;
      return {
        value: Math.ceil(amps),
        unit: 'A',
        extra: `Potência: ${Math.round(watts)} W | Bitola: ${wire} mm² | Disjuntor: ${breaker} A | Tomada: ${ampsDesign > 10 ? '20A com aterramento' : '10A com aterramento'}`,
      };
    },
  },
  {
    id: 'lighting',
    label: 'Iluminação — Lúmens (NBR 5413)',
    labelEN: 'Lighting — Lumens (NBR 5413)',
    description: 'Lúmens totais e quantidade de lâmpadas por ambiente.',
    descriptionEN: 'Total lumens and lamp count per room.',
    category: 'Elétrica',
    fields: [
      { key: 'area', label: 'Área do ambiente', labelEN: 'Room area', unit: 'm²', type: 'number', min: 0 },
      { key: 'room_type', label: 'Tipo de ambiente', labelEN: 'Room type', type: 'select', options: [
        { value: '100', label: 'Circulação / corredor (100 lux)', labelEN: 'Hallway (100 lux)' },
        { value: '150', label: 'Quarto (150 lux)', labelEN: 'Bedroom (150 lux)' },
        { value: '200', label: 'Sala / jantar (200 lux)', labelEN: 'Living/dining (200 lux)' },
        { value: '300', label: 'Cozinha / banheiro (300 lux)', labelEN: 'Kitchen/bath (300 lux)' },
        { value: '500', label: 'Escritório (500 lux)', labelEN: 'Office (500 lux)' },
        { value: '750', label: 'Bancada / oficina (750 lux)', labelEN: 'Workbench (750 lux)' },
      ]},
      { key: 'lamp_lumens', label: 'Fluxo da lâmpada', labelEN: 'Lamp output', unit: 'lm', type: 'select', options: [
        { value: '600', label: 'LED 7 W ≈ 600 lm', labelEN: 'LED 7 W ≈ 600 lm' },
        { value: '900', label: 'LED 9 W ≈ 900 lm', labelEN: 'LED 9 W ≈ 900 lm' },
        { value: '1200', label: 'LED 12 W ≈ 1.200 lm', labelEN: 'LED 12 W ≈ 1,200 lm' },
        { value: '1800', label: 'LED 18 W ≈ 1.800 lm', labelEN: 'LED 18 W ≈ 1,800 lm' },
      ]},
    ],
    compute: (v) => {
      const area = Number(v.area), lux = Number(v.room_type) || 200;
      const lampLm = Number(v.lamp_lumens) || 900;
      if (!area) return null;
      const totalLm = area * lux;
      const lamps = Math.ceil(totalLm / lampLm);
      return {
        value: Math.round(totalLm),
        unit: 'lm totais',
        extra: `Lâmpadas necessárias: ${lamps} | Densidade: ${lux} lux | Considere fator de utilização e perdas em forros profundos.`,
      };
    },
  },
  {
    id: 'translucent_tile',
    label: 'Telha translúcida — Cobertura',
    labelEN: 'Translucent tile — Coverage',
    description: '% de área translúcida para iluminação natural.',
    descriptionEN: '% translucent area for natural lighting.',
    category: 'Cobertura',
    fields: [
      { key: 'roof_area', label: 'Área da cobertura', labelEN: 'Roof area', unit: 'm²', type: 'number', min: 0 },
      { key: 'use', label: 'Uso do espaço', labelEN: 'Space use', type: 'select', options: [
        { value: '0.05', label: 'Depósito / garagem (5%)', labelEN: 'Storage / garage (5%)' },
        { value: '0.08', label: 'Galpão geral (8%)', labelEN: 'General shed (8%)' },
        { value: '0.12', label: 'Trabalho leve (12%)', labelEN: 'Light work (12%)' },
        { value: '0.18', label: 'Bancada / leitura (18%)', labelEN: 'Workbench (18%)' },
      ]},
    ],
    compute: (v) => {
      const area = Number(v.roof_area), pct = Number(v.use) || 0.08;
      if (!area) return null;
      const tArea = area * pct;
      const lengthM = Math.ceil(tArea / 1.1);
      return {
        value: Math.round(tArea * 100) / 100,
        unit: 'm² translúcidos',
        extra: `Equivale a ${(pct * 100).toFixed(0)}% da cobertura | Telhas de 1,10 m largura: ~${lengthM} m lineares | Distribua uniformemente, evite concentração no zênite.`,
      };
    },
  },
  {
    id: 'total_cost',
    label: 'Custo total da obra — Estimativa',
    labelEN: 'Total construction cost — Estimate',
    description: 'm² × CUB regional + adicionais (BDI, terreno, projeto).',
    descriptionEN: 'm² × regional unit cost + extras (BDI, land, design).',
    category: 'Geral',
    fields: [
      { key: 'area', label: 'Área construída', labelEN: 'Built area', unit: 'm²', type: 'number', min: 0 },
      { key: 'unit_cost', label: 'CUB / custo regional', labelEN: 'Regional unit cost', type: 'select', options: [
        { value: '1800', label: 'Padrão econômico — R$ 1.800/m²', labelEN: 'Economy — R$ 1,800/m²' },
        { value: '2500', label: 'Padrão normal — R$ 2.500/m²', labelEN: 'Standard — R$ 2,500/m²' },
        { value: '3500', label: 'Padrão alto — R$ 3.500/m²', labelEN: 'High — R$ 3,500/m²' },
        { value: '5500', label: 'Alto luxo — R$ 5.500/m²', labelEN: 'Luxury — R$ 5,500/m²' },
      ]},
      { key: 'bdi', label: 'BDI (mão de obra + lucro)', labelEN: 'BDI (labor + profit)', unit: '%', type: 'number', min: 0, step: 1 },
      { key: 'project', label: 'Projeto e ART/RRT', labelEN: 'Design + ART/RRT', unit: 'R$', type: 'number', min: 0 },
      { key: 'extras', label: 'Adicionais (terreno, terraplenagem, taxas)', labelEN: 'Extras (land, earthwork, fees)', unit: 'R$', type: 'number', min: 0 },
    ],
    compute: (v) => {
      const area = Number(v.area), unit = Number(v.unit_cost) || 2500;
      const bdi = Number(v.bdi) || 0, project = Number(v.project) || 0, extras = Number(v.extras) || 0;
      if (!area) return null;
      const construction = area * unit;
      const withBdi = construction * (1 + bdi / 100);
      const total = withBdi + project + extras;
      const perM2 = total / area;
      return {
        value: Math.round(total),
        unit: 'R$',
        extra: `Construção: R$ ${withBdi.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} | Projeto: R$ ${project.toLocaleString('pt-BR')} | Extras: R$ ${extras.toLocaleString('pt-BR')} | Custo final por m²: R$ ${perM2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      };
    },
  },
];

function CalculatorCard({ calc, language }: { calc: CalcDef; language: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: number; unit: string; extra?: string } | null>(null);

  const label = language === 'PT' ? calc.label : calc.labelEN;
  const desc = language === 'PT' ? calc.description : calc.descriptionEN;

  const handleChange = (key: string, val: string) => {
    const next = { ...values, [key]: val };
    setValues(next);
    const computed = calc.compute(next);
    setResult(computed);
  };

  const reset = () => { setValues({}); setResult(null); };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <button
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', gap: '1rem' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, textAlign: 'left' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
            <Calculator size={18} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem' }}>{label}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
          </div>
        </div>
        <div style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1rem' }}>
            {calc.fields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {language === 'PT' ? field.label : field.labelEN}
                  {field.unit && <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>({field.unit})</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    className="input-dark"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    value={values[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                  >
                    <option value="">{language === 'PT' ? 'Selecionar…' : 'Select…'}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {language === 'PT' ? opt.label : opt.labelEN}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    className="input-dark"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
                    value={values[field.key] || ''}
                    min={field.min}
                    step={field.step || 'any'}
                    onChange={e => handleChange(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          {result && (
            <div style={{ background: 'var(--accent-muted)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, padding: '1rem 1.25rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                {language === 'PT' ? 'Resultado' : 'Result'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>
                {result.value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{result.unit}</span>
              </div>
              {result.extra && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{result.extra}</div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={reset}>
              <RotateCcw size={13} />
              {language === 'PT' ? 'Limpar' : 'Clear'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CATEGORIES = ['Estrutural', 'Acabamento', 'Elétrica', 'Hidráulica', 'Cobertura', 'Fundações', 'Geral'];

export default function Calculators() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('');

  const filtered = activeCategory
    ? CALCULATORS.filter(c => c.category === activeCategory)
    : CALCULATORS;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      {/* Header */}
      <section style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>WIKIBUILD</div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            {language === 'PT' ? 'Calculadoras de Obra' : 'Construction Calculators'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 600 }}>
            {language === 'PT'
              ? 'Calcule volumes de concreto, quantidades de revestimento, cargas elétricas e muito mais — offline, sem cadastro.'
              : 'Calculate concrete volumes, tile quantities, electrical loads and more — offline, no sign-up required.'}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <button
            className={`chip${!activeCategory ? ' active' : ''}`}
            onClick={() => setActiveCategory('')}
          >
            {language === 'PT' ? 'Todas' : 'All'}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Calculators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(calc => (
            <CalculatorCard key={calc.id} calc={calc} language={language} />
          ))}
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '2rem', lineHeight: 1.6 }}>
          {language === 'PT'
            ? 'Estas calculadoras são estimativas. Para projetos estruturais, consulte sempre um engenheiro habilitado.'
            : 'These calculators provide estimates only. For structural projects, always consult a licensed engineer.'}
        </p>
      </div>
    </div>
  );
}
