import { useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

type FormState = {
  slug: string; categoryId: string;
  namePortuguese: string; nameEnglish: string;
  descriptionPortuguese: string; descriptionEnglish: string;
  riskLevel: 'RISCO_ALTO' | 'ATENCAO' | 'NORMAL';
  safetyWarningsPortuguese: string; safetyWarningsEnglish: string;
  antiScamPortuguese: string; antiScamEnglish: string;
  technicalSpecsPortuguese: string; technicalSpecsEnglish: string;
  standards: string; basePrice: string; priceUnit: string; imageUrl: string;
  featured: boolean;
};

const emptyForm: FormState = {
  slug: '', categoryId: '',
  namePortuguese: '', nameEnglish: '',
  descriptionPortuguese: '', descriptionEnglish: '',
  riskLevel: 'NORMAL',
  safetyWarningsPortuguese: '', safetyWarningsEnglish: '',
  antiScamPortuguese: '', antiScamEnglish: '',
  technicalSpecsPortuguese: '', technicalSpecsEnglish: '',
  standards: '', basePrice: '', priceUnit: '', imageUrl: '',
  featured: false,
};

export function AdminMaterialsTab() {
  const { language } = useLanguage();
  const pt = language === 'PT';
  const utils = trpc.useUtils();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: materials = [], isLoading } = trpc.materials.list.useQuery({ search: search || undefined, limit: 100 });
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const createMut = trpc.admin.createMaterial.useMutation({
    onSuccess: () => {
      utils.materials.list.invalidate();
      toast.success(pt ? 'Material criado' : 'Material created');
      setCreating(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = trpc.admin.updateMaterial.useMutation({
    onSuccess: () => {
      utils.materials.list.invalidate();
      toast.success(pt ? 'Salvo' : 'Saved');
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.admin.deleteMaterial.useMutation({
    onSuccess: () => {
      utils.materials.list.invalidate();
      toast.success(pt ? 'Excluído' : 'Deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (m: any) => {
    setForm({
      slug: m.slug, categoryId: String(m.categoryId),
      namePortuguese: m.namePortuguese, nameEnglish: m.nameEnglish,
      descriptionPortuguese: m.descriptionPortuguese ?? '', descriptionEnglish: m.descriptionEnglish ?? '',
      riskLevel: m.riskLevel,
      safetyWarningsPortuguese: m.safetyWarningsPortuguese ?? '', safetyWarningsEnglish: m.safetyWarningsEnglish ?? '',
      antiScamPortuguese: m.antiScamPortuguese ?? '', antiScamEnglish: m.antiScamEnglish ?? '',
      technicalSpecsPortuguese: m.technicalSpecsPortuguese ?? '', technicalSpecsEnglish: m.technicalSpecsEnglish ?? '',
      standards: m.standards ?? '', basePrice: m.basePrice ?? '', priceUnit: m.priceUnit ?? '',
      imageUrl: m.imageUrl ?? '', featured: !!m.featured,
    });
    setEditing(m.id);
    setCreating(false);
  };

  const submit = () => {
    const payload: any = {
      slug: form.slug.trim(),
      categoryId: parseInt(form.categoryId),
      namePortuguese: form.namePortuguese.trim(),
      nameEnglish: form.nameEnglish.trim(),
      descriptionPortuguese: form.descriptionPortuguese || null,
      descriptionEnglish: form.descriptionEnglish || null,
      riskLevel: form.riskLevel,
      safetyWarningsPortuguese: form.safetyWarningsPortuguese || null,
      safetyWarningsEnglish: form.safetyWarningsEnglish || null,
      antiScamPortuguese: form.antiScamPortuguese || null,
      antiScamEnglish: form.antiScamEnglish || null,
      technicalSpecsPortuguese: form.technicalSpecsPortuguese || null,
      technicalSpecsEnglish: form.technicalSpecsEnglish || null,
      standards: form.standards || null,
      basePrice: form.basePrice || null,
      priceUnit: form.priceUnit || null,
      imageUrl: form.imageUrl || null,
      featured: form.featured ? 1 : 0,
    };
    if (creating) createMut.mutate(payload);
    else if (editing) updateMut.mutate({ id: editing, patch: payload });
  };

  const showForm = creating || editing !== null;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={pt ? 'Buscar materiais...' : 'Search materials...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> {pt ? 'Novo material' : 'New material'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-orange-500/40 bg-zinc-900/70 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{creating ? (pt ? 'Novo material' : 'New material') : (pt ? 'Editar material' : 'Edit material')}</h3>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Categoria' : 'Category'}</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{pt ? c.namePortuguese : c.nameEnglish}</option>)}
              </select>
            </div>
            <Input label={pt ? 'Nome (PT)' : 'Name (PT)'} value={form.namePortuguese} onChange={(v) => setForm({ ...form, namePortuguese: v })} />
            <Input label={pt ? 'Nome (EN)' : 'Name (EN)'} value={form.nameEnglish} onChange={(v) => setForm({ ...form, nameEnglish: v })} />
            <Textarea label={pt ? 'Descrição (PT)' : 'Description (PT)'} value={form.descriptionPortuguese} onChange={(v) => setForm({ ...form, descriptionPortuguese: v })} />
            <Textarea label={pt ? 'Descrição (EN)' : 'Description (EN)'} value={form.descriptionEnglish} onChange={(v) => setForm({ ...form, descriptionEnglish: v })} />
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Nível de risco' : 'Risk level'}</label>
              <select
                value={form.riskLevel}
                onChange={(e) => setForm({ ...form, riskLevel: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              >
                <option value="NORMAL">Normal</option>
                <option value="ATENCAO">{pt ? 'Atenção' : 'Attention'}</option>
                <option value="RISCO_ALTO">{pt ? 'Risco alto' : 'High risk'}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <label className="text-sm">{pt ? 'Destaque' : 'Featured'}</label>
            </div>
            <Textarea label={pt ? 'Avisos de segurança (PT)' : 'Safety warnings (PT)'} value={form.safetyWarningsPortuguese} onChange={(v) => setForm({ ...form, safetyWarningsPortuguese: v })} />
            <Textarea label={pt ? 'Avisos de segurança (EN)' : 'Safety warnings (EN)'} value={form.safetyWarningsEnglish} onChange={(v) => setForm({ ...form, safetyWarningsEnglish: v })} />
            <Textarea label={pt ? 'Anti-golpe (PT)' : 'Anti-scam (PT)'} value={form.antiScamPortuguese} onChange={(v) => setForm({ ...form, antiScamPortuguese: v })} />
            <Textarea label={pt ? 'Anti-golpe (EN)' : 'Anti-scam (EN)'} value={form.antiScamEnglish} onChange={(v) => setForm({ ...form, antiScamEnglish: v })} />
            <Textarea label={pt ? 'Specs técnicas (PT)' : 'Tech specs (PT)'} value={form.technicalSpecsPortuguese} onChange={(v) => setForm({ ...form, technicalSpecsPortuguese: v })} />
            <Textarea label={pt ? 'Specs técnicas (EN)' : 'Tech specs (EN)'} value={form.technicalSpecsEnglish} onChange={(v) => setForm({ ...form, technicalSpecsEnglish: v })} />
            <Input label={pt ? 'Normas' : 'Standards'} value={form.standards} onChange={(v) => setForm({ ...form, standards: v })} />
            <Input label={pt ? 'Preço base' : 'Base price'} value={form.basePrice} onChange={(v) => setForm({ ...form, basePrice: v })} placeholder="45.90" />
            <Input label={pt ? 'Unidade' : 'Unit'} value={form.priceUnit} onChange={(v) => setForm({ ...form, priceUnit: v })} placeholder="saco 50kg" />
            <Input label="URL da imagem" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">
              {pt ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              onClick={submit}
              disabled={createMut.isPending || updateMut.isPending}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 inline animate-spin mr-2" />}
              {pt ? 'Salvar' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900">
              <tr className="text-zinc-400 text-xs uppercase">
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">{pt ? 'Nome' : 'Name'}</th>
                <th className="text-left px-4 py-3">{pt ? 'Risco' : 'Risk'}</th>
                <th className="text-left px-4 py-3">{pt ? 'Preço' : 'Price'}</th>
                <th className="text-right px-4 py-3">{pt ? 'Ações' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m: any) => (
                <tr key={m.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-4 py-3 text-zinc-500">{m.id}</td>
                  <td className="px-4 py-3 font-medium">{pt ? m.namePortuguese : m.nameEnglish}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      m.riskLevel === 'RISCO_ALTO' ? 'bg-red-500/20 text-red-300' :
                      m.riskLevel === 'ATENCAO' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {m.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {m.basePrice ? `R$ ${m.basePrice}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-zinc-700 rounded" title={pt ? 'Editar' : 'Edit'}>
                      <Pencil className="w-4 h-4 text-zinc-300" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(pt ? 'Excluir este material?' : 'Delete this material?')) deleteMut.mutate({ id: m.id });
                      }}
                      className="p-1.5 hover:bg-red-500/20 rounded ml-1"
                      title={pt ? 'Excluir' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-zinc-400 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="md:col-span-1">
      <label className="text-xs text-zinc-400 block mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y font-mono"
      />
    </div>
  );
}
