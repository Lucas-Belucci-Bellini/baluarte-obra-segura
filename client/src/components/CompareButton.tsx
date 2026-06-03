import { GitCompareArrows } from 'lucide-react';
import { useCompare, type CompareItemType } from '@/contexts/CompareContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  itemType: CompareItemType;
  itemId: number;
  iconOnly?: boolean;
}

export function CompareButton({ itemType, itemId, iconOnly = false }: Props) {
  const { language } = useLanguage();
  const { has, toggle, canAdd } = useCompare();
  const item = { type: itemType, id: itemId };
  const active = has(item);
  const disabled = !active && !canAdd(itemType);

  const label = active
    ? (language === 'PT' ? 'Remover da comparação' : 'Remove from compare')
    : (language === 'PT' ? 'Comparar' : 'Compare');

  return (
    <button
      type="button"
      title={disabled ? (language === 'PT' ? 'Máximo de 4 itens ou tipo diferente' : 'Max 4 items or different type') : label}
      onClick={e => { e.preventDefault(); e.stopPropagation(); if (!disabled) toggle(item); }}
      disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: 7, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: active ? 'var(--accent)' : 'var(--bg-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', opacity: disabled ? 0.35 : 1,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      } as React.CSSProperties}
      aria-label={label}
    >
      <GitCompareArrows size={13} style={{ color: active ? 'white' : 'var(--text-muted)' }} />
      {!iconOnly && <span style={{ fontSize: '0.75rem', fontWeight: 600, marginLeft: 4, color: active ? 'white' : 'var(--text-muted)' }}>{label}</span>}
    </button>
  );
}
