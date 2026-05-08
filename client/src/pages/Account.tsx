import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Save, ArrowLeft, User as UserIcon, Mail, Briefcase, FileText, Image as ImageIcon } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

const PROFESSION_OPTIONS_PT = [
  '', 'Engenheiro Civil', 'Arquiteto', 'Mestre de Obras', 'Pedreiro', 'Eletricista',
  'Encanador', 'Pintor', 'Marceneiro', 'Dono de obra', 'Estudante', 'Outro',
];
const PROFESSION_OPTIONS_EN = [
  '', 'Civil Engineer', 'Architect', 'Site Foreman', 'Mason', 'Electrician',
  'Plumber', 'Painter', 'Carpenter', 'Property owner', 'Student', 'Other',
];

export default function Account() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading, refresh } = useAuth();
  const [, setLocation] = useLocation();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [loading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setBio(user.bio ?? '');
      setProfession(user.profession ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
      setDirty(false);
    }
  }, [user]);

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      await refresh();
      setDirty(false);
      toast.success(language === 'PT' ? 'Perfil atualizado' : 'Profile updated');
    },
    onError: (err) => {
      toast.error(language === 'PT' ? 'Erro ao salvar' : 'Failed to save', {
        description: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: name.trim() || undefined,
      bio: bio.trim() || undefined,
      profession: profession || undefined,
      avatarUrl: avatarUrl.trim() || '',
    });
  };

  const setField = <T extends string>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const professions = language === 'PT' ? PROFESSION_OPTIONS_PT : PROFESSION_OPTIONS_EN;
  const t = (pt: string, en: string) => (language === 'PT' ? pt : en);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navigation />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div className="skeleton" style={{ height: 32, width: 200, marginBottom: '2rem', borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0.875rem 1.5rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLocation('/')}
            style={{ padding: '0.25rem 0', gap: '0.375rem' }}
          >
            <ArrowLeft size={15} />
            {t('Início', 'Home')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div className="section-label" style={{ marginBottom: '0.75rem' }}>
          {t('CONTA', 'ACCOUNT')}
        </div>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900,
          color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem',
        }}>
          {t('Meu perfil', 'My profile')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {t(
            'Personalize seu perfil. Estas informações ficam visíveis no menu do usuário.',
            'Customize your profile. This information is visible in the user menu.',
          )}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Avatar preview */}
          <section className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                  onError={() => toast.error(t('URL de avatar inválida', 'Invalid avatar URL'))}
                />
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--accent-muted)', border: '1px solid rgba(249,115,22,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)', fontWeight: 700, fontSize: '1.25rem',
                }}>
                  {(user.name || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <Label icon={Mail}>{t('E-mail', 'E-mail')}</Label>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
                  {user.email || <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>—</span>}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 4 }}>
                  {t('Gerenciado pela conta Manus', 'Managed by your Manus account')}
                </div>
              </div>
            </div>
          </section>

          <Field icon={UserIcon} label={t('Nome', 'Name')}>
            <input
              type="text"
              className="input-dark"
              value={name}
              onChange={e => setField(setName)(e.target.value)}
              placeholder={t('Como devemos te chamar?', 'How should we call you?')}
              maxLength={120}
            />
          </Field>

          <Field icon={Briefcase} label={t('Profissão', 'Profession')}>
            <select
              className="input-dark"
              value={profession}
              onChange={e => setField(setProfession)(e.target.value)}
            >
              {professions.map(p => (
                <option key={p} value={p}>
                  {p || t('— Não informar —', '— Not specified —')}
                </option>
              ))}
            </select>
          </Field>

          <Field icon={FileText} label={t('Bio', 'Bio')} hint={t('Conte um pouco sobre seu trabalho ou experiência.', 'Tell us a bit about your work or experience.')}>
            <textarea
              className="input-dark"
              value={bio}
              onChange={e => setField(setBio)(e.target.value)}
              rows={4}
              maxLength={500}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              placeholder={t('Eletricista há 12 anos, especializado em obras residenciais...', 'Electrician for 12 years, specialized in residential projects...')}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 4, textAlign: 'right' }}>
              {bio.length}/500
            </div>
          </Field>

          <Field icon={ImageIcon} label={t('URL do avatar', 'Avatar URL')} hint={t('Cole o link de uma imagem hospedada (PNG/JPG).', 'Paste the link to a hosted image (PNG/JPG).')}>
            <input
              type="url"
              className="input-dark"
              value={avatarUrl}
              onChange={e => setField(setAvatarUrl)(e.target.value)}
              placeholder="https://..."
              maxLength={500}
            />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', paddingTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!dirty || updateMutation.isPending}
              onClick={() => {
                setName(user.name ?? '');
                setBio(user.bio ?? '');
                setProfession(user.profession ?? '');
                setAvatarUrl(user.avatarUrl ?? '');
                setDirty(false);
              }}
            >
              {t('Descartar', 'Discard')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!dirty || updateMutation.isPending}
            >
              <Save size={15} />
              {updateMutation.isPending
                ? t('Salvando...', 'Saving...')
                : t('Salvar alterações', 'Save changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ icon: Icon, children }: { icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.375rem',
      fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
    }}>
      <Icon size={11} />
      {children}
    </div>
  );
}

function Field({
  icon, label, hint, children,
}: { icon: typeof UserIcon; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ padding: '1.25rem' }}>
      <Label icon={icon}>{label}</Label>
      {children}
      {hint && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 6 }}>{hint}</div>
      )}
    </section>
  );
}
