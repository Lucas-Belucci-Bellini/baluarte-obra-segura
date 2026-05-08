import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { FolderPlus, FolderOpen, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

type ItemType = 'material' | 'tool';

type Props = {
  itemType: ItemType;
  itemId: number;
  size?: 'sm' | 'md';
  iconOnly?: boolean;
};

export function AddToProjectButton({ itemType, itemId, size = 'sm', iconOnly = false }: Props) {
  const { isAuthenticated, loading } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: projects = [], isLoading: loadingProjects } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated && open,
    staleTime: 30_000,
  });

  const addItem = trpc.projects.addItem.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      utils.projects.byId.invalidate();
      toast.success(language === 'PT' ? 'Adicionado ao projeto' : 'Added to project');
      setOpen(false);
    },
    onError: err => toast.error(language === 'PT' ? 'Erro ao adicionar' : 'Failed to add', {
      description: err.message,
    }),
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: ({ id }) => {
      utils.projects.list.invalidate();
      addItem.mutate({ projectId: id, itemType, itemId });
      setNewName('');
      setCreating(false);
    },
    onError: err => toast.error(language === 'PT' ? 'Erro ao criar projeto' : 'Failed to create project', {
      description: err.message,
    }),
  });

  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (!isAuthenticated) {
      toast.info(language === 'PT' ? 'Entre para usar projetos' : 'Sign in to use projects');
      setLocation('/login');
      return;
    }
    setOpen(o => !o);
  };

  const handleCreate = (e: MouseEvent<HTMLButtonElement> | { preventDefault: () => void }) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    createProject.mutate({ name });
  };

  const iconSize = size === 'sm' ? 14 : 16;
  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);

  const buttonStyle: CSSProperties = iconOnly
    ? {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size === 'sm' ? 30 : 36, height: size === 'sm' ? 30 : 36,
        borderRadius: 999, border: '1px solid var(--border)',
        background: open ? 'var(--accent-muted)' : 'var(--bg-2)',
        color: open ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer', transition: 'all 0.15s',
      }
    : {
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: size === 'sm' ? '0.375rem 0.625rem' : '0.5rem 0.75rem',
        borderRadius: 8, border: '1px solid var(--border)',
        background: open ? 'var(--accent-muted)' : 'transparent',
        color: open ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: size === 'sm' ? '0.75rem' : '0.875rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
      };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={addItem.isPending}
        aria-label={t('Adicionar a um projeto', 'Add to a project')}
        title={t('Adicionar a um projeto', 'Add to a project')}
        style={buttonStyle}
      >
        <FolderPlus size={iconSize} />
        {!iconOnly && <span>{t('Projeto', 'Project')}</span>}
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
            minWidth: 260, maxWidth: 320,
            background: 'var(--bg-2)', border: '1px solid var(--border-strong)',
            borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            overflow: 'hidden', zIndex: 100,
          }}
        >
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('Adicionar a', 'Add to')}
            </div>
          </div>

          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '0.375rem' }}>
            {loadingProjects ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
                <Loader2 size={14} className="spin" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                {t('Carregando…', 'Loading…')}
              </div>
            ) : projects.length === 0 ? (
              <div style={{ padding: '0.75rem 0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {t('Você ainda não tem projetos.', 'You have no projects yet.')}
              </div>
            ) : (
              projects.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem.mutate({ projectId: p.id, itemType, itemId })}
                  disabled={addItem.isPending}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.625rem', borderRadius: 8,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text)', fontSize: '0.8125rem', textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <FolderOpen size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{p.itemCount}</span>
                </button>
              ))
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem' }}>
            {creating ? (
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <input
                  autoFocus
                  className="input-dark"
                  style={{ padding: '0.4rem 0.625rem', fontSize: '0.8125rem' }}
                  placeholder={t('Nome do projeto', 'Project name')}
                  maxLength={60}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate(e);
                    if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.35rem 0.625rem', fontSize: '0.8125rem' }}
                  disabled={!newName.trim() || createProject.isPending || addItem.isPending}
                  onClick={handleCreate}
                >
                  {createProject.isPending || addItem.isPending
                    ? <Loader2 size={13} className="spin" />
                    : <Check size={13} />}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.625rem', borderRadius: 8,
                  background: 'transparent', border: '1px dashed var(--border-strong)',
                  cursor: 'pointer',
                  color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 600,
                }}
              >
                <Plus size={13} />
                {t('Criar novo projeto', 'Create new project')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
