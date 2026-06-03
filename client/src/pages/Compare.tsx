import { useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { GitCompareArrows, Package, Wrench, AlertTriangle, ShieldAlert, ShieldCheck, DollarSign, ArrowLeft, Share2, Store, Check } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type ParsedItem = { type: 'material' | 'tool'; id: number };

function parseItems(param: string | null): ParsedItem[] {
  if (!param) return [];
  return param.split(',')
    .slice(0, 4)
    .map(s => {
      const m = s.match(/^([mt])-(\d+)$/);
      if (!m) return null;
      return { type: m[1] === 'm' ? 'material' : 'tool', id: parseInt(m[2]) } as ParsedItem;
    })
    .filter(Boolean) as ParsedItem[];
}

function RiskChip({ level, language }: { level: string; language: string }) {
  const label = level === 'RISCO_ALTO'
    ? (language === 'PT' ? 'Risco Alto' : 'High Risk')
    : level === 'ATENCAO'
    ? (language === 'PT' ? 'Atenção' : 'Attention')
    : (language === 'PT' ? 'Normal' : 'Normal');
  const cls = level === 'RISCO_ALTO' ? 'risk-high' : level === 'ATENCAO' ? 'risk-medium' : 'risk-normal';
  const Icon = level === 'RISCO_ALTO' ? ShieldAlert : level === 'ATENCAO' ? AlertTriangle : ShieldCheck;
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
      <Icon size={11} />{label}
    </span>
  );
}

