import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { Search, Package, AlertTriangle, CheckCircle, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';

const RISK_LEVELS = [
  { value: '', label: 'Todos', labelEN: 'All' },
  { value: 'RISCO_ALTO', label: 'Risco Alto', labelEN: 'High Risk' },
  { value: 'ATENCAO', label: 'Atenção', labelEN: 'Attention' },
  { value: 'NORMAL', label: 'Normal', labelEN: 'Normal' },
];

function RiskChip({ level, language }: { level: string; language: string }) {
  const label = level === 'RISCO_ALTO'
    ? (language === 'PT' ? 'Risco Alto' : 'High Risk')
    : level === 'ATENCAO'
    ? (language === 'PT' ? 'Atenção' : 'Attention')
    : (language === 'PT' ? 'Normal' : 'Normal');
  const cls = level === 'RISCO_ALTO' ? 'risk-high' : level === 'ATENCAO' ? 'risk-medium' : 'risk-normal';
  return (
    <span className={cls} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function MaterialCard({ material, language }: { material: any; language: string }) {
  const name = language === 'PT' ? material.namePortuguese : material.nameEnglish;
  const desc = language === 'PT' ? material.descriptionPortuguese : material.descriptionEnglish;

  return (
    <Link href={`/material/${material.id}`}>
      <div className="card card-interactive" style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
              <Package size={18} color="var(--accent)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            </div>
          </div>
          <RiskChip level={material.riskLevel} language={language} />
        </div>
        {desc && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {desc}
          </p>
        )}
        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginTop: 'auto' }}>
          {language === 'PT' ? 'Ver detalhes →' : 'View details →'}
        </div>
      </div>
    </Link>
  );
}

export default function Catalog() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [riskLevel, setRiskLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: materials = [], isLoading } = trpc.materials.list.useQuery({
    categoryId: selectedCategoryId,
    search: debouncedSearch || undefined,
    riskLevel: riskLevel as any || undefined,
    limit: 100,
    offset: 0,
  });

  const displayed = materials.slice(0, offset + limit);
  const hasMore = materials.length > offset + limit;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(val);
      setOffset(0);
    }, 300);
  };

  const handleCategoryChange = (id: number | undefined) => {
    setSelectedCategoryId(id);
    setOffset(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      {/* Header */}
      <section style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>WIKIBUILD</div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            {language === 'PT' ? 'Catálogo de Materiais' : 'Materials Catalog'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 600 }}>
            {language === 'PT'
              ? 'Fichas técnicas, alertas de segurança e comparação de preços para todos os materiais de construção.'
              : 'Technical sheets, safety alerts and price comparison for all construction materials.'}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
            <input
              className="input-dark"
              style={{ paddingLeft: '2.5rem' }}
              placeholder={language === 'PT' ? 'Buscar materiais…' : 'Search materials…'}
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={15} />
            {language === 'PT' ? 'Filtros' : 'Filters'}
            <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            className={`chip${!selectedCategoryId ? ' active' : ''}`}
            onClick={() => handleCategoryChange(undefined)}
          >
            {language === 'PT' ? 'Todas' : 'All'}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`chip${selectedCategoryId === cat.id ? ' active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {language === 'PT' ? cat.namePortuguese : cat.nameEnglish}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{ padding: '1.25rem', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              {language === 'PT' ? 'Nível de risco' : 'Risk level'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {RISK_LEVELS.map(rl => (
                <button
                  key={rl.value}
                  className={`chip${riskLevel === rl.value ? ' active' : ''}`}
                  onClick={() => { setRiskLevel(rl.value); setOffset(0); }}
                >
                  {language === 'PT' ? rl.label : rl.labelEN}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {isLoading ? 'Carregando…' : `${materials.length} ${language === 'PT' ? 'materiais encontrados' : 'materials found'}`}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <Package size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
              {language === 'PT' ? 'Nenhum material encontrado' : 'No materials found'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {language === 'PT' ? 'Tente outros termos ou remova os filtros' : 'Try different terms or remove filters'}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {displayed.map(mat => (
                <MaterialCard key={mat.id} material={mat} language={language} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => setOffset(o => o + limit)}>
                  {language === 'PT' ? 'Carregar mais' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
