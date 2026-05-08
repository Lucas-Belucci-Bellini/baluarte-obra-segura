import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { User, LogOut, Heart, FolderOpen, Settings, ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLoginUrl } from '@/const';

function initialsFor(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (loading) {
    return <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <a href={getLoginUrl()} className="btn btn-primary btn-sm">
        <LogIn size={14} />
        <span>{language === 'PT' ? 'Entrar' : 'Sign in'}</span>
      </a>
    );
  }

  const avatarUrl = user.avatarUrl ?? undefined;
  const initials = initialsFor(user.name);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'transparent', border: 'none', padding: '0.25rem 0.5rem 0.25rem 0.25rem',
          borderRadius: 999, cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
          />
        ) : (
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-muted)', border: '1px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em',
            }}
          >
            {initials}
          </div>
        )}
        <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
            minWidth: 240, background: 'var(--bg-2)', border: '1px solid var(--border-strong)',
            borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', overflow: 'hidden',
            zIndex: 100,
          }}
        >
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || (language === 'PT' ? 'Sem nome' : 'No name')}
            </div>
            {user.email && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                {user.email}
              </div>
            )}
            {user.profession && (
              <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: 4, fontWeight: 600 }}>
                {user.profession}
              </div>
            )}
          </div>

          <div style={{ padding: '0.375rem' }}>
            <MenuLink href="/account" icon={User} label={language === 'PT' ? 'Meu perfil' : 'My profile'} onClick={() => setOpen(false)} />
            <MenuLink href="/saved" icon={Heart} label={language === 'PT' ? 'Meus favoritos' : 'My favorites'} onClick={() => setOpen(false)} />
            <MenuLink href="/projects" icon={FolderOpen} label={language === 'PT' ? 'Meus projetos' : 'My projects'} onClick={() => setOpen(false)} />
            {user.role === 'admin' && (
              <MenuLink href="/admin" icon={Settings} label={language === 'PT' ? 'Painel admin' : 'Admin panel'} onClick={() => setOpen(false)} />
            )}
          </div>

          <div style={{ padding: '0.375rem', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={async () => { await logout(); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.75rem', borderRadius: 8, background: 'transparent',
                border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem',
                fontWeight: 600, textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={15} />
              {language === 'PT' ? 'Sair' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href, icon: Icon, label, onClick,
}: { href: string; icon: typeof User; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.5rem 0.75rem', borderRadius: 8, color: 'var(--text)',
        textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <Icon size={15} style={{ color: 'var(--text-muted)' }} />
      {label}
    </Link>
  );
}
