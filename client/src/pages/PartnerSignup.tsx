import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Building2, CheckCircle, Zap, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function PartnerSignup() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const t = (pt: string, en: string) => language === 'PT' ? pt : en;

  const [form, setForm] = useState({ name: '', email: '', companyName: '', cnpj: '', website: '', description: '' });
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const register = trpc.partners.register.useMutation({
    onSuccess: (data) => {
      setApiKey(data.apiKey);
      toast.success(t('Cadastro realizado! Salve sua API Key.', 'Registration successful! Save your API Key.'));
    },
    onError: (err) => {
      toast.error(err.message.includes('already') ? t('Email já cadastrado.', 'Email already registered.') : err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.companyName) {
      toast.error(t('Preencha os campos obrigatórios.', 'Fill in the required fields.'));
      return;
    }
    register.mutate(form);
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      toast.success(t('API Key copiada!', 'API Key copied!'));
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const benefits = [
    { pt: 'Seus preços aparecem na plataforma para milhares de usuários', en: 'Your prices reach thousands of platform users' },
    { pt: 'API REST simples — integre seu ERP em minutos', en: 'Simple REST API — integrate your ERP in minutes' },
    { pt: 'Painel de controle com métricas de sincronização', en: 'Control panel with sync metrics' },
    { pt: 'Plano gratuito: 100 sincronizações/dia', en: 'Free plan: 100 syncs/day' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      <Navigation />
      <div style={{ paddingTop: '4rem' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, transparent 60%)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} style={{ color: 'white' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  WikiBuild B2B
                </span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginBottom: '1rem' }}>
                {t('Leve seus preços para milhares de compradores', 'Bring your prices to thousands of buyers')}
              </h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {t(
                  'Integre o estoque da sua loja com a API WikiBuild e apareça automaticamente nos comparadores de preço da plataforma.',
                  'Integrate your store inventory with the WikiBuild API and appear automatically in the platform\'s price comparators.',
                )}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{language === 'PT' ? b.pt : b.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form / success */}
            <div style={{
              flex: 1, minWidth: 320, maxWidth: 480,
              background: 'var(--bg-2)', border: '1px solid var(--border-strong)',
              borderRadius: 16, padding: '2rem',
            }}>
              {apiKey ? (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem', display: 'block' }} />
                  <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>{t('Cadastro realizado!', 'Registration done!')}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    {t('Sua conta está em análise. Salve a API Key abaixo — ela não será exibida novamente.',
                      'Your account is under review. Save the API Key below — it won\'t be shown again.')}
                  </p>

                  <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Key</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <code style={{ flex: 1, fontSize: '0.8rem', color: 'var(--accent)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{apiKey}</code>
                      <button type="button" onClick={copyKey} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0 }}>
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link
                      href="/partner/dashboard"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: 'var(--accent)', color: 'white', textDecoration: 'none',
                        padding: '0.75rem 1rem', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                      }}
                    >
                      {t('Ir para o painel', 'Go to dashboard')} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                    {t('Criar conta de parceiro', 'Create partner account')}
                  </h2>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { key: 'name', labelPT: 'Seu nome *', labelEN: 'Your name *', type: 'text', req: true },
                      { key: 'email', labelPT: 'Email corporativo *', labelEN: 'Corporate email *', type: 'email', req: true },
                      { key: 'companyName', labelPT: 'Nome da empresa *', labelEN: 'Company name *', type: 'text', req: true },
                      { key: 'cnpj', labelPT: 'CNPJ', labelEN: 'CNPJ (Brazilian tax ID)', type: 'text', req: false },
                      { key: 'website', labelPT: 'Site da loja', labelEN: 'Store website', type: 'url', req: false },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                          {language === 'PT' ? f.labelPT : f.labelEN}
                        </label>
                        <input
                          type={f.type}
                          className="input-dark"
                          value={(form as any)[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          required={f.req}
                          style={{ width: '100%' }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                        {t('Descreva sua loja', 'Describe your store')}
                      </label>
                      <textarea
                        className="input-dark"
                        rows={3}
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                        placeholder={t('Ex: Loja de materiais de construção com foco em produtos elétricos', 'e.g. Building materials store focused on electrical products')}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={register.isPending}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', gap: 6 }}
                    >
                      {register.isPending ? t('Cadastrando...', 'Registering...') : t('Criar conta', 'Create account')}
                      {!register.isPending && <ArrowRight size={16} />}
                    </button>
                  </form>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.75rem', textAlign: 'center' }}>
                    {t('Conta gratuita. Sem cartão de crédito.', 'Free account. No credit card required.')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tiers table */}
        <div style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1.5rem' }}>
          <h2 style={{ color: 'var(--text)', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>
            {t('Planos', 'Plans')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Free', quota: '100/dia', price: t('Grátis', 'Free'), features: [t('1 loja', '1 store'), t('100 sync/dia', '100 syncs/day'), t('Suporte por email', 'Email support')] },
              { name: 'Pro', quota: '10k/dia', price: 'R$ 49/mês', features: [t('3 lojas', '3 stores'), t('10.000 sync/dia', '10,000 syncs/day'), t('Relatórios avançados', 'Advanced reports'), t('Suporte prioritário', 'Priority support')], accent: true },
              { name: 'Enterprise', quota: t('Ilimitado', 'Unlimited'), price: t('Consultar', 'Contact us'), features: [t('Lojas ilimitadas', 'Unlimited stores'), t('SLA garantido', 'Guaranteed SLA'), t('White-label', 'White-label'), t('Integração dedicada', 'Dedicated integration')] },
            ].map(plan => (
              <div key={plan.name} style={{
                background: plan.accent ? 'var(--accent-muted)' : 'var(--bg-2)',
                border: `1px solid ${plan.accent ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 14, padding: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>{plan.name}</span>
                  {plan.accent && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 999 }}>POPULAR</span>}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: plan.accent ? 'var(--accent)' : 'var(--text)', marginBottom: '1rem' }}>{plan.price}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Zap size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />{f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
