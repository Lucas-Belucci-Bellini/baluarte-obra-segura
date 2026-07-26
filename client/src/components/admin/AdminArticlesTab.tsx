import { useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

type FormState = {
  slug: string; categoryId: string;
  titlePortuguese: string; titleEnglish: string;
  summaryPortuguese: string; summaryEnglish: string;
  contentPortuguese: string; contentEnglish: string;
  readingTimeMinutes: string; featured: boolean;
};

const emptyForm: FormState = {
  slug: '', categoryId: '',
  titlePortuguese: '', titleEnglish: '',
  summaryPortuguese: '', summaryEnglish: '',
  contentPortuguese: '', contentEnglish: '',
  readingTimeMinutes: '5', featured: false,
};

export function AdminArticlesTab() {
  const { language } = useLanguage();
  const pt = language === 'PT';
  const utils = trpc.useUtils();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: articles = [], isLoading } = trpc.knowledgeBase.articles.useQuery({ search: search || undefined, limit: 50 });
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const createMut = trpc.admin.createArticle.useMutation({
    onSuccess: () => { utils.knowledgeBase.articles.invalidate(); toast.success(pt ? 'Artigo criado' : 'Article created'); setCreating(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.admin.updateArticle.useMutation({
    onSuccess: () => { utils.knowledgeBase.articles.invalidate(); toast.success(pt ? 'Salvo' : 'Saved'); setEditing(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.admin.deleteArticle.useMutation({
    onSuccess: () => { utils.knowledgeBase.articles.invalidate(); toast.success(pt ? 'Excluído' : 'Deleted'); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (a: any) => {
    setForm({
      slug: a.slug, categoryId: a.categoryId ? String(a.categoryId) : '',
      titlePortuguese: a.titlePortuguese, titleEnglish: a.titleEnglish,
      summaryPortuguese: a.summaryPortuguese ?? '', summaryEnglish: a.summaryEnglish ?? '',
      contentPortuguese: a.contentPortuguese, contentEnglish: a.contentEnglish,
      readingTimeMinutes: String(a.readingTimeMinutes ?? 5), featured: !!a.featured,
    });
    setEditing(a.id); setCreating(false);
  };

  const submit = () => {
    const payload: any = {
      slug: form.slug.trim(),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      titlePortuguese: form.titlePortuguese.trim(), titleEnglish: form.titleEnglish.trim(),
      summaryPortuguese: form.summaryPortuguese || null, summaryEnglish: form.summaryEnglish || null,
      contentPortuguese: form.contentPortuguese, contentEnglish: form.contentEnglish,
      readingTimeMinutes: parseInt(form.readingTimeMinutes) || 5,
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
          <input type="text" placeholder={pt ? 'Buscar artigos...' : 'Search articles...'} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm" />
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> {pt ? 'Novo artigo' : 'New article'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-orange-500/40 bg-zinc-900/70 p-6 space-y-4">
          <div className="flex justify-between">
            <h3 className="font-semibold">{creating ? (pt ? 'Novo artigo' : 'New article') : (pt ? 'Editar artigo' : 'Edit article')}</h3>
            <button onClick={() => { setCreating(false); setEditing(null); }}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Categoria' : 'Category'}</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm">
                <option value="">{pt ? '— Sem categoria —' : '— No category —'}</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{pt ? c.namePortuguese : c.nameEnglish}</option>)}
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
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Resumo (PT)' : 'Summary (PT)'}</label>
              <textarea value={form.summaryPortuguese} onChange={(e) => setForm({ ...form, summaryPortuguese: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Resumo (EN)' : 'Summary (EN)'}</label>
              <textarea value={form.summaryEnglish} onChange={(e) => setForm({ ...form, summaryEnglish: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Conteúdo (PT) — Markdown' : 'Content (PT) — Markdown'}</label>
              <textarea value={form.contentPortuguese} onChange={(e) => setForm({ ...form, contentPortuguese: e.target.value })} rows={10} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y font-mono" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Conteúdo (EN) — Markdown' : 'Content (EN) — Markdown'}</label>
              <textarea value={form.contentEnglish} onChange={(e) => setForm({ ...form, contentEnglish: e.target.value })} rows={10} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm resize-y font-mono" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">{pt ? 'Tempo de leitura (min)' : 'Reading time (min)'}</label>
              <input type="number" value={form.readingTimeMinutes} onChange={(e) => setForm({ ...form, readingTimeMinutes: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <label className="text-sm">{pt ? 'Destaque' : 'Featured'}</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">{pt ? 'Cancelar' : 'Cancel'}</button>
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
                <th className="text-left px-4 py-3">{pt ? 'Título' : 'Title'}</th>
                <th className="text-left px-4 py-3">{pt ? 'Tempo' : 'Time'}</th>
                <th className="text-left px-4 py-3">Views</th>
                <th className="text-right px-4 py-3">{pt ? 'Ações' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a: any) => (
                <tr key={a.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-4 py-3 text-zinc-500">{a.id}</td>
                  <td className="px-4 py-3 font-medium">{pt ? a.titlePortuguese : a.titleEnglish}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{a.readingTimeMinutes} min</td>
                  <td className="px-4 py-3 text-zinc-400">{a.viewCount ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-zinc-700 rounded"><Pencil className="w-4 h-4 text-zinc-300" /></button>
                    <button onClick={() => { if (confirm(pt ? 'Excluir?' : 'Delete?')) deleteMut.mutate({ id: a.id }); }} className="p-1.5 hover:bg-red-500/20 rounded ml-1">
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