function MaterialColumn({ id, language }: { id: number; language: string }) {
  const { data, isLoading } = trpc.materials.byId.useQuery(id, { staleTime: 60_000 });
  if (isLoading) return <td><div className="skeleton" style={{ height: 200, borderRadius: 8 }} /></td>;
  if (!data) return <td><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span></td>;
  const name = language === 'PT' ? data.namePortuguese : data.nameEnglish;
  const desc = language === 'PT' ? data.descriptionPortuguese : data.descriptionEnglish;
  const specs = language === 'PT' ? (data as any).technicalSpecsPortuguese : (data as any).technicalSpecsEnglish;
  const warnings = language === 'PT' ? (data as any).safetyWarningsPortuguese : (data as any).safetyWarningsEnglish;
  const prices = (data as any).prices || [];
  const avgPrice = prices.length > 0
    ? prices.reduce((s: number, p: any) => s + parseFloat(p.price.price || '0'), 0) / prices.length
    : parseFloat((data as any).basePrice || '0');

  return (
    <td style={{ verticalAlign: 'top', padding: '0 0.75rem 1rem', minWidth: 200, maxWidth: 260 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
          <Package size={22} style={{ color: 'var(--accent)' }} />
        </div>
        <Link href={`/material/${id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', textDecoration: 'none', display: 'block', lineHeight: 1.3 }}>
          {name}
        </Link>
        <div style={{ marginTop: 6 }}><RiskChip level={(data as any).riskLevel} language={language} /></div>
      </div>
      {/* Description */}
      {desc && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 0.5rem' }}>{desc}</p>}
      {/* Price */}
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
        {avgPrice > 0 ? `R$ ${avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
        {(data as any).priceUnit && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>/{(data as any).priceUnit}</span>}
      </div>
      {/* Store prices */}
      {prices.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          {prices.slice(0, 3).map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Store size={10} />{p.store?.name || '—'}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>R$ {parseFloat(p.price.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      )}
      {/* Specs */}
      {specs && (
        <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {language === 'PT' ? 'Especificações' : 'Specs'}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{specs}</p>
        </div>
      )}
      {/* Safety */}
      {warnings && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={10} />{language === 'PT' ? 'Segurança' : 'Safety'}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{warnings}</p>
        </div>
      )}
    </td>
  );
}

function ToolColumn({ id, language }: { id: number; language: string }) {
  const { data, isLoading } = trpc.tools.byId.useQuery(id, { staleTime: 60_000 });
  if (isLoading) return <td><div className="skeleton" style={{ height: 200, borderRadius: 8 }} /></td>;
  if (!data) return <td><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span></td>;
  const name = language === 'PT' ? (data as any).namePortuguese : (data as any).nameEnglish;
  const desc = language === 'PT' ? (data as any).descriptionPortuguese : (data as any).descriptionEnglish;
  const specs = language === 'PT' ? (data as any).technicalSpecsPortuguese : (data as any).technicalSpecsEnglish;
  const prices = (data as any).prices || [];
  const avgPrice = prices.length > 0
    ? prices.reduce((s: number, p: any) => s + parseFloat(p.price.price || '0'), 0) / prices.length
    : parseFloat((data as any).basePrice || '0');

  const levelLabel = (data as any).professionLevel === 'beginner'
    ? (language === 'PT' ? 'Iniciante' : 'Beginner')
    : (data as any).professionLevel === 'intermediate'
    ? (language === 'PT' ? 'Intermediário' : 'Intermediate')
    : (language === 'PT' ? 'Profissional' : 'Professional');

  const levelColor = (data as any).professionLevel === 'beginner' ? 'var(--success)' : (data as any).professionLevel === 'intermediate' ? 'var(--warning)' : 'var(--accent)';

  return (
    <td style={{ verticalAlign: 'top', padding: '0 0.75rem 1rem', minWidth: 200, maxWidth: 260 }}>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
          <Wrench size={22} style={{ color: 'var(--accent)' }} />
        </div>
        <Link href="/tools" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', textDecoration: 'none', display: 'block', lineHeight: 1.3 }}>
          {name}
        </Link>
        <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.7rem', fontWeight: 700, color: levelColor, background: `${levelColor}22`, border: `1px solid ${levelColor}55`, borderRadius: 999, padding: '2px 8px' }}>
          {levelLabel}
        </span>
      </div>
      {desc && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 0.5rem' }}>{desc}</p>}
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
        {avgPrice > 0 ? `R$ ${avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
        {(data as any).priceUnit && <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>/{(data as any).priceUnit}</span>}
      </div>
      {prices.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          {prices.slice(0, 3).map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Store size={10} />{p.store?.name || '—'}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>R$ {parseFloat(p.price.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      )}
      {specs && (
        <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {language === 'PT' ? 'Especificações' : 'Specs'}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{specs}</p>
        </div>
      )}
      {/* Power type */}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{language === 'PT' ? 'Tipo: ' : 'Type: '}</span>
        {(data as any).powerType}
      </div>
    </td>
  );
}

export default function Compare() {
  const { language } = useLanguage();
  const [location] = useLocation();
  const t = (pt: string, en: string) => language === 'PT' ? pt : en;

  const itemsParam = useMemo(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return params.get('items');
  }, [location]);

  const items = useMemo(() => parseItems(itemsParam), [itemsParam]);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success(t('Link copiado!', 'Link copied!')))
      .catch(() => toast.error(t('Erro ao copiar', 'Copy failed')));
  }

  const type = items[0]?.type;
  const backHref = type === 'tool' ? '/tools' : '/catalog';
  const backLabel = type === 'tool' ? t('Ferramentas', 'Tools') : t('Materiais', 'Materials');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      <Navigation />
      <div style={{ paddingTop: '4rem' }}>

        {/* Breadcrumb */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href={backHref} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              <ArrowLeft size={14} /> {backLabel}
            </Link>
            {items.length >= 2 && (
              <button
                type="button"
                onClick={handleShare}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600,
                }}
              >
                <Share2 size={13} /> {t('Compartilhar', 'Share')}
              </button>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitCompareArrows size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {t('Comparador', 'Comparator')}
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {items.length > 0
                  ? t(`${items.length} ${type === 'tool' ? 'ferramentas' : 'materiais'} selecionados`, `${items.length} ${type === 'tool' ? 'tools' : 'materials'} selected`)
                  : t('Nenhum item selecionado', 'No items selected')}
              </p>
            </div>
          </div>

          {items.length < 2 ? (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '4rem 2rem', textAlign: 'center',
            }}>
              <GitCompareArrows size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 1.25rem', display: 'block' }} />
              <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>{t('Selecione itens para comparar', 'Select items to compare')}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {t('Use o botão de comparação nos cards de materiais ou ferramentas para adicionar itens (mínimo 2, máximo 4 do mesmo tipo).',
                  'Use the compare button on material or tool cards to add items (min 2, max 4 of the same type).')}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/catalog" style={{ background: 'var(--accent)', color: 'white', textDecoration: 'none', padding: '0.625rem 1.25rem', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('Ver Materiais', 'View Materials')}
                </Link>
                <Link href="/tools" style={{ background: 'var(--bg-3)', color: 'var(--text)', textDecoration: 'none', padding: '0.625rem 1.25rem', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                  {t('Ver Ferramentas', 'View Tools')}
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: 120, padding: '0 0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'bottom' }}>
                      {/* attribute header */}
                    </th>
                    {items.map((item, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '0 0.75rem 0.5rem', textAlign: 'center',
                          borderBottom: '2px solid var(--accent)',
                          width: `${Math.floor(100 / items.length)}%`,
                        }}
                      >
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {i + 1}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0 0.75rem 1rem', verticalAlign: 'top' }} />
                    {items.map(item => (
                      item.type === 'material'
                        ? <MaterialColumn key={`m-${item.id}`} id={item.id} language={language} />
                        : <ToolColumn key={`t-${item.id}`} id={item.id} language={language} />
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Add more hint */}
              {items.length < 4 && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <Link
                    href={backHref}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      color: 'var(--accent)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                    }}
                  >
                    <Check size={14} /> {t(`Adicionar mais ${type === 'tool' ? 'ferramenta' : 'material'} (${4 - items.length} restante${4 - items.length > 1 ? 's' : ''})`,
                      `Add more ${type === 'tool' ? 'tool' : 'material'} (${4 - items.length} slot${4 - items.length > 1 ? 's' : ''} left)`)}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
