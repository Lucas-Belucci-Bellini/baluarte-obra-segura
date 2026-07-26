import { Loader2, Building2, Check, X, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  suspended: 'bg-red-500/20 text-red-300',
  inactive: 'bg-zinc-700 text-zinc-400',
};

export function AdminPartnersTab() {
  const { language } = useLanguage();
  const pt = language === 'PT';
  const utils = trpc.useUtils();

  const { data: partners = [], isLoading } = trpc.admin.listPartners.useQuery();

  const updateStatus = trpc.admin.updatePartnerStatus.useMutation({
    onSuccess: () => {
      utils.admin.listPartners.invalidate();
      toast.success(pt ? 'Status atualizado' : 'Status updated');
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {partners.length === 0 && (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          {pt ? 'Nenhum parceiro cadastrado ainda' : 'No partners registered yet'}
        </div>
      )}
      {partners.map((p: any) => (
        <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs uppercase font-semibold px-2 py-0.5 rounded ${STATUS_COLORS[p.status as keyof typeof STATUS_COLORS]}`}>
                  {p.status}
                </span>
                <span className="text-xs text-zinc-500">#{p.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">{p.tier}</span>
              </div>
              <h3 className="font-semibold text-zinc-100">{p.companyName ?? p.name}</h3>
              <p className="text-sm text-zinc-400">{p.email}</p>
              {p.cnpj && <p className="text-xs text-zinc-500 mt-1">CNPJ: {p.cnpj}</p>}
              {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:underline">{p.website}</a>}
              <div className="text-xs text-zinc-500 mt-2">
                {pt ? 'Uso hoje: ' : 'Usage today: '}{p.dailyUsage}/{p.dailyQuota}
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {p.status !== 'active' && (
                <button
                  onClick={() => updateStatus.mutate({ id: p.id, status: 'active' })}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs"
                >
                  <Check className="w-3 h-3" /> {pt ? 'Aprovar' : 'Approve'}
                </button>
              )}
              {p.status !== 'suspended' && (
                <button
                  onClick={() => updateStatus.mutate({ id: p.id, status: 'suspended' })}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs"
                >
                  <Pause className="w-3 h-3" /> {pt ? 'Suspender' : 'Suspend'}
                </button>
              )}
              {p.status !== 'inactive' && (
                <button
                  onClick={() => updateStatus.mutate({ id: p.id, status: 'inactive' })}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs"
                >
                  <X className="w-3 h-3" /> {pt ? 'Desativar' : 'Deactivate'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
