import { useState } from 'react';
import { Link } from 'wouter';
import {
  Zap, Shield, Search, ArrowRight, BookOpen, Calculator,
  Package, Wrench, AlertTriangle, CheckCircle, TrendingUp,
  Layers, Globe, Users
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { trpc } from '@/lib/trpc';

const STATS = [
  { labelPT: 'Materiais cadastrados', labelEN: 'Materials catalogued', value: '2.500+' },
  { labelPT: 'Ferramentas indexadas', labelEN: 'Tools indexed', value: '800+' },
  { labelPT: 'Guias de segurança', labelEN: 'Safety guides', value: '120+' },
  { labelPT: 'Calculadoras', labelEN: 'Calculators', value: '45+' },
];

const CATEGORY_ICONS: Record<string, any> = {
  eletrica: Zap,
  hidraulica: Layers,
  estrutural: Shield,
  ferramentas: Wrench,
  acabamentos: Package,
  epi: Shield,
  default: Package,
};

const FEATURES = [
  {
    icon: Shield,
    color: '#ef4444',
    titlePT: 'Alertas de Segurança',
    titleEN: 'Safety Alerts',
    descPT: 'Cada material tem alertas claros sobre riscos elétricos, químicos e estruturais.',
    descEN: 'Each material has clear alerts about electrical, chemical and structural risks.',
  },
  {
    icon: AlertTriangle,
    color: '#eab308',
    titlePT: 'Escudo Anti-Golpe',
    titleEN: 'Anti-Scam Shield',
    descPT: 'Saiba o que prestadores desonestos usam para te enganar e como se proteger.',
    descEN: 'Know what dishonest contractors use to deceive you and how to protect yourself.',
  },
  {
    icon: TrendingUp,
    color: '#22c55e',
    titlePT: 'Comparação de Preços',
    titleEN: 'Price Comparison',
    descPT: 'Veja os preços de múltiplas lojas e encontre o melhor custo-benefício.',
    descEN: 'See prices from multiple stores and find the best value for money.',
  },
  {
    icon: Calculator,
    color: '#3b82f6',
    titlePT: 'Calculadoras Técnicas',
    titleEN: 'Technical Calculators',
    descPT: 'Calcule bitola de fios, volume de concreto, carga elétrica e muito mais.',
    descEN: 'Calculate wire gauge, concrete volume, electrical load and much more.',
  },
  {
    icon: Globe,
    color: '#8b5cf6',
    titlePT: 'Bilíngue PT/EN',
    titleEN: 'Bilingual PT/EN',
    descPT: 'Todo o conteúdo disponível em português e inglês para qualquer usuário.',
    descEN: 'All content available in Portuguese and English for any user.',
  },
  {
    icon: Users,
    color: '#f97316',
    titlePT: 'Para Todos',
    titleEN: 'For Everyone',
    descPT: 'Do aluno do ensino médio ao engenheiro profissional, todos encontram valor aqui.',
    descEN: 'From high school student to professional engineer, everyone finds value here.',
  },
];

export default function Home() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: featuredMaterials = [] } = trpc.materials.list.useQuery({ featured: true, limit: 6 });
  const { data: featuredArticles = [] } = trpc.knowledgeBase.articles.useQuery({ featured: true, limit: 3 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navigation />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-24 px-4 overflow-hidden grid-bg"
        style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}
      >
        {/* Orange glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-bold tracking-wide uppercase"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <CheckCircle size={11} />
            {language === 'PT' ? 'Conhecimento que protege · Materiais que constroem' : 'Knowledge that protects · Materials that build'}
          </div>

          <h1 className="font-black leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
            {language === 'PT' ? (
              <>
                O <span className="gradient-text">Wikipedia</span>
                <br />da Construção Civil
              </>
            ) : (
              <>
                The <span className="gradient-text">Wikipedia</span>
                <br />of Construction
              </>
            )}
          </h1>

          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            {language === 'PT'
              ? 'Tudo que você precisa saber sobre materiais, ferramentas e segurança na construção civil — em um único lugar, grátis para todos.'
              : 'Everything you need to know about materials, tools and safety in construction — in one place, free for everyone.'}
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="input-dark text-base"
                style={{ paddingLeft: '3rem', paddingRight: '7rem', paddingTop: '1rem', paddingBottom: '1rem', borderRadius: '12px' }}
                placeholder={language === 'PT' ? 'Ex: fio 2,5mm², cimento portland, furadeira...' : 'Ex: 2.5mm² wire, portland cement, drill...'}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm absolute right-2 top-1/2 -translate-y-1/2"
                style={{ borderRadius: '8px' }}
              >
                {language === 'PT' ? 'Buscar' : 'Search'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Conduíte Flexível', 'Fio 2,5 mm²', 'Cimento CP-II', 'Disjuntor 20A', 'Furadeira'].map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => { setSearchInput(term); window.location.href = `/catalog?search=${encodeURIComponent(term)}`; }}
                  className="chip"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/catalog" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              <Package size={18} />
              {language === 'PT' ? 'Ver Materiais' : 'View Materials'}
            </Link>
            <Link href="/tools" className="btn btn-outline btn-lg" style={{ textDecoration: 'none' }}>
              <Wrench size={18} />
              {language === 'PT' ? 'Ferramentas' : 'Tools'}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(stat => (
              <div key={stat.value} className="text-center">
                <div className="font-black text-3xl mb-1 gradient-text">{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {language === 'PT' ? stat.labelPT : stat.labelEN}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="section-label mb-2">{language === 'PT' ? 'Explore por área' : 'Explore by area'}</p>
            <h2 className="font-black text-3xl" style={{ color: 'var(--text)' }}>
              {language === 'PT' ? 'Categorias' : 'Categories'}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.length > 0
              ? categories.map(cat => {
                  const Icon = CATEGORY_ICONS[cat.slug] ?? CATEGORY_ICONS.default;
                  return (
                    <Link
                      key={cat.id}
                      href={`/catalog?categoryId=${cat.id}`}
                      className="card card-interactive p-4 flex flex-col items-center gap-3 text-center cursor-pointer"
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
                        <Icon size={18} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                          {language === 'PT' ? cat.namePortuguese : cat.nameEnglish}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                          {cat.itemCount}+ itens
                        </p>
                      </div>
                    </Link>
                  );
                })
              : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card p-4 flex flex-col items-center gap-3">
                    <div className="skeleton w-10 h-10 rounded-xl" />
                    <div className="skeleton w-16 h-3 rounded" />
                    <div className="skeleton w-12 h-2 rounded" />
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      {/* ─── Featured Materials ────────────────────────────────────────── */}
      {featuredMaterials.length > 0 && (
        <section className="py-20 px-4" style={{ background: 'var(--bg-1)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="section-label mb-2">{language === 'PT' ? 'Mais consultados' : 'Most viewed'}</p>
                <h2 className="font-black text-3xl" style={{ color: 'var(--text)' }}>
                  {language === 'PT' ? 'Materiais em Destaque' : 'Featured Materials'}
                </h2>
              </div>
              <Link href="/catalog" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                {language === 'PT' ? 'Ver todos' : 'View all'}
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredMaterials.map(mat => {
                const riskClass = mat.riskLevel === 'RISCO_ALTO' ? 'risk-high' : mat.riskLevel === 'ATENCAO' ? 'risk-medium' : 'risk-normal';
                const riskLabel = mat.riskLevel === 'RISCO_ALTO'
                  ? (language === 'PT' ? 'RISCO ALTO' : 'HIGH RISK')
                  : mat.riskLevel === 'ATENCAO'
                    ? (language === 'PT' ? 'ATENÇÃO' : 'CAUTION')
                    : (language === 'PT' ? 'NORMAL' : 'NORMAL');

                return (
                  <Link
                    key={mat.id}
                    href={`/material/${mat.id}`}
                    className="card card-interactive p-5 cursor-pointer block"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-3)' }}>
                        <Package size={18} style={{ color: 'var(--accent)' }} />
                      </div>
                      <span className={`${riskClass} text-xs font-bold px-2 py-1 rounded-md`}>
                        {riskLabel}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>
                      {language === 'PT' ? mat.namePortuguese : mat.nameEnglish}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {language === 'PT' ? mat.descriptionPortuguese : mat.descriptionEnglish}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      {mat.basePrice && (
                        <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                          R$ {Number(mat.basePrice).toFixed(2)}
                          <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-subtle)' }}>
                            /{mat.priceUnit || 'un'}
                          </span>
                        </span>
                      )}
                      <span className="ml-auto text-xs flex items-center gap-1" style={{ color: 'var(--text-subtle)' }}>
                        {language === 'PT' ? 'Ver detalhes' : 'View details'}
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Features ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-2">{language === 'PT' ? 'Por que usar o WikiBuild?' : 'Why use WikiBuild?'}</p>
            <h2 className="font-black text-3xl" style={{ color: 'var(--text)' }}>
              {language === 'PT' ? 'Tudo que você precisa' : 'Everything you need'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(feature => (
              <div key={feature.titlePT} className="card p-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}18` }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text)' }}>
                  {language === 'PT' ? feature.titlePT : feature.titleEN}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                  {language === 'PT' ? feature.descPT : feature.descEN}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Knowledge Base Preview ────────────────────────────────────── */}
      {featuredArticles.length > 0 && (
        <section className="py-20 px-4" style={{ background: 'var(--bg-1)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="section-label mb-2">{language === 'PT' ? 'Aprenda com segurança' : 'Learn safely'}</p>
                <h2 className="font-black text-3xl" style={{ color: 'var(--text)' }}>
                  {language === 'PT' ? 'Guias Técnicos' : 'Technical Guides'}
                </h2>
              </div>
              <Link href="/knowledge-base" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                {language === 'PT' ? 'Ver todos' : 'View all'}
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredArticles.map(article => (
                <div key={article.id} className="card card-interactive p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={14} style={{ color: 'var(--accent)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                      {article.readingTimeMinutes} min
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text)' }}>
                    {language === 'PT' ? article.titlePortuguese : article.titleEnglish}
                  </h3>
                  <p className="text-sm line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                    {language === 'PT' ? (article.summaryPortuguese || article.contentPortuguese.slice(0, 120) + '...') : (article.summaryEnglish || article.contentEnglish.slice(0, 120) + '...')}
                  </p>
                  <Link
                    href="/knowledge-base"
                    className="inline-flex items-center gap-1 text-sm font-medium mt-4"
                    style={{ color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    {language === 'PT' ? 'Ler artigo' : 'Read article'}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Manifesto ────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: '#0a0505' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Shield size={24} style={{ color: '#ef4444' }} />
          </div>
          <h2 className="font-black text-2xl md:text-3xl mb-4" style={{ color: 'var(--text)' }}>
            {language === 'PT' ? '"Fazer o certo pelo certo"' : '"Doing right by doing right"'}
          </h2>
          <p className="text-base mb-6" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            {language === 'PT'
              ? 'O WikiBuild nasceu para combater a assimetria de informação na construção civil. Quando um aluno do ensino médio sabe por que precisa usar conduíte em vez de deixar o fio solto, ele não pode ser enganado. Conhecimento protege vidas.'
              : 'WikiBuild was born to combat information asymmetry in construction. When a high school student knows why they need to use conduit instead of leaving wires loose, they cannot be deceived. Knowledge protects lives.'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/knowledge-base" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <BookOpen size={16} />
              {language === 'PT' ? 'Guia de Segurança' : 'Safety Guide'}
            </Link>
            <Link href="/catalog" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              <Package size={16} />
              {language === 'PT' ? 'Catálogo Completo' : 'Full Catalog'}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-black text-sm">
                BALUARTE<span style={{ color: 'var(--accent)' }}> WIKIBUILD</span>
              </span>
            </div>
            <div className="flex gap-6">
              {[
                { href: '/catalog', labelPT: 'Materiais', labelEN: 'Materials' },
                { href: '/tools', labelPT: 'Ferramentas', labelEN: 'Tools' },
                { href: '/calculators', labelPT: 'Calculadoras', labelEN: 'Calculators' },
                { href: '/knowledge-base', labelPT: 'Guia', labelEN: 'Guide' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                >
                  {language === 'PT' ? link.labelPT : link.labelEN}
                </Link>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              © 2026 Baluarte Obra Segura
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
