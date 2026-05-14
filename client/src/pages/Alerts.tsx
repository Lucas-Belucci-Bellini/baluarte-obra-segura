import { useState } from 'react';
import { Link } from 'wouter';
import { Bell, ShieldAlert, AlertTriangle, Info, ExternalLink, Check, Filter } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Severity = 'critical' | 'warning' | 'info' | 'all';

function timeAgo(date: string | Date, language: string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return language === 'PT' ? 'agora' : 'now';
  if (min < 60) return language === 'PT' ? `${min} min` : `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return language === 'PT' ? `${hr}h` : `${hr}h`;
  const days = Math.floor(hr / 24);
  return language === 'PT' ? `${days} d` : `${days}d`;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === 'critical') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
      background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)',
    }}>
      <ShieldAlert size={11} /> {severity.toUpperCase()}
    </span>
  );
  if (severity === 'warning') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
      background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)',
    }}>
      <AlertTriangle size={11} /> {severity.toUpperCase()}
    </span>
  );
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
      background: 'var(--bg-3)', color: 'var(--text-muted)', border: '1px solid var(--border)',
    }}>
      <Info size={11} /> INFO
    </span>
  );
}

function SeverityIcon({ severity, size = 18 }: { severity: string; size?: number }) {
  if (severity === 'critical') return <ShieldAlert size={size} style={{ color: 'var(--danger)' }} />;
  if (severity === 'warning') return <AlertTriangle size={size} style={{ color: 'var(--warning)' }} />;
  return <Info size={size} style={{ color: 'var(--text-muted)' }} />;
}

export default function Alerts() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [severity, setSeverity] = useState<Severity>('all');
  const utils = trpc.useUtils();
  const t = (pt: string, en: string) => language === 'PT' ? pt : en;

  const { data: alerts = [], isLoading } = trpc.alerts.list.useQuery(
    severity !== 'all' ? { severity, limit: 100 } : { limit: 100 },
    { staleTime: 30_000 }
  );

  const { data: unread = [] } = trpc.alerts.unread.useQuery(
    { limit: 200 },
    { enabled: isAuthenticated }
  );

  const unreadIds = new Set(unread.map((a: any) => a.id));

  const markRead = trpc.alerts.markRead.useMutation({
    onSuccess: () => {
      utils.alerts.unreadSummary.invalidate();
      utils.alerts.unread.invalidate();
    },
  });

  const markAll = trpc.alerts.markAllRead.useMutation({
    onSuccess: () => {
      utils.alerts.unreadSummary.invalidate();
      utils.alerts.unread.invalidate();
      toast.success(t('Todos marcados como lidos', 'All marked as read'));
    },
  });

  const unreadCount = unreadIds.size;
  const severityFilters: { key: Severity; labelPT: string; labelEN: string }[] = [
    { key: 'all', labelPT: 'Todos', labelEN: 'All' },
    { key: 'critical', labelPT: 'Crítico', labelEN: 'Critical' },
    { key: 'warning', labelPT: 'Aviso', labelEN: 'Warning' },
    { key: 'info', labelPT: 'Info', labelEN: 'Info' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      <Navigation />
      <div style={{ paddingTop: '5rem', maxWidth: 800, margin: '0 auto', padding: '5rem 1rem 4rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 4 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bell size={18} style={{ color: 'var(--danger)' }} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  {t('Alertas de Segurança', 'Safety Alerts')}
                </h1>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                {t('Avisos sobre materiais perigosos, recalls e mudanças de norma', 'Warnings about hazardous materials, recalls and standard updates')}
              </p>
            </div>

            {isAuthenticated && unreadCount > 0 && (
              <button
                type="button"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
                className="btn btn-sm"
                style={{
                  background: 'var(--accent-muted)', color: 'var(--accent)',
                  border: '1px solid var(--accent)', gap: 6,
                }}
              >
                <Check size={14} />
                {t('Marcar tudo como lido', 'Mark all as read')}
                <span style={{
                  background: 'var(--accent)', color: 'white',
                  borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                  padding: '1px 6px',
                }}>
                  {unreadCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '1.5rem', flexWrap: 'wrap',
        }}>
          <Filter size={14} style={{ color: 'var(--text-subtle)' }} />
          {severityFilters.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setSeverity(f.key)}
              style={{
                padding: '4px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: severity === f.key
                  ? (f.key === 'critical' ? 'var(--danger)' : f.key === 'warning' ? 'var(--warning)' : 'var(--accent)')
                  : 'var(--bg-3)',
                color: severity === f.key ? 'white' : 'var(--text-muted)',
              }}
            >
              {language === 'PT' ? f.labelPT : f.labelEN}
            </button>
          ))}
        </div>

        {/* Alert list */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>{t('Carregando alertas...', 'Loading alerts...')}</p>
          </div>
        ) : alerts.length === 0 ? (
          <div style={{
            padding: '4rem 2rem', textAlign: 'center',
            background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)',
          }}>
            <Bell size={40} style={{ color: 'var(--text-subtle)', margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>
              {t('Nenhum alerta encontrado', 'No alerts found')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {t('Volte mais tarde para novidades de segurança.', 'Check back later for safety updates.')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(alerts as any[]).map(alert => {
              const isUnread = isAuthenticated && unreadIds.has(alert.id);
              const title = language === 'PT' ? alert.titlePortuguese : alert.titleEnglish;
              const content = language === 'PT' ? alert.contentPortuguese : alert.contentEnglish;

              return (
                <div
                  key={alert.id}
                  style={{
                    background: 'var(--bg-2)',
                    border: `1px solid ${isUnread ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {isUnread && (
                    <span style={{
                      position: 'absolute', top: 14, right: 14,
                      width: 8, height: 8, borderRadius: 999,
                      background: alert.severity === 'critical' ? 'var(--danger)' : 'var(--accent)',
                    }} />
                  )}

                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: alert.severity === 'critical'
                      ? 'rgba(239,68,68,0.12)'
                      : alert.severity === 'warning'
                      ? 'rgba(245,158,11,0.12)'
                      : 'var(--bg-3)',
                    border: alert.severity === 'critical'
                      ? '1px solid rgba(239,68,68,0.25)'
                      : alert.severity === 'warning'
                      ? '1px solid rgba(245,158,11,0.25)'
                      : '1px solid var(--border)',
                  }}>
                    <SeverityIcon severity={alert.severity} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 6 }}>
                      <SeverityBadge severity={alert.severity} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {timeAgo(alert.publishedAt, language)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.4 }}>
                      {title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                      {content}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {alert.source && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {t('Fonte', 'Source')}: {alert.source}
                        </span>
                      )}
                      {alert.materialId && (
                        <Link
                          href={`/material/${alert.materialId}`}
                          style={{
                            fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)',
                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          {t('Ver material', 'View material')} <ExternalLink size={11} />
                        </Link>
                      )}
                      {isAuthenticated && isUnread && (
                        <button
                          type="button"
                          disabled={markRead.isPending}
                          onClick={() => markRead.mutate({ alertId: alert.id })}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0,
                          }}
                        >
                          <Check size={12} /> {t('Marcar lido', 'Mark read')}
                        </button>
                      )}
                    </div>
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
