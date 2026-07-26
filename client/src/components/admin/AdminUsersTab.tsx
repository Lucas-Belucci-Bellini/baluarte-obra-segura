import { useState } from 'react';
import { Loader2, ShieldCheck, User, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

export function AdminUsersTab() {
  const { language } = useLanguage();
  const pt = language === 'PT';
  const utils = trpc.useUtils();
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const { data: users = [], isLoading } = trpc.admin.listUsers.useQuery({ limit, offset });

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success(pt ? 'Papel atualizado' : 'Role updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTier = trpc.admin.updateUserTier.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success(pt ? 'Plano atualizado' : 'Tier updated');
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>;
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900">
          <tr className="text-zinc-400 text-xs uppercase">
            <th className="text-left px-4 py-3">ID</th>
            <th className="text-left px-4 py-3">{pt ? 'Nome' : 'Name'}</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">{pt ? 'Papel' : 'Role'}</th>
            <th className="text-left px-4 py-3">{pt ? 'Plano' : 'Tier'}</th>
            <th className="text-left px-4 py-3">{pt ? 'Cadastro' : 'Signed up'}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
              <td className="px-4 py-3 text-zinc-500">{u.id}</td>
              <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
              <td className="px-4 py-3 text-zinc-400">{u.email ?? '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={u.role}
                  onChange={(e) => updateRole.mutate({ userId: u.id, role: e.target.value as any })}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs"
                >
                  <option value="user">{pt ? 'Usuário' : 'User'}</option>
                  <option value="admin">Admin</option>
                </select>
                {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-orange-400 inline ml-1" />}
              </td>
              <td className="px-4 py-3">
                <select
                  value={u.tier}
                  onChange={(e) => updateTier.mutate({ userId: u.id, tier: e.target.value as any })}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                {u.tier === 'pro' && <Zap className="w-3 h-3 text-orange-400 inline ml-1" />}
                {u.tier === 'enterprise' && <Crown className="w-3 h-3 text-blue-400 inline ml-1" />}
              </td>
              <td className="px-4 py-3 text-zinc-500 text-xs">
                {new Date(u.createdAt).toLocaleDateString(pt ? 'pt-BR' : 'en-US')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 text-xs text-zinc-400">
        <span>{pt ? `Mostrando ${users.length} usuários` : `Showing ${users.length} users`}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30"
          >{pt ? 'Anterior' : 'Previous'}</button>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={users.length < limit}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30"
          >{pt ? 'Próxima' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
}
