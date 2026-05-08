import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Package, Wrench, BookOpen, Calculator as CalcIcon, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

type Tab = 'material' | 'tool' | 'article' | 'calculator';

const TAB_META: { key: Tab; icon: typeof Heart; labelPT: string; labelEN: string }[] = [
  { key: 'material', icon: Package, labelPT: 'Materiais', labelEN: 'Materials' },
  { key: 'tool', icon: Wrench, labelPT: 'Ferramentas', labelEN: 'Tools' },
  { key: 'article', icon: BookOpen, labelPT: 'Artigos', labelEN: 'Articles' },
  { key: 'calculator', icon: CalcIcon, labelPT: 'Calculadoras', labelEN: 'Calculators' },
];

export default function Saved() {
  const { language } = useLanguage();
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>('material');
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) setLocation('/login');
  }, [loading, isAuthenticated, setLocation]);

  const { data, isLoading } = trpc.savedItems.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const toggle = trpc.savedItems.toggle.useMutation({
    onSuccess: () => {
      utils.savedItems.list.invalidate();
      utils.savedItems.keys.invalidate();
      toast.success(language === 'PT' ? 'Removido dos favoritos' : 'Removed from favorites');
    },
    onError: err => toast.error(language === 'PT' ? 'Erro ao remover' : 'Failed to remove', {
      description: err.message,
    }),
  });

  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);

  const counts = {
    material: data?.material.length ?? 0,
    tool: data?.tool.length ?? 0,
    article: data?.article.length ?? 0,
    calculator: data?.calculator.length ?? 0,
  };
  const total = counts.material + counts.tool + counts.article + counts.calculator;

  if (loading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="skeleton" style={{ height: 32, width: 220, marginBottom: '2rem', borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0.875rem 1.5rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLocation('/')}
            style={{ padding: '0.25rem 0', gap: '0.375rem' }}
          >
            <ArrowLeft size={15} />
            {t('Início', 'Home')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div className="section-label" style={{ marginBottom: '0.75rem' }}>
          {t('FAVORITOS', 'FAVORITES')}
        </div>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900,
          color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem',
        }}>
          {t('Meus favoritos', 'My favorites')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {t(
            `Sua biblioteca pessoal. ${total} ${total === 1 ? 'item salvo' : 'itens salvos'}.`,
            `Your personal library. ${total} ${total === 1 ? 'item saved' : 'items saved'}.`,
          )}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.375rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {TAB_META.map(m => {
            const active = tab === m.key;
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setTab(m.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                <Icon size={15} />
                {language === 'PT' ? m.labelPT : m.labelEN}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  padding: '1px 6px', borderRadius: 999,
                  background: active ? 'var(--accent-muted)' : 'var(--bg-2)',
                  color: active ? 'var(--accent)' : 'var(--text-subtle)',
                  border: '1px solid var(--border)',
                }}>
                  {counts[m.key]}
                </span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <TabContent
            tab={tab}
            data={data}
            language={language}
            onRemove={(itemType, itemId) => toggle.mutate({ itemType, itemId })}
          />
        )}
      </div>
    </div>
  );
}

function TabContent({
  tab, data, language, onRemove,
}: {
  tab: Tab;
  data: ReturnType<typeof trpc.savedItems.list.useQuery>['data'];
  language: string;
  onRemove: (itemType: Tab, itemId: number) => void;
}) {
  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);
  const list = data?.[tab] ?? [];

  if (list.length === 0) {
    const emptyMsg = {
      material: t('Nenhum material salvo ainda.', 'No saved materials yet.'),
      tool: t('Nenhuma ferramenta salva ainda.', 'No saved tools yet.'),
      article: t('Nenhum artigo salvo ainda.', 'No saved articles yet.'),
      calculator: t('Nenhuma calculadora salva ainda.', 'No saved calculators yet.'),
    }[tab];
    const browseLink = {
      material: '/catalog',
      tool: '/tools',
      article: '/knowledge-base',
      calculator: '/calculators',
    }[tab];
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--bg-1)', border: '1px dashed var(--border)', borderRadius: 12 }}>
        <Heart size={36} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {emptyMsg}
        </div>
        <Link href={browseLink} className="btn btn-outline btn-sm">
          {t('Explorar', 'Browse')} →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {list.map(({ saved, item }: any) => (
        <SavedCard
          key={saved.id}
          tab={tab}
          item={item}
          savedAt={saved.createdAt}
          language={language}
          onRemove={() => onRemove(tab, item.id)}
        />
      ))}
    </div>
  );
}

function SavedCard({
  tab, item, savedAt, language, onRemove,
}: {
  tab: Tab;
  item: any;
  savedAt: Date | string;
  language: string;
  onRemove: () => void;
}) {
  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);

  const title = tab === 'article'
    ? (language === 'PT' ? item.titlePortuguese : item.titleEnglish)
    : (language === 'PT' ? item.namePortuguese : item.nameEnglish);
  const desc = tab === 'article'
    ? (language === 'PT' ? item.summaryPortuguese : item.summaryEnglish)
    : (language === 'PT' ? item.descriptionPortuguese : item.descriptionEnglish);

  const link = tab === 'material' ? `/material/${item.id}`
    : tab === 'tool' ? '/tools'
    : tab === 'article' ? '/knowledge-base'
    : '/calculators';

  const Icon = tab === 'material' ? Package
    : tab === 'tool' ? Wrench
    : tab === 'article' ? BookOpen
    : CalcIcon;

  const savedDate = new Date(savedAt);
  const dateStr = savedDate.toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US', {
    day: '2-digit', month: 'short',
  });

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('Remover dos favoritos', 'Remove from favorites')}
        title={t('Remover dos favoritos', 'Remove from favorites')}
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 30, height: 30, borderRadius: 999,
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Trash2 size={13} />
      </button>

      <Link href={link} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingRight: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={17} color="var(--accent)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 2 }}>
              {t('Salvo em', 'Saved on')} {dateStr}
            </div>
          </div>
        </div>
        {desc && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
            {desc}
          </p>
        )}
      </Link>
    </div>
  );
}
