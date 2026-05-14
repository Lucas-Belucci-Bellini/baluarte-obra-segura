import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'wouter';
import { Bell, ShieldAlert, AlertTriangle, Info, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

const TOAST_KEY = 'wikibuild_lastCriticalAlertToast';

function timeAgo(date: Date | string, language: string) {
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

function severityStyle(sev: string): CSSProperties {
  if (sev === 'critical') return { color: 'var(--danger)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' };
  if (sev === 'warning') return { color: 'var(--warning)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' };
  return { color: 'var(--text-muted)', background: 'var(--bg-3)', border: '1px solid var(--border)' };
}

function severityIcon(sev: string, size = 13) {
  if (sev === 'critical') return <ShieldAlert size={size} />;
  if (sev === 'warning') return <AlertTriangle size={size} />;
  return <Info size={size} />;
}

export function AlertBell() {
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: summary } = trpc.alerts.unreadSummary.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: unread = [] } = trpc.alerts.unread.useQuery({ limit: 8 }, {
    enabled: isAuthenticated && open,
    staleTime: 15_000,
  });

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
      toast.success(language === 'PT' ? 'Todos marcados como lidos' : 'All marked as read');
    },
  });

  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Toast on login if there are critical unread alerts (once per session per user)
  useEffect(() => {
    if (!isAuthenticated || !user || !summary) return;
    if (summary.critical === 0) return;
    const sessionKey = `${TOAST_KEY}_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
    toast.warning(
      language === 'PT'
        ? `${summary.critical} alerta${summary.critical > 1 ? 's' : ''} crítico${summary.critical > 1 ? 's' : ''} sem leitura`
        : `${summary.critical} unread critical alert${summary.critical > 1 ? 's' : ''}`,
      {
        duration: 8000,
        action: {
          label: language === 'PT' ? 'Ver' : 'View',
          onClick: () => setLocation('/alerts'),
        },
      },
    );
  }, [isAuthenticated, user, summary, language, setLocation]);

  if (!isAuthenticated) return null;

  const total = summary?.total ?? 0;
  const critical = summary?.critical ?? 0;
  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        aria-label={t('Alertas', 'Alerts')}
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative' }}
      >
        <Bell size={16} />
        {total > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 14, height: 14, padding: '0 3px',
            borderRadius: 999,
            background: critical > 0 ? 'var(--danger)' : 'var(--accent)',
            color: 'white',
            fontSize: '0.625rem', fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--bg-1)',
          }}>
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
            minWidth: 340, maxWidth: 380,
            background: 'var(--bg-2)', border: '1px solid var(--border-strong)',
            borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            overflow: 'hidden', zIndex: 100,
          }}
        >
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>
              {t('Alertas de segurança', 'Safety alerts')}
            </div>
            {total > 0 && (
              <button
                type="button"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <Check size={12} />
                {t('Marcar tudo', 'Mark all')}
              </button>
            )}
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {total === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <Bell size={28} color="var(--text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {t('Sem novos alertas', 'No new alerts')}
                </div>
              </div>
            ) : (
              unread.map((a: any) => {
                const title = language === 'PT' ? a.titlePortuguese : a.titleEnglish;
                const content = language === 'PT' ? a.contentPortuguese : a.contentEnglish;
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
                      display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      ...severityStyle(a.severity),
                      width: 28, height: 28, borderRadius: 8,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {severityIcon(a.severity, 14)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 2, lineHeight: 1.35 }}>
                        {title}
                      </div>
                      <p style={{
                        fontSize: '0.75rem', color: 'var(--text-muted)',
                        lineHeight: 1.5, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: 6 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)' }}>
                          {timeAgo(a.publishedAt, language)}
                        </span>
                        <button
                          type="button"
                          onClick={() => markRead.mutate({ alertId: a.id })}
                          disabled={markRead.isPending}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600,
                            padding: 0,
                          }}
                        >
                          {t('Marcar lido', 'Mark read')}
                        </button>
                        {a.materialId && (
                          <Link
                            href={`/material/${a.materialId}`}
                            onClick={() => { markRead.mutate({ alertId: a.id }); setOpen(false); }}
                            style={{
                              fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)',
                              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3,
                            }}
                          >
                            {t('Ver material', 'View material')} <ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <Link
              href="/alerts"
              onClick={() => setOpen(false)}
              style={{
                display: 'block', textAlign: 'center',
                padding: '0.5rem', borderRadius: 8,
                background: 'transparent', color: 'var(--accent)',
                fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
              }}
            >
              {t('Ver todos os alertas', 'View all alerts')} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
