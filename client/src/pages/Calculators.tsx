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

const CATEGORIES = ['Estrutural', 'Acabamento', 'Elétrica', 'Hidráulica'];

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
