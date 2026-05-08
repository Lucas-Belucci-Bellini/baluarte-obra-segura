import { useParams, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { SaveButton } from '@/components/SaveButton';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, AlertTriangle, ShieldAlert, ShieldCheck, Package, DollarSign, FileText, Store } from 'lucide-react';

function RiskBadge({ level, language }: { level: string; language: string }) {
  const label = level === 'RISCO_ALTO'
    ? (language === 'PT' ? 'Risco Alto' : 'High Risk')
    : level === 'ATENCAO'
    ? (language === 'PT' ? 'Atenção' : 'Attention')
    : (language === 'PT' ? 'Normal' : 'Normal');
  const cls = level === 'RISCO_ALTO' ? 'risk-high' : level === 'ATENCAO' ? 'risk-medium' : 'risk-normal';
  const Icon = level === 'RISCO_ALTO' ? ShieldAlert : level === 'ATENCAO' ? AlertTriangle : ShieldCheck;
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>
      <Icon size={14} />
      {label}
    </span>
  );
}

export default function MaterialDetail() {
  const { language } = useLanguage();
  const params = useParams();
  const [, setLocation] = useLocation();

  const idOrSlug = params?.id || '';
  const numericId = parseInt(idOrSlug);
  const isNumeric = !isNaN(numericId) && numericId > 0;

  const byIdQuery = trpc.materials.byId.useQuery(numericId, { enabled: isNumeric });
  const bySlugQuery = trpc.materials.bySlug.useQuery(idOrSlug, { enabled: !isNumeric });

  const { data: material, isLoading } = isNumeric ? byIdQuery : bySlugQuery;

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="skeleton" style={{ height: 32, width: 120, marginBottom: '2rem', borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 48, width: '60%', marginBottom: '1rem', borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 24, width: 200, marginBottom: '2rem', borderRadius: 8 }} />
          {[200, 160, 180].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 12, marginBottom: '1rem' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navigation />
        <div style={{ textAlign: 'center' }}>
          <Package size={56} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 700 }}>
            {language === 'PT' ? 'Material não encontrado' : 'Material not found'}
          </h2>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setLocation('/catalog')}>
            {language === 'PT' ? 'Ver catálogo' : 'View catalog'}
          </button>
        </div>
      </div>
    );
  }

  const name = language === 'PT' ? material.namePortuguese : material.nameEnglish;
  const description = language === 'PT' ? material.descriptionPortuguese : material.descriptionEnglish;
  const safetyWarnings = language === 'PT' ? material.safetyWarningsPortuguese : material.safetyWarningsEnglish;
  const usageTips = language === 'PT' ? material.usageTipsPortuguese : material.usageTipsEnglish;
  const antiScam = language === 'PT' ? (material as any).antiScamPortuguese : (material as any).antiScamEnglish;
  const technicalSpecs = language === 'PT' ? (material as any).technicalSpecsPortuguese : (material as any).technicalSpecsEnglish;

  const prices = (material as any).prices || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      {/* Back + breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0.875rem 1.5rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLocation('/catalog')}
            style={{ padding: '0.25rem 0', gap: '0.375rem' }}
          >
            <ArrowLeft size={15} />
            {language === 'PT' ? 'Catálogo' : 'Catalog'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Hero */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', flex: 1, minWidth: 200 }}>
              {name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <RiskBadge level={material.riskLevel || 'NORMAL'} language={language} />
              <SaveButton itemType="material" itemId={material.id} size="md" />
            </div>
          </div>
          {description && (
            <p className="prose-dark" style={{ fontSize: '1rem', lineHeight: 1.8, maxWidth: 700 }}>
              {description}
            </p>
          )}
        </div>

        {/* Technical specs */}
        {technicalSpecs && (
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <FileText size={18} color="var(--accent)" />
              <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem', margin: 0 }}>
                {language === 'PT' ? 'Especificações Técnicas' : 'Technical Specifications'}
              </h2>
            </div>
            <div className="prose-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
              {technicalSpecs}
            </div>
          </section>
        )}

        {/* Safety warnings */}
        {safetyWarnings && (
          <section style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <AlertTriangle size={18} color="var(--danger)" />
              <h2 style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1rem', margin: 0 }}>
                {language === 'PT' ? 'Alertas de Segurança' : 'Safety Warnings'}
              </h2>
            </div>
            <div style={{ color: '#fca5a5', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
              {safetyWarnings}
            </div>
          </section>
        )}

        {/* Anti-scam */}
        {antiScam && (
          <section style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <ShieldAlert size={18} color="var(--warning)" />
              <h2 style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '1rem', margin: 0 }}>
                {language === 'PT' ? 'Proteção Anti-Fraude' : 'Anti-Scam Protection'}
              </h2>
            </div>
            <div style={{ color: '#fde68a', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
              {antiScam}
            </div>
          </section>
        )}

        {/* Usage tips */}
        {usageTips && (
          <section style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <ShieldCheck size={18} color="var(--success)" />
              <h2 style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem', margin: 0 }}>
                {language === 'PT' ? 'Dicas de Uso' : 'Usage Tips'}
              </h2>
            </div>
            <div style={{ color: '#86efac', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
              {usageTips}
            </div>
          </section>
        )}

        {/* Price comparison */}
        {prices.length > 0 && (
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <DollarSign size={18} color="var(--accent)" />
              <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem', margin: 0 }}>
                {language === 'PT' ? 'Comparação de Preços' : 'Price Comparison'}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {prices.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Store size={15} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{p.store?.name || 'Loja'}</div>
                      {p.store?.city && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.store.city}, {p.store.state}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.125rem', color: i === 0 ? 'var(--success)' : 'var(--text)' }}>
                      R$ {parseFloat(p.price.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {p.price.unit && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{p.price.unit}</div>}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.875rem' }}>
              {language === 'PT' ? '* Preços atualizados pelos usuários da comunidade. Verifique valores na loja.' : '* Prices updated by community members. Verify at store.'}
            </p>
          </section>
        )}

        {/* Base price fallback */}
        {prices.length === 0 && (material as any).basePrice && (
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <DollarSign size={18} color="var(--accent)" />
              <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem', margin: 0 }}>
                {language === 'PT' ? 'Preço de referência' : 'Reference price'}
              </h2>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent)' }}>
              R$ {parseFloat((material as any).basePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              {(material as any).priceUnit && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/{(material as any).priceUnit}</span>}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {language === 'PT' ? 'Preço médio de mercado. Adicione sua loja para comparar.' : 'Average market price. Add your store to compare.'}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
