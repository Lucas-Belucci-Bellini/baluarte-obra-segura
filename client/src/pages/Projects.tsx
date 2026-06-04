import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Plus, FolderOpen, Archive, ArchiveRestore, Trash2, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

const PROJECT_TYPES_PT = {
  residential: 'Residencial', commercial: 'Comercial', industrial: 'Industrial',
  rural: 'Rural', renovation: 'Reforma', other: 'Outro',
};
const PROJECT_TYPES_EN = {
  residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial',
  rural: 'Rural', renovation: 'Renovation', other: 'Other',
};

const STATUS_LABEL_PT = {
  planning: 'Planejando', active: 'Em andamento', completed: 'Concluído', archived: 'Arquivado',
};
const STATUS_LABEL_EN = {
  planning: 'Planning', active: 'Active', completed: 'Completed', archived: 'Archived',
};

const STATUS_COLOR: Record<string, string> = {
  planning: 'var(--text-muted)',
  active: 'var(--accent)',
  completed: 'var(--success)',
  archived: 'var(--text-subtle)',
};

export default function Projects() {
  const { language } = useLanguage();
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<keyof typeof PROJECT_TYPES_PT>('residential');
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) setLocation('/login');
  }, [loading, isAuthenticated, setLocation]);

  const { data: projects = [], isLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: ({ id }) => {
      utils.projects.list.invalidate();
      toast.success(language === 'PT' ? 'Projeto criado' : 'Project created');
      setNewName('');
      setShowCreate(false);
      setLocation(`/projects/${id}`);
    },
    onError: err => {
      if (err.message === 'FREE_LIMIT_PROJECTS') {
        toast.error(language === 'PT' ? 'Limite de projetos atingido' : 'Projects limit reached', {
          description: language === 'PT'
            ? 'O plano gratuito permite 1 projeto. Faça upgrade para Pro.'
            : 'Free plan allows 1 project. Upgrade to Pro.',
          action: {
            label: language === 'PT' ? 'Ver planos' : 'See plans',
            onClick: () => setLocation('/pricing'),
          },
          icon: <Zap className="w-4 h-4 text-orange-400" />,
        });
      } else {
        toast.error(language === 'PT' ? 'Erro ao criar' : 'Failed to create', { description: err.message });
      }
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      toast.success(language === 'PT' ? 'Projeto excluído' : 'Project deleted');
    },
    onError: err => toast.error(err.message),
  });

  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);
  const filtered = projects.filter(p => filter === 'archived' ? p.status === 'archived' : p.status !== 'archived');
  const activeCount = projects.filter(p => p.status !== 'archived').length;
  const archivedCount = projects.filter(p => p.status === 'archived').length;

  if (loading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}>{t('PROJETOS', 'PROJECTS')}</div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900,
              color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem',
            }}>
              {t('Meus projetos', 'My projects')}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {t(
                'Organize materiais, ferramentas e cálculos por obra. Acompanhe orçamento e progresso.',
                'Organize materials, tools and calculations per project. Track budget and progress.',
              )}
            </p>
          </div>
          {!showCreate && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={15} />
              {t('Novo projeto', 'New project')}
            </button>
          )}
        </div>

        {showCreate && (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 240px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                  {t('Nome', 'Name')}
                </div>
                <input
                  autoFocus
                  className="input-dark"
                  placeholder={t('Ex: Casa nova, Reforma cozinha…', 'E.g. New house, Kitchen renovation…')}
                  maxLength={120}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newName.trim()) createMutation.mutate({ name: newName.trim(), projectType: newType });
                    if (e.key === 'Escape') { setShowCreate(false); setNewName(''); }
                  }}
                />
              </div>
              <div style={{ flex: '0 0 200px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                  {t('Tipo', 'Type')}
                </div>
                <select
                  className="input-dark"
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                >
                  {Object.entries(language === 'PT' ? PROJECT_TYPES_PT : PROJECT_TYPES_EN).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => { setShowCreate(false); setNewName(''); }}
                >
                  {t('Cancelar', 'Cancel')}
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!newName.trim() || createMutation.isPending}
                  onClick={() => createMutation.mutate({ name: newName.trim(), projectType: newType })}
                >
                  {createMutation.isPending
                    ? <Loader2 size={14} className="spin" />
                    : <Plus size={14} />}
                  {t('Criar', 'Create')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.375rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          {([
            ['active', t('Ativos', 'Active'), activeCount],
            ['archived', t('Arquivados', 'Archived'), archivedCount],
          ] as const).map(([key, label, count]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 0.875rem', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  fontSize: '0.875rem', fontWeight: 600,
                }}
              >
                {label}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  padding: '1px 6px', borderRadius: 999,
                  background: active ? 'var(--accent-muted)' : 'var(--bg-2)',
                  color: active ? 'var(--accent)' : 'var(--text-subtle)',
                  border: '1px solid var(--border)',
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--bg-1)', border: '1px dashed var(--border)', borderRadius: 12 }}>
            <FolderOpen size={36} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {filter === 'archived'
                ? t('Nenhum projeto arquivado.', 'No archived projects.')
                : t('Nenhum projeto ainda.', 'No projects yet.')}
            </div>
            {filter === 'active' && !showCreate && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                <Plus size={13} />
                {t('Criar primeiro projeto', 'Create first project')}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filtered.map(p => {
              const typeLabel = (language === 'PT' ? PROJECT_TYPES_PT : PROJECT_TYPES_EN)[p.projectType as keyof typeof PROJECT_TYPES_PT];
              const statusLabel = (language === 'PT' ? STATUS_LABEL_PT : STATUS_LABEL_EN)[p.status as keyof typeof STATUS_LABEL_PT];
              const statusColor = STATUS_COLOR[p.status] ?? 'var(--text-muted)';
              const isArchived = p.status === 'archived';
              return (
                <div key={p.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <Link href={`/projects/${p.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                        {typeLabel}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                    </Link>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, color: statusColor,
                      background: statusColor + '18', border: `1px solid ${statusColor}30`,
                      padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap',
                    }}>
                      {statusLabel}
                    </span>
                  </div>

                  {p.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                      {p.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{p.itemCount} {t('itens', 'items')}</span>
                    {p.computedSubtotal > 0 && (
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        R$ {p.computedSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      title={isArchived ? t('Reativar', 'Reactivate') : t('Arquivar', 'Archive')}
                      onClick={() => updateMutation.mutate({ id: p.id, status: isArchived ? 'active' : 'archived' })}
                    >
                      {isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      title={t('Excluir', 'Delete')}
                      onClick={() => {
                        if (confirm(t(`Excluir "${p.name}"? Esta ação é permanente.`, `Delete "${p.name}"? This is permanent.`))) {
                          deleteMutation.mutate({ id: p.id });
                        }
                      }}
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <Link href={`/projects/${p.id}`} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
                      {t('Abrir', 'Open')} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
