import { useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

type FormState = {
  slug: string; toolCategoryId: string;
  namePortuguese: string; nameEnglish: string;
  descriptionPortuguese: string; descriptionEnglish: string;
  safetyPortuguese: string; safetyEnglish: string;
  technicalSpecsPortuguese: string; technicalSpecsEnglish: string;
  powerType: 'corded' | 'battery' | 'manual' | 'pneumatic' | 'hydraulic';
  professionLevel: 'beginner' | 'intermediate' | 'professional';
  basePrice: string; imageUrl: string; featured: boolean;
};

const emptyForm: FormState = {
  slug: '', toolCategoryId: '',
  namePortuguese: '', nameEnglish: '',
  descriptionPortuguese: '', descriptionEnglish: '',
  safetyPortuguese: '', safetyEnglish: '',
  technicalSpecsPortuguese: '', technicalSpecsEnglish: '',
  powerType: 'manual', professionLevel: 'beginner',
  basePrice: '', imageUrl: '', featured: false,
};

export function AdminToolsTab() {
  const { language } = useLanguage();
  const pt = language === 'PT';
  const utils = trpc.useUtils();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: tools = [], isLoading } = trpc.tools.list.useQuery({ search: search || undefined, limit: 100 });
  const { data: toolCategories = [] } = trpc.toolCategories.list.useQuery();

  const createMut = trpc.admin.createTool.useMutation({
    onSuccess: () => { utils.tools.list.invalidate(); toast.success(pt ? 'Ferramenta criada' : 'Tool created'); setCreating(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.admin.updateTool.useMutation({
    onSuccess: () => { utils.tools.list.invalidate(); toast.success(pt ? 'Salvo' : 'Saved'); setEditing(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.admin.deleteTool.useMutation({
    onSuccess: () => { utils.tools.list.invalidate(); toast.success(pt ? 'Excluído' : 'Deleted'); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (t: any) => {
    setForm({
      slug: t.slug, toolCategoryId: String(t.toolCategoryId),
      namePortuguese: t.namePortuguese, nameEnglish: t.nameEnglish,
      descriptionPortuguese: t.descriptionPortuguese ?? '', descriptionEnglish: t.descriptionEnglish ?? '',
      safetyPortuguese: t.safetyPortuguese ?? '', safetyEnglish: t.safetyEnglish ?? '',
      technicalSpecsPortuguese: t.technicalSpecsPortuguese ?? '', technicalSpecsEnglish: t.technicalSpecsEnglish ?? '',
      powerType: t.powerType, professionLevel: t.professionLevel,
      basePrice: t.basePrice ?? '', imageUrl: t.imageUrl ?? '', featured: !!t.featured,
    });
    setEditing(t.id); setCreating(false);
  };

  const submit = () => {
    const payload: any = {
      slug: form.slug.trim(), toolCategoryId: parseInt(form.toolCategoryId),
      namePortuguese: form.namePortuguese.trim(), nameEnglish: form.nameEnglish.trim(),
      descriptionPortuguese: form.descriptionPortuguese || null, descriptionEnglish: form.descriptionEnglish || null,
      safetyPortuguese: form.safetyPortuguese || null, safetyEnglish: form.safetyEnglish || null,
      technicalSpecsPortuguese: form.technicalSpecsPortuguese || null, technicalSpecsEnglish: form.technicalSpecsEnglish || null,
      powerType: form.powerType, professionLevel: form.professionLevel,
      basePrice: form.basePrice || null, imageUrl: form.imageUrl || null,
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
            placeholder={pt ? 'Buscar ferramentas...' : 'Search tools...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> {pt ? 'Nova ferramenta' : 'New tool'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-orange-500/40 bg-zinc-900/70 p-6 space-y-4">
          <div className="flex justify-between">
            <h3 className="font-semibold">{creating ? (pt ? 'Nova ferramenta' : 'New tool') : (pt ? 'Editar ferramenta' : 'Edit tool')}</h3>
            <button onClick={() => { setCreating(false); setEditing(null); }}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Categoria' : 'Category'}</label>
              <select value={form.toolCategoryId} onChange={(e) => setForm({ ...form, toolCategoryId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm">
                <option value="">—</option>
                {toolCategories.map((c: any) => <option key={c.id} value={c.id}>{pt ? c.namePortuguese : c.nameEnglish}</option>)}
              </select>
            </div>
            <Input label={pt ? 'Nome (PT)' : 'Name (PT)'} value={form.namePortuguese} onChange={(v) => setForm({ ...form, namePortuguese: v })} />
            <Input label={pt ? 'Nome (EN)' : 'Name (EN)'} value={form.nameEnglish} onChange={(v) => setForm({ ...form, nameEnglish: v })} />
            <Textarea label={pt ? 'Descrição (PT)' : 'Description (PT)'} value={form.descriptionPortuguese} onChange={(v) => setForm({ ...form, descriptionPortuguese: v })} />
            <Textarea label={pt ? 'Descrição (EN)' : 'Description (EN)'} value={form.descriptionEnglish} onChange={(v) => setForm({ ...form, descriptionEnglish: v })} />
            <Textarea label={pt ? 'Segurança (PT)' : 'Safety (PT)'} value={form.safetyPortuguese} onChange={(v) => setForm({ ...form, safetyPortuguese: v })} />
            <Textarea label={pt ? 'Segurança (EN)' : 'Safety (EN)'} value={form.safetyEnglish} onChange={(v) => setForm({ ...form, safetyEnglish: v })} />
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Fonte de energia' : 'Power type'}</label>
              <select value={form.powerType} onChange={(e) => setForm({ ...form, powerType: e.target.value as any })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm">
                <option value="manual">Manual</option>
                <option value="corded">{pt ? 'Com fio' : 'Corded'}</option>
                <option value="battery">{pt ? 'Bateria' : 'Battery'}</option>
                <option value="pneumatic">{pt ? 'Pneumática' : 'Pneumatic'}</option>
                <option value="hydraulic">{pt ? 'Hidráulica' : 'Hydraulic'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Nível' : 'Level'}</label>
              <select value={form.professionLevel} onChange={(e) => setForm({ ...form, professionLevel: e.target.value as any })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm">
                <option value="beginner">{pt ? 'Iniciante' : 'Beginner'}</option>
                <option value="intermediate">{pt ? 'Intermediário' : 'Intermediate'}</option>
                <option value="professional">{pt ? 'Profissional' : 'Professional'}</option>
              </select>
            </div>
            <Input label={pt ? 'Preço base' : 'Base price'} value={form.basePrice} onChange={(v) => setForm({ ...form, basePrice: v })} />
            <Input label="URL da imagem" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <label className="text-sm">{pt ? 'Destaque' : 'Featured'}</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">
              {pt ? 'Cancelar' : 'Cancel'}
            </button>
            <button onClick={submit} disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium disabled:opacity-50">
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
                <th className="text-left px-4 py-3">{pt ? 'Energia' : 'Power'}</th>
                <th className="text-left px-4 py-3">{pt ? 'Nível' : 'Level'}</th>
                <th className="text-right px-4 py-3">{pt ? 'Ações' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t: any) => (
                <tr key={t.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-4 py-3 text-zinc-500">{t.id}</td>
                  <td className="px-4 py-3 font-medium">{pt ? t.namePortuguese : t.nameEnglish}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{t.powerType}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{t.professionLevel}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-zinc-700 rounded"><Pencil className="w-4 h-4 text-zinc-300" /></button>
                    <button onClick={() => { if (confirm(pt ? 'Excluir?' : 'Delete?')) deleteMut.mutate({ id: t.id }); }} className="p-1.5 hover:bg-red-500/20 rounded ml-1">
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

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-400 block mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-400 block mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y font-mono" />
    </div>
  );
}
