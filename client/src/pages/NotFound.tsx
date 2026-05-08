import { useLocation } from "wouter";
import { Home, HardHat } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid rgba(249,115,22,0.3)', marginBottom: '2rem' }}>
          <HardHat size={48} color="var(--accent)" />
        </div>
        <div style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, color: 'var(--text)', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>404</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>Página não encontrada</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
          Esta página foi movida, deletada ou nunca existiu. Verifique a URL ou volte ao início.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setLocation("/")}>
            <Home size={16} />
            Ir para o início
          </button>
          <button className="btn btn-outline" onClick={() => window.history.back()}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
