import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { LogIn, Shield, Bookmark, FolderOpen, Bell, Zap } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLoginUrl } from '@/const';

export default function Login() {
  const { language } = useLanguage();
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation('/');
    }
  }, [loading, isAuthenticated, setLocation]);

  const benefits = language === 'PT'
    ? [
        { icon: Bookmark, title: 'Salvar materiais e ferramentas', description: 'Crie sua biblioteca pessoal de itens preferidos para acessar rapidamente.' },
        { icon: FolderOpen, title: 'Organizar por projeto', description: 'Agrupe materiais, ferramentas e cálculos em projetos para cada obra.' },
        { icon: Bell, title: 'Alertas de segurança', description: 'Receba notificações sobre recalls, mudanças de norma e riscos novos.' },
        { icon: Shield, title: 'Histórico de cálculos', description: 'Tenha acesso a todos os cálculos que você fez, em qualquer dispositivo.' },
      ]
    : [
        { icon: Bookmark, title: 'Save materials and tools', description: 'Build your personal library of favorite items for quick access.' },
        { icon: FolderOpen, title: 'Organize by project', description: 'Group materials, tools and calculations into projects for each construction site.' },
        { icon: Bell, title: 'Safety alerts', description: 'Get notifications about recalls, standard updates and new risks.' },
        { icon: Shield, title: 'Calculation history', description: 'Access all your calculations from any device.' },
      ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '0.875rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            BALUARTE<span style={{ color: 'var(--accent)' }}> WIKIBUILD</span>
          </span>
        </a>
      </div>

      {/* Main */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center',
        padding: '3rem 1.5rem', maxWidth: 1100, width: '100%', margin: '0 auto', gap: '4rem',
      }} className="login-grid">
        {/* Left side: pitch */}
        <div>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>
            {language === 'PT' ? 'CONTA WIKIBUILD' : 'WIKIBUILD ACCOUNT'}
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900,
            color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.25rem',
          }}>
            {language === 'PT' ? (
              <>O conhecimento que <span className="gradient-text">protege</span>, agora pessoal.</>
            ) : (
              <>The knowledge that <span className="gradient-text">protects</span>, now personal.</>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 540 }}>
            {language === 'PT'
              ? 'Entre para salvar materiais, montar projetos, receber alertas de segurança e acessar de qualquer dispositivo.'
              : 'Sign in to save materials, build projects, get safety alerts and access from any device.'}
          </p>

          <a
            href={getLoginUrl()}
            className="btn btn-primary btn-lg"
            style={{ display: 'inline-flex', gap: '0.625rem' }}
          >
            <LogIn size={18} />
            {language === 'PT' ? 'Entrar com Manus' : 'Sign in with Manus'}
          </a>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '1rem' }}>
            {language === 'PT'
              ? 'Acesso gratuito. Sem cartão de crédito. Saia quando quiser.'
              : 'Free access. No credit card. Sign out anytime.'}
          </p>
        </div>

        {/* Right side: benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {benefits.map((b, i) => (
            <div key={i} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <b.icon size={17} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem', marginBottom: 2 }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {b.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-grid { grid-template-columns: 1.1fr 0.9fr !important; }
        }
      `}</style>
    </div>
  );
}
