import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Building2, Copy, RefreshCw, CheckCircle, Package, Wrench, TrendingUp, Clock, Code2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'var(--success)', pending: 'var(--warning)',
    suspended: 'var(--danger)', inactive: 'var(--text-muted)',
  };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      background: `${colors[status]}22`, color: colors[status],
      border: `1px solid ${colors[status]}55`,
    }}>
      {status}
    </span>
  );
}

export default function PartnerDashboard() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const t = (pt: string, en: string) => language === 'PT' ? pt : en;
  const [copied, setCopied] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const { data: partner, isLoading, refetch } = trpc.partners.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: syncLogs = [] } = trpc.partners.syncLogs.useQuery(undefined, { enabled: !!partner });
  const { data: products = [] } = trpc.partners.products.useQuery(undefined, { enabled: !!partner });

  const regen = trpc.partners.regenerateKey.useMutation({
    onSuccess: (data) => {
      toast.success(t('Nova API Key gerada!', 'New API Key generated!'));
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  function copyKey(key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      toast.success(t('Copiado!', 'Copied!'));
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
        <Navigation />
        <div style={{ paddingTop: '8rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>{t('Faça login para acessar o painel.', 'Log in to access the dashboard.')}</p>
          <Link href="/login" style={{ color: 'var(--accent)' }}>{t('Entrar', 'Login')}</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
        <Navigation />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 1.5rem' }}>
          {[120, 80, 200].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 12, marginBottom: '1rem' }} />)}
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
        <Navigation />
        <div style={{ paddingTop: '8rem', textAlign: 'center', padding: '8rem 1.5rem' }}>
          <Building2 size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 1.25rem', display: 'block' }} />
          <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>{t('Você não tem conta de parceiro', 'You don\'t have a partner account')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {t('Cadastre sua loja para integrar preços na plataforma WikiBuild.', 'Register your store to integrate prices on the WikiBuild platform.')}
          </p>
          <Link href="/parceiros" style={{ background: 'var(--accent)', color: 'white', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {t('Cadastrar loja', 'Register store')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const totalUpdated = (syncLogs as any[]).reduce((s: number, l: any) => s + (l.itemsUpdated || 0), 0);
  const lastSync = (syncLogs as any[])[0];
  const quotaUsed = partner.dailyUsage ?? 0;
  const quotaTotal = partner.dailyQuota ?? 100;
  const quotaPct = Math.min(100, Math.round((quotaUsed / quotaTotal) * 100));

  const baseUrl = window.location.origin;

  const codeExample = `curl -X POST ${baseUrl}/api/v1/partner/prices \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${partner.apiKey}" \\
  -d '{
    "items": [
      { "materialId": 1, "price": "28.90", "unit": "saco 50kg", "sku": "CIM-001", "stockQty": 120 },
      { "materialId": 5, "price": "45.00", "unit": "m²", "sku": "AZU-012", "stockQty": 50 }
    ]
  }'`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      <Navigation />
      <div style={{ paddingTop: '4rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  {partner.companyName || partner.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 4 }}>
                  <StatusBadge status={partner.status} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', background: 'var(--accent-muted)', padding: '2px 8px', borderRadius: 999 }}>
                    {partner.tier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending warning */}
          {partner.status === 'pending' && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>{t('Conta em análise', 'Account under review')}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('Sua conta está aguardando aprovação. Em breve você receberá acesso completo à API.', 'Your account is awaiting approval. You\'ll get full API access shortly.')}
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { icon: Package, label: t('Produtos sincronizados', 'Synced products'), value: String((products as any[]).length) },
              { icon: TrendingUp, label: t('Total atualizações', 'Total updates'), value: String(totalUpdated) },
              { icon: Clock, label: t('Última sync', 'Last sync'), value: lastSync ? new Date(lastSync.createdAt).toLocaleDateString('pt-BR') : '—' },
              { icon: RefreshCw, label: t('Quota hoje', 'Today\'s quota'), value: `${quotaUsed}/${quotaTotal}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                <Icon size={18} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Quota bar */}
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{t('Quota diária', 'Daily quota')}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{quotaUsed} / {quotaTotal} {t('sincronizações', 'syncs')}</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 999 }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${quotaPct}%`, background: quotaPct > 80 ? 'var(--danger)' : 'var(--accent)', transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* API Key */}
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ color: 'var(--text)', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>API Key</h3>
              <button
                type="button"
                onClick={() => { if (window.confirm(t('Isso invalidará a chave atual. Continuar?', 'This will invalidate the current key. Continue?'))) regen.mutate(); }}
                disabled={regen.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}
              >
                <RefreshCw size={13} />{t('Regenerar', 'Regenerate')}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.875rem 1rem' }}>
              <code style={{ flex: 1, fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {partner.apiKey.slice(0, 16)}{'•'.repeat(partner.apiKey.length - 16)}
              </code>
              <button type="button" onClick={() => copyKey(partner.apiKey)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0 }}>
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Sync logs */}
          {(syncLogs as any[]).length > 0 && (
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>
                {t('Histórico de sincronização', 'Sync history')}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-3)' }}>
                      {[t('Data', 'Date'), t('Enviados', 'Submitted'), t('Atualizados', 'Updated'), t('Falhas', 'Failed')].map(h => (
                        <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(syncLogs as any[]).map((log: any) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.625rem 1rem', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                        <td style={{ padding: '0.625rem 1rem', color: 'var(--text)' }}>{log.itemsSubmitted}</td>
                        <td style={{ padding: '0.625rem 1rem', color: 'var(--success)' }}>{log.itemsUpdated}</td>
                        <td style={{ padding: '0.625rem 1rem', color: log.itemsFailed > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{log.itemsFailed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* API Docs */}
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowDocs(d => !d)}
              style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Code2 size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{t('Documentação da API', 'API Documentation')}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{showDocs ? '▲' : '▼'}</span>
            </button>

            {showDocs && (
              <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
                  {[
                    { method: 'GET', path: '/api/v1/partner/me', desc: t('Retorna dados da sua conta', 'Returns your account data') },
                    { method: 'POST', path: '/api/v1/partner/prices', desc: t('Envia/atualiza preços em lote (max 500)', 'Bulk upsert prices (max 500)') },
                    { method: 'GET', path: '/api/v1/partner/products', desc: t('Lista produtos sincronizados', 'List synced products') },
                    { method: 'GET', path: '/api/v1/partner/sync-log', desc: t('Histórico das últimas 20 sincronizações', 'Last 20 sync history entries') },
                  ].map(ep => (
                    <div key={ep.path} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: ep.method === 'POST' ? 'rgba(249,115,22,0.2)' : 'rgba(99,102,241,0.2)', color: ep.method === 'POST' ? 'var(--accent)' : '#818cf8', flexShrink: 0 }}>{ep.method}</span>
                      <div>
                        <code style={{ fontSize: '0.8rem', color: 'var(--text)', fontFamily: 'monospace' }}>{ep.path}</code>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{ep.desc}</div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{t('Exemplo — enviar preços', 'Example — send prices')}</div>
                    <pre style={{
                      background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8,
                      padding: '0.875rem', fontSize: '0.72rem', color: 'var(--text-muted)',
                      overflow: 'auto', lineHeight: 1.6, margin: 0, fontFamily: 'monospace',
                    }}>
                      {codeExample}
                    </pre>
                  </div>

                  <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                      {t('Campos aceitos por item:', 'Accepted fields per item:')}
                    </div>
                    {[
                      { field: 'materialId / toolId', desc: t('ID do material ou ferramenta (obrigatório um dos dois)', 'Material or tool ID (one required)'), required: true },
                      { field: 'price', desc: t('Preço em reais, string ex: "28.90" (obrigatório)', 'Price in BRL, string e.g. "28.90" (required)'), required: true },
                      { field: 'sku', desc: t('Código interno da sua loja', 'Your store\'s internal code'), required: false },
                      { field: 'unit', desc: t('Unidade ex: "saco 50kg", "m²"', 'Unit e.g. "50kg bag", "m²"'), required: false },
                      { field: 'stockQty', desc: t('Quantidade em estoque', 'Stock quantity'), required: false },
                      { field: 'storeUrl', desc: t('URL do produto na sua loja', 'Product URL in your store'), required: false },
                    ].map(f => (
                      <div key={f.field} style={{ display: 'flex', gap: '0.5rem', marginBottom: 6 }}>
                        <code style={{ fontSize: '0.72rem', color: 'var(--accent)', minWidth: 130, fontFamily: 'monospace' }}>{f.field}</code>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.desc}</span>
                        {f.required && <span style={{ fontSize: '0.62rem', color: 'var(--danger)', fontWeight: 700, flexShrink: 0 }}>*</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
