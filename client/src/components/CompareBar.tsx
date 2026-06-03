import { useLocation } from 'wouter';
import { GitCompareArrows, X, ArrowRight } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

function ItemChip({ type, id, onRemove }: { type: 'material' | 'tool'; id: number; onRemove: () => void }) {
  const { language } = useLanguage();
  const matQ = trpc.materials.byId.useQuery(id, { enabled: type === 'material', staleTime: 60_000 });
  const toolQ = trpc.tools.byId.useQuery(id, { enabled: type === 'tool', staleTime: 60_000 });
  const data = type === 'material' ? matQ.data : toolQ.data;
  const name = data ? (language === 'PT' ? (data as any).namePortuguese : (data as any).nameEnglish) : '...';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'var(--bg-3)', border: '1px solid var(--border-strong)',
      borderRadius: 8, padding: '4px 10px', maxWidth: 160,
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function CompareBar() {
  const { items, remove, clear } = useCompare();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const t = (pt: string, en: string) => language === 'PT' ? pt : en;

  if (items.length === 0) return null;

  const itemsParam = items.map(i => `${i.type[0]}-${i.id}`).join(',');
  const canCompare = items.length >= 2;

  return (
    <div style={{
      position: 'fixed', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 150,
      background: 'var(--bg-2)', border: '1px solid var(--border-strong)',
      borderRadius: 16, boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
      padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      maxWidth: 'min(680px, 92vw)',
    }}>
      <GitCompareArrows size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
        {t('Comparar', 'Compare')} ({items.length}/4)
      </span>

      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', flex: 1 }}>
        {items.map(item => (
          <ItemChip
            key={`${item.type}-${item.id}`}
            type={item.type}
            id={item.id}
            onRemove={() => remove(item)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          type="button"
          onClick={clear}
          style={{
            background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
            padding: '5px 12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600,
          }}
        >
          {t('Limpar', 'Clear')}
        </button>
        <button
          type="button"
          disabled={!canCompare}
          onClick={() => { setLocation(`/comparar?items=${itemsParam}`); clear(); }}
          style={{
            background: canCompare ? 'var(--accent)' : 'var(--bg-3)',
            border: 'none', borderRadius: 8,
            padding: '5px 14px', cursor: canCompare ? 'pointer' : 'not-allowed',
            color: canCompare ? 'white' : 'var(--text-muted)',
            fontSize: '0.75rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}
        >
          {t('Comparar', 'Compare')} <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
