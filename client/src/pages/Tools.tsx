import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { SaveButton } from '@/components/SaveButton';
import { AddToProjectButton } from '@/components/AddToProjectButton';
import { trpc } from '@/lib/trpc';
import { Wrench, Zap, Battery, Hand, Wind, Droplets, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const POWER_TYPES = [
  { value: '', label: 'Todos', labelEN: 'All' },
  { value: 'corded', label: 'Com fio', labelEN: 'Corded' },
  { value: 'battery', label: 'À bateria', labelEN: 'Battery' },
  { value: 'manual', label: 'Manual', labelEN: 'Manual' },
  { value: 'pneumatic', label: 'Pneumático', labelEN: 'Pneumatic' },
  { value: 'hydraulic', label: 'Hidráulico', labelEN: 'Hydraulic' },
];

const PROFESSION_LEVELS = [
  { value: '', label: 'Todos os níveis', labelEN: 'All levels' },
  { value: 'beginner', label: 'Iniciante', labelEN: 'Beginner' },
  { value: 'intermediate', label: 'Intermediário', labelEN: 'Intermediate' },
  { value: 'professional', label: 'Profissional', labelEN: 'Professional' },
];

const POWER_ICONS: Record<string, typeof Wrench> = {
  corded: Zap,
  battery: Battery,
  manual: Hand,
  pneumatic: Wind,
  hydraulic: Droplets,
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'var(--success)',
  intermediate: 'var(--warning)',
  professional: 'var(--accent)',
};

function ToolCard({ tool, language }: { tool: any; language: string }) {
  const name = language === 'PT' ? tool.namePortuguese : tool.nameEnglish;
  const desc = language === 'PT' ? tool.descriptionPortuguese : tool.descriptionEnglish;
  const PowerIcon = POWER_ICONS[tool.powerType] || Wrench;
  const levelColor = LEVEL_COLORS[tool.professionLevel] || 'var(--text-muted)';

  return (
    <div className="card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, display: 'flex', gap: 4 }}>
        <AddToProjectButton itemType="tool" itemId={tool.id} iconOnly />
        <SaveButton itemType="tool" itemId={tool.id} iconOnly />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', paddingRight: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PowerIcon size={22} color="var(--accent)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {POWER_TYPES.find(p => p.value === tool.powerType)?.[language === 'PT' ? 'label' : 'labelEN'] || tool.powerType}
            </div>
          </div>
        </div>
      </div>
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: levelColor, background: levelColor + '18', border: `1px solid ${levelColor}30`, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
          {PROFESSION_LEVELS.find(l => l.value === tool.professionLevel)?.[language === 'PT' ? 'label' : 'labelEN'] || tool.professionLevel}
        </span>
      </div>

      {desc && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {desc}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
        {tool.basePrice ? (
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>a partir de</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent)' }}>
              R$ {parseFloat(tool.basePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>Consulte o preço</div>
        )}
        {tool.safetyRating && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⭐ {tool.safetyRating}/5</span>
        )}
      </div>
    </div>
  );
}

export default function Tools() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [powerType, setPowerType] = useState('');
  const [professionLevel, setProfessionLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 12;

  const { data: toolCategories = [] } = trpc.toolCategories.list.useQuery();
  const { data: tools = [], isLoading } = trpc.tools.list.useQuery({
    toolCategoryId: selectedCategory,
    search: debouncedSearch || undefined,
    powerType: powerType as any || undefined,
    professionLevel: professionLevel as any || undefined,
    limit: 100,
    offset: 0,
  });

  const displayed = tools.slice(0, offset + limit);
  const hasMore = tools.length > offset + limit;

  let searchTimeout: ReturnType<typeof setTimeout>;
  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setDebouncedSearch(val);
      setOffset(0);
    }, 300);
  };

  const handleCategoryChange = (id: number | undefined) => {
    setSelectedCategory(id);
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
            {language === 'PT' ? 'Ferramentas de Obra' : 'Construction Tools'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 600 }}>
            {language === 'PT'
              ? 'Furadeiras, parafusadeiras, EPI e muito mais. Compare especificações e encontre a ferramenta certa para cada trabalho.'
              : 'Drills, screwdrivers, PPE and more. Compare specs and find the right tool for every job.'}
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
              placeholder={language === 'PT' ? 'Buscar ferramentas…' : 'Search tools…'}
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <SlidersHorizontal size={15} />
            {language === 'PT' ? 'Filtros' : 'Filters'}
            <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            className={`chip${!selectedCategory ? ' active' : ''}`}
            onClick={() => handleCategoryChange(undefined)}
          >
            {language === 'PT' ? 'Todas' : 'All'}
          </button>
          {toolCategories.map(cat => (
            <button
              key={cat.id}
              className={`chip${selectedCategory === cat.id ? ' active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {language === 'PT' ? cat.namePortuguese : cat.nameEnglish}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                {language === 'PT' ? 'Tipo de alimentação' : 'Power type'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {POWER_TYPES.map(pt => (
                  <button
                    key={pt.value}
                    className={`chip${powerType === pt.value ? ' active' : ''}`}
                    onClick={() => { setPowerType(pt.value); setOffset(0); }}
                  >
                    {language === 'PT' ? pt.label : pt.labelEN}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                {language === 'PT' ? 'Nível profissional' : 'Professional level'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {PROFESSION_LEVELS.map(pl => (
                  <button
                    key={pl.value}
                    className={`chip${professionLevel === pl.value ? ' active' : ''}`}
                    onClick={() => { setProfessionLevel(pl.value); setOffset(0); }}
                  >
                    {language === 'PT' ? pl.label : pl.labelEN}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {isLoading ? (
            <span>Carregando…</span>
          ) : (
            <span>{tools.length} {language === 'PT' ? 'ferramentas encontradas' : 'tools found'}</span>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 12 }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <Wrench size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
              {language === 'PT' ? 'Nenhuma ferramenta encontrada' : 'No tools found'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {language === 'PT' ? 'Tente outros termos ou remova os filtros' : 'Try different terms or remove filters'}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {displayed.map(tool => (
                <ToolCard key={tool.id} tool={tool} language={language} />
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
