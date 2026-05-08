import { useState, type CSSProperties, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

type SavedItemType = 'material' | 'tool' | 'article' | 'calculator';

type Props = {
  itemType: SavedItemType;
  itemId: number;
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
  /** When true, render as plain icon button (for use inside card overlays). */
  iconOnly?: boolean;
  /** Optional explicit label override. */
  label?: { saved: string; notSaved: string };
};

export function SaveButton({
  itemType, itemId, size = 'sm', iconOnly = false, className, style, label,
}: Props) {
  const { isAuthenticated, loading } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [pulse, setPulse] = useState(false);
  const utils = trpc.useUtils();

  const { data: keys } = trpc.savedItems.keys.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const isSaved = !!keys?.some(k => k.itemType === itemType && k.itemId === itemId);

  const toggle = trpc.savedItems.toggle.useMutation({
    onMutate: async () => {
      setPulse(true);
      await utils.savedItems.keys.cancel();
      const prev = utils.savedItems.keys.getData();
      utils.savedItems.keys.setData(undefined, old => {
        const list = old ?? [];
        return isSaved
          ? list.filter(k => !(k.itemType === itemType && k.itemId === itemId))
          : [...list, { itemType, itemId }];
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      utils.savedItems.keys.setData(undefined, ctx?.prev);
      toast.error(language === 'PT' ? 'Não foi possível salvar' : 'Could not save', {
        description: err.message,
      });
    },
    onSuccess: ({ saved }) => {
      const labels = label ?? {
        saved: language === 'PT' ? 'Adicionado aos favoritos' : 'Added to favorites',
        notSaved: language === 'PT' ? 'Removido dos favoritos' : 'Removed from favorites',
      };
      toast.success(saved ? labels.saved : labels.notSaved);
    },
    onSettled: () => {
      utils.savedItems.keys.invalidate();
      utils.savedItems.list.invalidate();
      setTimeout(() => setPulse(false), 350);
    },
  });

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (!isAuthenticated) {
      toast.info(language === 'PT' ? 'Entre para salvar favoritos' : 'Sign in to save favorites');
      setLocation('/login');
      return;
    }
    toggle.mutate({ itemType, itemId });
  };

  const iconSize = size === 'sm' ? 14 : 16;
  const padding = size === 'sm' ? '0.375rem' : '0.5rem';

  const baseStyle: CSSProperties = iconOnly
    ? {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size === 'sm' ? 30 : 36, height: size === 'sm' ? 30 : 36,
        borderRadius: 999, border: '1px solid var(--border)',
        background: isSaved ? 'rgba(249, 115, 22, 0.12)' : 'var(--bg-2)',
        color: isSaved ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer', transition: 'all 0.15s',
        transform: pulse ? 'scale(1.18)' : 'scale(1)',
      }
    : {
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: `${padding} 0.625rem`, borderRadius: 8,
        border: '1px solid var(--border)',
        background: isSaved ? 'rgba(249,115,22,0.12)' : 'transparent',
        color: isSaved ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: size === 'sm' ? '0.75rem' : '0.875rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
        transform: pulse ? 'scale(1.06)' : 'scale(1)',
        ...style,
      };

  const ariaLabel = isSaved
    ? (language === 'PT' ? 'Remover dos favoritos' : 'Remove from favorites')
    : (language === 'PT' ? 'Adicionar aos favoritos' : 'Add to favorites');

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={handleClick}
      disabled={toggle.isPending}
      className={className}
      style={baseStyle}
    >
      <Heart
        size={iconSize}
        fill={isSaved ? 'currentColor' : 'none'}
        strokeWidth={isSaved ? 2 : 2.2}
      />
      {!iconOnly && (
        <span>
          {isSaved
            ? (language === 'PT' ? 'Salvo' : 'Saved')
            : (language === 'PT' ? 'Salvar' : 'Save')}
        </span>
      )}
    </button>
  );
}
