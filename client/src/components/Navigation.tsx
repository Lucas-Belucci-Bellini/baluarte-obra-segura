import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu, X, Zap, Globe, Wrench, BookOpen, Calculator, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { UserMenu } from '@/components/UserMenu';

const NAV_LINKS = [
  { href: '/catalog', labelPT: 'Materiais', labelEN: 'Materials', icon: Package },
  { href: '/tools', labelPT: 'Ferramentas', labelEN: 'Tools', icon: Wrench },
  { href: '/calculators', labelPT: 'Calculadoras', labelEN: 'Calculators', icon: Calculator },
  { href: '/knowledge-base', labelPT: 'Guia de Segurança', labelEN: 'Safety Guide', icon: BookOpen },
];

export function Navigation() {
  const { language, setLanguage } = useLanguage();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading: searching } = trpc.search.global.useQuery(
    searchQuery,
    { enabled: searchQuery.length >= 2 }
  );

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalResults = (searchResults?.materials?.length ?? 0) +
    (searchResults?.tools?.length ?? 0) +
    (searchResults?.articles?.length ?? 0);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2" style={{ textDecoration: 'none' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-black text-sm tracking-tight hidden sm:block" style={{ color: 'var(--text)' }}>
            BALUARTE<span style={{ color: 'var(--accent)' }}> WIKIBUILD</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(link => {
            const active = location.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  background: active ? 'var(--accent-muted)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <link.icon size={14} />
                {language === 'PT' ? link.labelPT : link.labelEN}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <div ref={searchRef} className="relative">
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={16} />
              <span className="hidden sm:inline text-sm" style={{ color: 'var(--text-muted)' }}>
                {language === 'PT' ? 'Buscar...' : 'Search...'}
              </span>
            </button>

            {searchOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-96 max-w-screen rounded-xl overflow-hidden"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  maxWidth: '90vw',
                }}
              >
                <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                    <input
                      autoFocus
                      type="text"
                      className="input-dark"
                      style={{ paddingLeft: '2.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                      placeholder={language === 'PT' ? 'Buscar materiais, ferramentas...' : 'Search materials, tools...'}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                {searchQuery.length >= 2 && (
                  <div className="max-h-72 overflow-y-auto p-2">
                    {searching ? (
                      <p className="p-4 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>
                        {language === 'PT' ? 'Buscando...' : 'Searching...'}
                      </p>
                    ) : totalResults === 0 ? (
                      <p className="p-4 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>
                        {language === 'PT' ? 'Nenhum resultado encontrado' : 'No results found'}
                      </p>
                    ) : (
                      <>
                        {(searchResults?.materials?.length ?? 0) > 0 && (
                          <div className="mb-2">
                            <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-subtle)' }}>
                              {language === 'PT' ? 'Materiais' : 'Materials'}
                            </p>
                            {searchResults!.materials.slice(0, 5).map(m => (
                              <Link
                                key={m.id}
                                href={`/material/${m.id}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                                style={{ textDecoration: 'none', color: 'var(--text)' }}
                                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                              >
                                <Package size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span className="text-sm">{language === 'PT' ? m.namePortuguese : m.nameEnglish}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {(searchResults?.tools?.length ?? 0) > 0 && (
                          <div>
                            <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-subtle)' }}>
                              {language === 'PT' ? 'Ferramentas' : 'Tools'}
                            </p>
                            {searchResults!.tools.slice(0, 4).map(t => (
                              <Link
                                key={t.id}
                                href="/tools"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                                style={{ textDecoration: 'none', color: 'var(--text)' }}
                                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                              >
                                <Wrench size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <span className="text-sm">{language === 'PT' ? t.namePortuguese : t.nameEnglish}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLanguage(language === 'PT' ? 'EN' : 'PT')}
          >
            <Globe size={14} />
            <span className="text-xs font-bold">{language}</span>
          </button>

          <UserMenu />

          <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden px-4 py-3" style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}>
          {NAV_LINKS.map(link => {
            const active = location.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-medium"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text)',
                  background: active ? 'var(--accent-muted)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <link.icon size={16} />
                {language === 'PT' ? link.labelPT : link.labelEN}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
