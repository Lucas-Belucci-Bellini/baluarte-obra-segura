import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import {
  ArrowLeft, Save, Trash2, Edit3, X, Package, Wrench, Plus,
  FolderOpen, AlertTriangle, Loader2, Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

const PROJECT_TYPES_PT: Record<string, string> = {
  residential: 'Residencial', commercial: 'Comercial', industrial: 'Industrial',
  rural: 'Rural', renovation: 'Reforma', other: 'Outro',
};
const PROJECT_TYPES_EN: Record<string, string> = {
  residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial',
  rural: 'Rural', renovation: 'Renovation', other: 'Other',
};
const STATUS_PT: Record<string, string> = {
  planning: 'Planejando', active: 'Em andamento', completed: 'Concluído', archived: 'Arquivado',
};
const STATUS_EN: Record<string, string> = {
  planning: 'Planning', active: 'Active', completed: 'Completed', archived: 'Archived',
};

export default function ProjectDetail() {
  const { language } = useLanguage();
  const { isAuthenticated, loading } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const projectId = parseInt(params?.id ?? '');
  const valid = !isNaN(projectId) && projectId > 0;

  useEffect(() => {
    if (!loading && !isAuthenticated) setLocation('/login');
  }, [loading, isAuthenticated, setLocation]);

  const { data: project, isLoading } = trpc.projects.byId.useQuery(projectId, {
    enabled: isAuthenticated && valid,
  });

  const [tab, setTab] = useState<'material' | 'tool'>('material');
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftType, setDraftType] = useState('residential');
  const [draftStatus, setDraftStatus] = useState('planning');
  const [draftArea, setDraftArea] = useState('');

  useEffect(() => {
    if (project) {
      setDraftName(project.name);
      setDraftDesc(project.description ?? '');
      setDraftType(project.projectType);
      setDraftStatus(project.status);
      setDraftArea(project.areaSqm ? String(project.areaSqm) : '');
    }
  }, [project]);

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.byId.invalidate();
      utils.projects.list.invalidate();
      toast.success(language === 'PT' ? 'Salvo' : 'Saved');
      setEditing(false);
    },
    onError: err => toast.error(err.message),
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      toast.success(language === 'PT' ? 'Projeto excluído' : 'Project deleted');
      setLocation('/projects');
    },
    onError: err => toast.error(err.message),
  });

  const updateItem = trpc.projects.updateItem.useMutation({
    onSuccess: () => utils.projects.byId.invalidate(),
    onError: err => toast.error(err.message),
  });

  const removeItem = trpc.projects.removeItem.useMutation({
    onSuccess: () => {
      utils.projects.byId.invalidate();
      toast.success(language === 'PT' ? 'Item removido' : 'Item removed');
    },
    onError: err => toast.error(err.message),
  });

  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);

  const items = project?.items ?? [];
  const materialItems = useMemo(() => items.filter(i => i.itemType === 'material'), [items]);
  const toolItems = useMemo(() => items.filter(i => i.itemType === 'tool'), [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = Number(it.quantity ?? 1);
      const price = Number(it.unitPrice ?? 0);
      return sum + qty * price;
    }, 0);
  }, [items]);

  const handleExportCsv = () => {
    if (!project) return;
    const rows = [
      ['Tipo', 'Nome', 'Quantidade', 'Preço unitário', 'Subtotal', 'Notas'],
      ...items.map(it => {
        const item = it.material ?? it.tool;
        const name = item ? (language === 'PT' ? (item as any).namePortuguese : (item as any).nameEnglish) : `#${it.itemId}`;
        const qty = Number(it.quantity ?? 1);
        const price = Number(it.unitPrice ?? 0);
        return [it.itemType, name, qty.toFixed(2), price.toFixed(2), (qty * price).toFixed(2), it.notes ?? ''];
      }),
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^\w-]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('Lista exportada', 'List exported'));
  };

  if (loading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (!valid || (!isLoading && !project)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
          <FolderOpen size={56} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {t('Projeto não encontrado', 'Project not found')}
          </h2>
          <button className="btn btn-primary" onClick={() => setLocation('/projects')}>
            {t('Ver projetos', 'View projects')}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="skeleton" style={{ height: 32, width: 200, marginBottom: '2rem', borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
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
            onClick={() => setLocation('/projects')}
            style={{ padding: '0.25rem 0', gap: '0.375rem' }}
          >
            <ArrowLeft size={15} />
            {t('Projetos', 'Projects')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        {editing ? (
          <section className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <Label>{t('Nome', 'Name')}</Label>
                <input
                  className="input-dark"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div>
                <Label>{t('Tipo', 'Type')}</Label>
                <select className="input-dark" value={draftType} onChange={e => setDraftType(e.target.value)}>
                  {Object.entries(language === 'PT' ? PROJECT_TYPES_PT : PROJECT_TYPES_EN).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t('Status', 'Status')}</Label>
                <select className="input-dark" value={draftStatus} onChange={e => setDraftStatus(e.target.value)}>
                  {Object.entries(language === 'PT' ? STATUS_PT : STATUS_EN).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t('Área (m²)', 'Area (m²)')}</Label>
                <input
                  className="input-dark"
                  type="number"
                  min={0}
                  step={0.01}
                  value={draftArea}
                  onChange={e => setDraftArea(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>{t('Descrição', 'Description')}</Label>
              <textarea
                className="input-dark"
                rows={3}
                value={draftDesc}
                onChange={e => setDraftDesc(e.target.value)}
                maxLength={2000}
                style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>
                <X size={14} />
                {t('Cancelar', 'Cancel')}
              </button>
              <button
                className="btn btn-primary"
                disabled={!draftName.trim() || updateMutation.isPending}
                onClick={() => updateMutation.mutate({
                  id: project.id,
                  name: draftName.trim(),
                  description: draftDesc.trim() || null,
                  projectType: draftType as any,
                  status: draftStatus as any,
                  areaSqm: draftArea ? draftArea : null,
                })}
              >
                {updateMutation.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                {t('Salvar', 'Save')}
              </button>
            </div>
          </section>
        ) : (
          <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="section-label" style={{ marginBottom: '0.5rem' }}>
                {(language === 'PT' ? PROJECT_TYPES_PT : PROJECT_TYPES_EN)[project.projectType]}
                {project.status !== 'planning' && (
                  <> · {(language === 'PT' ? STATUS_PT : STATUS_EN)[project.status]}</>
                )}
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>
                {project.name}
              </h1>
              {project.description && (
                <p style={{ color: 'var(--text-muted)', maxWidth: 720, lineHeight: 1.6, margin: 0 }}>
                  {project.description}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                <Edit3 size={13} />
                {t('Editar', 'Edit')}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={() => {
                  if (confirm(t(`Excluir "${project.name}"? Esta ação é permanente.`, `Delete "${project.name}"? This is permanent.`))) {
                    deleteMutation.mutate({ id: project.id });
                  }
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </section>
        )}

        {/* Stats strip */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          <Stat label={t('Materiais', 'Materials')} value={String(materialItems.length)} />
          <Stat label={t('Ferramentas', 'Tools')} value={String(toolItems.length)} />
          <Stat label={t('Subtotal calculado', 'Computed subtotal')} value={`R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} accent />
          {project.budgetEstimate && (
            <Stat
              label={t('Orçamento estimado', 'Budget estimate')}
              value={`R$ ${Number(project.budgetEstimate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
          )}
        </section>

        {/* Tabs + actions */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.375rem', borderBottom: '1px solid var(--border)', flex: 1 }}>
              <TabBtn active={tab === 'material'} onClick={() => setTab('material')} icon={<Package size={14} />} label={t('Materiais', 'Materials')} count={materialItems.length} />
              <TabBtn active={tab === 'tool'} onClick={() => setTab('tool')} icon={<Wrench size={14} />} label={t('Ferramentas', 'Tools')} count={toolItems.length} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleExportCsv} disabled={items.length === 0}>
                <Download size={13} />
                {t('Exportar CSV', 'Export CSV')}
              </button>
              <Link href={tab === 'material' ? '/catalog' : '/tools'} className="btn btn-primary btn-sm">
                <Plus size={13} />
                {tab === 'material' ? t('Adicionar material', 'Add material') : t('Adicionar ferramenta', 'Add tool')}
              </Link>
            </div>
          </div>

          {(tab === 'material' ? materialItems : toolItems).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--bg-1)', border: '1px dashed var(--border)', borderRadius: 12 }}>
              <AlertTriangle size={28} color="var(--text-subtle)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {tab === 'material'
                  ? t('Nenhum material adicionado.', 'No materials added.')
                  : t('Nenhuma ferramenta adicionada.', 'No tools added.')}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(tab === 'material' ? materialItems : toolItems).map(it => (
                <ItemRow
                  key={it.id}
                  it={it}
                  language={language}
                  onUpdate={(patch) => updateItem.mutate({ projectItemId: it.id, ...patch })}
                  onRemove={() => removeItem.mutate({ projectItemId: it.id })}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
    }}>{children}</div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: '0.875rem 1rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {value}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 0.875rem', border: 'none', cursor: 'pointer',
        background: 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
        fontSize: '0.875rem', fontWeight: 600,
      }}
    >
      {icon}
      {label}
      <span style={{
        fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 999,
        background: active ? 'var(--accent-muted)' : 'var(--bg-2)',
        color: active ? 'var(--accent)' : 'var(--text-subtle)',
        border: '1px solid var(--border)',
      }}>{count}</span>
    </button>
  );
}

function ItemRow({
  it, language, onUpdate, onRemove,
}: {
  it: any; language: string;
  onUpdate: (patch: { quantity?: string; unitPrice?: string | null; notes?: string | null }) => void;
  onRemove: () => void;
}) {
  const item = it.material ?? it.tool;
  const name = item ? (language === 'PT' ? item.namePortuguese : item.nameEnglish) : `#${it.itemId}`;
  const qty = Number(it.quantity ?? 1);
  const price = Number(it.unitPrice ?? 0);
  const subtotal = qty * price;

  const [qtyDraft, setQtyDraft] = useState(qty.toFixed(2));
  const [priceDraft, setPriceDraft] = useState(price.toFixed(2));

  useEffect(() => { setQtyDraft(qty.toFixed(2)); }, [qty]);
  useEffect(() => { setPriceDraft(price.toFixed(2)); }, [price]);

  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);

  const link = it.itemType === 'material' && it.material ? `/material/${it.material.id}` : null;

  return (
    <div className="card" style={{ padding: '0.875rem 1rem', display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ minWidth: 0 }}>
        {link ? (
          <Link href={link} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {name}
          </Link>
        ) : (
          <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>{name}</span>
        )}
        {it.notes && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 2 }}>{it.notes}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          aria-label={t('Quantidade', 'Quantity')}
          className="input-dark"
          type="number"
          min={0}
          step={0.01}
          value={qtyDraft}
          onChange={e => setQtyDraft(e.target.value)}
          onBlur={() => {
            const next = Number(qtyDraft);
            if (!isNaN(next) && next >= 0 && Math.abs(next - qty) > 0.001) {
              onUpdate({ quantity: next.toFixed(2) });
            }
          }}
          style={{ width: 80, padding: '0.35rem 0.5rem', textAlign: 'right', fontSize: '0.8125rem' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>R$</span>
        <input
          aria-label={t('Preço unitário', 'Unit price')}
          className="input-dark"
          type="number"
          min={0}
          step={0.01}
          value={priceDraft}
          onChange={e => setPriceDraft(e.target.value)}
          onBlur={() => {
            const next = Number(priceDraft);
            if (!isNaN(next) && next >= 0 && Math.abs(next - price) > 0.001) {
              onUpdate({ unitPrice: next.toFixed(2) });
            }
          }}
          style={{ width: 100, padding: '0.35rem 0.5rem', textAlign: 'right', fontSize: '0.8125rem' }}
        />
      </div>

      <div style={{ minWidth: 100, textAlign: 'right', fontWeight: 700, color: 'var(--accent)', fontSize: '0.875rem' }}>
        R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm(t('Remover este item?', 'Remove this item?'))) onRemove();
        }}
        title={t('Remover', 'Remove')}
        style={{
          width: 30, height: 30, borderRadius: 999,
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
