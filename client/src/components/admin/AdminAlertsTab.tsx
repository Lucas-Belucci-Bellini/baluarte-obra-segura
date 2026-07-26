import { useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

type FormState = {
  slug: string;
  severity: 'critical' | 'warning' | 'info';
  titlePortuguese: string; titleEnglish: string;
  contentPortuguese: string; contentEnglish: string;
  source: string; sourceUrl: string;
};

const emptyForm: FormState = {
  slug: '', severity: 'info',
  titlePortuguese: '', titleEnglish: '',
  contentPortuguese: '', contentEnglish: '',
  source: '', sourceUrl: '',
};

const SEV_COLORS = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/50',
  warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
};

export function AdminAlertsTab() {
  const { language } = useLanguage();
  const pt = language === 'PT';
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: alerts = [], isLoading } = trpc.alerts.list.useQuery({ limit: 100 });

  const createMut = trpc.admin.createAlert.useMutation({
    onSuccess: () => { utils.alerts.list.invalidate(); toast.success(pt ? 'Alerta publicado' : 'Alert published'); setCreating(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.admin.updateAlert.useMutation({
    onSuccess: () => { utils.alerts.list.invalidate(); toast.success(pt ? 'Salvo' : 'Saved'); setEditing(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.admin.deleteAlert.useMutation({
    onSuccess: () => { utils.alerts.list.invalidate(); toast.success(pt ? 'Excluído' : 'Deleted'); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (a: any) => {
    setForm({
      slug: a.slug, severity: a.severity,
      titlePortuguese: a.titlePortuguese, titleEnglish: a.titleEnglish,
      contentPortuguese: a.contentPortuguese, contentEnglish: a.contentEnglish,
      source: a.source ?? '', sourceUrl: a.sourceUrl ?? '',
    });
    setEditing(a.id); setCreating(false);
  };

  const submit = () => {
    const payload: any = {
      slug: form.slug.trim(), severity: form.severity,
      titlePortuguese: form.titlePortuguese.trim(), titleEnglish: form.titleEnglish.trim(),
      contentPortuguese: form.contentPortuguese, contentEnglish: form.contentEnglish,
      source: form.source || null, sourceUrl: form.sourceUrl || null,
    };
    if (creating) createMut.mutate(payload);
    else if (editing) updateMut.mutate({ id: editing, patch: payload });
  };

  const showForm = creating || editing !== null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setCreating(true); setEditing(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> {pt ? 'Novo alerta' : 'New alert'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-orange-500/40 bg-zinc-900/70 p-6 space-y-4">
          <div className="flex justify-between">
            <h3 className="font-semibold">{creating ? (pt ? 'Publicar alerta' : 'Publish alert') : (pt ? 'Editar alerta' : 'Edit alert')}</h3>
            <button onClick={() => { setCreating(false); setEditing(null); }}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Severidade' : 'Severity'}</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as any })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm">
                <option value="info">Info</option>
                <option value="warning">{pt ? 'Aviso' : 'Warning'}</option>
                <option value="critical">{pt ? 'Crítico' : 'Critical'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Título (PT)' : 'Title (PT)'}</label>
              <input type="text" value={form.titlePortuguese} onChange={(e) => setForm({ ...form, titlePortuguese: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Título (EN)' : 'Title (EN)'}</label>
              <input type="text" value={form.titleEnglish} onChange={(e) => setForm({ ...form, titleEnglish: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Conteúdo (PT)' : 'Content (PT)'}</label>
              <textarea value={form.contentPortuguese} onChange={(e) => setForm({ ...form, contentPortuguese: e.target.value })} rows={5} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Conteúdo (EN)' : 'Content (EN)'}</label>
              <textarea value={form.contentEnglish} onChange={(e) => setForm({ ...form, contentEnglish: e.target.value })} rows={5} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Fonte' : 'Source'}</label>
              <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Inmetro, ABNT..." className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">URL {pt ? 'da fonte' : 'source'}</label>
              <input type="text" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://..." className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">{pt ? 'Cancelar' : 'Cancel'}</button>
            <button onClick={submit} disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 inline animate-spin mr-2" />}
              {pt ? 'Publicar' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a: any) => (
            <div key={a.id} className={`rounded-xl border p-4 ${SEV_COLORS[a.severity as keyof typeof SEV_COLORS]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs uppercase font-semibold">{a.severity}</span>
                    <span className="text-xs text-zinc-500">#{a.id}</span>
                  </div>
                  <h3 className="font-semibold text-zinc-100">{pt ? a.titlePortuguese : a.titleEnglish}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{pt ? a.contentPortuguese : a.contentEnglish}</p>
                  {a.source && <p className="text-xs text-zinc-500 mt-2">{pt ? 'Fonte: ' : 'Source: '}{a.source}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-zinc-700 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm(pt ? 'Excluir alerta?' : 'Delete alert?')) deleteMut.mutate({ id: a.id }); }} className="p-1.5 hover:bg-red-500/30 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
