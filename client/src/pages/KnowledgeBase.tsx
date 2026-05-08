import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { BookOpen, Search, Clock, Star } from 'lucide-react';

function ArticleCard({ article, language }: { article: any; language: string }) {
  const title = language === 'PT' ? article.titlePortuguese : article.titleEnglish;
  const summary = language === 'PT' ? article.summaryPortuguese : article.summaryEnglish;
  const content = language === 'PT' ? article.contentPortuguese : article.contentEnglish;
  const preview = summary || content?.substring(0, 180);

  return (
    <div className="card card-interactive" style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {article.featured === 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <Star size={11} fill="currentColor" />
          {language === 'PT' ? 'Destaque' : 'Featured'}
        </div>
      )}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, marginBottom: '0.5rem' }}>{title}</h3>
        {preview && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {preview}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
        {article.readingTimeMinutes && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            {article.readingTimeMinutes} min
          </div>
        )}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', marginLeft: 'auto' }}>
          {language === 'PT' ? 'Ler artigo →' : 'Read article →'}
        </span>
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 12;
  let searchTimeout: ReturnType<typeof setTimeout>;

  const { data: featured = [] } = trpc.knowledgeBase.articles.useQuery({ featured: true, limit: 3 });
  const { data: articles = [], isLoading } = trpc.knowledgeBase.articles.useQuery({
    search: debouncedSearch || undefined,
    limit: 100,
    offset: 0,
  });

  const displayed = articles.slice(0, offset + limit);
  const hasMore = articles.length > offset + limit;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setDebouncedSearch(val);
      setOffset(0);
    }, 300);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      {/* Header */}
      <section style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>WIKIBUILD</div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            {language === 'PT' ? 'Base de Conhecimento' : 'Knowledge Base'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 600 }}>
            {language === 'PT'
              ? 'Guias técnicos, normas de segurança e boas práticas para profissionais da construção civil.'
              : 'Technical guides, safety standards and best practices for construction professionals.'}
          </p>
          <div style={{ position: 'relative', maxWidth: 480, marginTop: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
            <input
              className="input-dark"
              style={{ paddingLeft: '2.5rem' }}
              placeholder={language === 'PT' ? 'Buscar artigos…' : 'Search articles…'}
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Featured articles */}
        {!debouncedSearch && featured.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-label" style={{ marginBottom: '1rem' }}>
              {language === 'PT' ? 'ARTIGOS EM DESTAQUE' : 'FEATURED ARTICLES'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {featured.map(art => (
                <ArticleCard key={art.id} article={art} language={language} />
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div className="section-label">
              {debouncedSearch
                ? (language === 'PT' ? 'RESULTADOS' : 'RESULTS')
                : (language === 'PT' ? 'TODOS OS ARTIGOS' : 'ALL ARTICLES')}
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {isLoading ? '…' : `${articles.length} ${language === 'PT' ? 'artigos' : 'articles'}`}
            </span>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <BookOpen size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                {language === 'PT' ? 'Nenhum artigo encontrado' : 'No articles found'}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {displayed.map(art => (
                  <ArticleCard key={art.id} article={art} language={language} />
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button className="btn btn-outline" onClick={() => setOffset(o => o + limit)}>
                    {language === 'PT' ? 'Carregar mais' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
