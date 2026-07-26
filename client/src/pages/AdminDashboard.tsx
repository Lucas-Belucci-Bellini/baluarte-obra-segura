import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Users, Package, Wrench, BookOpen, AlertTriangle, Building2, BarChart3,
  Loader2, ShieldCheck, TrendingUp, Heart, FolderKanban, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminMaterialsTab } from '@/components/admin/AdminMaterialsTab';
import { AdminToolsTab } from '@/components/admin/AdminToolsTab';
import { AdminArticlesTab } from '@/components/admin/AdminArticlesTab';
import { AdminAlertsTab } from '@/components/admin/AdminAlertsTab';
import { AdminPartnersTab } from '@/components/admin/AdminPartnersTab';

type Tab = 'overview' | 'users' | 'materials' | 'tools' | 'articles' | 'alerts' | 'partners';

const TABS: { id: Tab; icon: typeof Users; labelPT: string; labelEN: string }[] = [
  { id: 'overview',  icon: BarChart3,     labelPT: 'Visão geral',   labelEN: 'Overview' },
  { id: 'users',     icon: Users,         labelPT: 'Usuários',      labelEN: 'Users' },
  { id: 'materials', icon: Package,       labelPT: 'Materiais',     labelEN: 'Materials' },
  { id: 'tools',     icon: Wrench,        labelPT: 'Ferramentas',   labelEN: 'Tools' },
  { id: 'articles',  icon: BookOpen,      labelPT: 'Artigos',       labelEN: 'Articles' },
  { id: 'alerts',    icon: AlertTriangle, labelPT: 'Alertas',       labelEN: 'Alerts' },
  { id: 'partners',  icon: Building2,     labelPT: 'Parceiros',     labelEN: 'Partners' },
];

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>('overview');
  const pt = language === 'PT';

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (user?.role !== 'admin') {
      toast.error(pt ? 'Acesso restrito a administradores' : 'Admin access only');
      setLocation('/');
    }
  }, [loading, isAuthenticated, user, setLocation, pt]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <ShieldCheck className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{pt ? 'Painel Admin' : 'Admin Panel'}</h1>
            <p className="text-sm text-zinc-400">{pt ? 'Gerenciamento do WikiBuild Baluarte' : 'WikiBuild Baluarte management'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800 pb-4">
          {TABS.map(({ id, icon: Icon, labelPT, labelEN }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {pt ? labelPT : labelEN}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'overview'  && <OverviewTab />}
          {tab === 'users'     && <AdminUsersTab />}
          {tab === 'materials' && <AdminMaterialsTab />}
          {tab === 'tools'     && <AdminToolsTab />}
          {tab === 'articles'  && <AdminArticlesTab />}
          {tab === 'alerts'    && <AdminAlertsTab />}
          {tab === 'partners'  && <AdminPartnersTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { language } = useLanguage();
  const { data: metrics, isLoading } = trpc.admin.metrics.useQuery();
  const pt = language === 'PT';

  if (isLoading || !metrics) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>;
  }

  const stats = [
    { icon: Users,         color: 'text-blue-400',   labelPT: 'Usuários',       labelEN: 'Users',        value: metrics.users },
    { icon: Package,       color: 'text-orange-400', labelPT: 'Materiais',      labelEN: 'Materials',    value: metrics.materials },
    { icon: Wrench,        color: 'text-purple-400', labelPT: 'Ferramentas',    labelEN: 'Tools',        value: metrics.tools },
    { icon: BookOpen,      color: 'text-green-400',  labelPT: 'Artigos',        labelEN: 'Articles',     value: metrics.articles },
    { icon: AlertTriangle, color: 'text-red-400',    labelPT: 'Alertas',        labelEN: 'Alerts',       value: metrics.alerts },
    { icon: Building2,     color: 'text-cyan-400',   labelPT: 'Parceiros',      labelEN: 'Partners',     value: metrics.partners },
    { icon: Heart,         color: 'text-pink-400',   labelPT: 'Favoritos',      labelEN: 'Saved items',  value: metrics.savedItems },
    { icon: FolderKanban,  color: 'text-amber-400',  labelPT: 'Projetos',       labelEN: 'Projects',     value: metrics.projects },
    { icon: MessageSquare, color: 'text-teal-400',   labelPT: 'Conversas IA',   labelEN: 'AI conversations', value: metrics.conversations },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-zinc-800`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold">{s.value.toLocaleString(pt ? 'pt-BR' : 'en-US')}</div>
              <div className="text-sm text-zinc-400 mt-1">{pt ? s.labelPT : s.labelEN}</div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <DistCard title={pt ? 'Usuários por tier' : 'Users by tier'} rows={metrics.tierCounts.map(t => ({ label: t.tier, value: t.count }))} />
        <DistCard title={pt ? 'Parceiros por status' : 'Partners by status'} rows={metrics.partnerStatusCounts.map(t => ({ label: t.status, value: t.count }))} />
        <DistCard title={pt ? 'Materiais por risco' : 'Materials by risk'} rows={metrics.riskCounts.map(t => ({ label: t.risk, value: t.count }))} />
      </div>
    </div>
  );
}

function DistCard({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const total = Math.max(1, rows.reduce((s, r) => s + r.value, 0));
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-orange-400" />
        {title}
      </h3>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400 capitalize">{r.label}</span>
              <span className="text-zinc-200 font-semibold">{r.value}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${(r.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
