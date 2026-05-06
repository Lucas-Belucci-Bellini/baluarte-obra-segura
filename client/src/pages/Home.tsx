import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { CategoryBar } from '@/components/CategoryBar';
import { MaterialCard } from '@/components/MaterialCard';
import { RiskBadge } from '@/components/RiskBadge';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [displayCount, setDisplayCount] = useState(6);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = trpc.categories.list.useQuery();

  // Fetch materials
  const { data: materials = [], isLoading: materialsLoading } = trpc.materials.list.useQuery({
    categoryId: selectedCategoryId,
    limit: 100,
    offset: 0,
  });

  // Fetch knowledge base articles
  const { data: articles = [], isLoading: articlesLoading } = trpc.knowledgeBase.articles.useQuery({
    featured: true,
    limit: 3,
  });

  // Create a map of category names for quick lookup
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  const displayedMaterials = materials.slice(0, displayCount);
  const hasMore = materials.length > displayCount;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="text-black">{t('hero.title')}</span>
              <br />
              <span className="text-yellow-500">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form className="relative">
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                className="w-full px-6 py-4 border-2 border-yellow-400 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                {language === 'PT' ? 'Buscar' : 'Search'}
              </button>
            </form>

            {/* Quick access chips */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-gray-500 w-full text-center mb-2">
                {language === 'PT' ? 'Exemplos:' : 'Examples:'}
              </span>
              <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200 transition-colors">
                Conduíte Flexível PVC
              </button>
              <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200 transition-colors">
                Fio 2,5 mm²
              </button>
              <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200 transition-colors">
                Cimento Portland
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Bar */}
      {!categoriesLoading && (
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      )}

      {/* Materials Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900">
              {t('materials.title')}
            </h2>
          </div>

          {materialsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('search.noResults')}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {displayedMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    id={material.id}
                    namePortuguese={material.namePortuguese}
                    nameEnglish={material.nameEnglish}
                    descriptionPortuguese={material.descriptionPortuguese || ''}
                    descriptionEnglish={material.descriptionEnglish || ''}
                    riskLevel={material.riskLevel as any}
                    storeCount={material.storeCount}
                    categoryName={
                      language === 'PT'
                        ? categoryMap.get(material.categoryId)?.namePortuguese || ''
                        : categoryMap.get(material.categoryId)?.nameEnglish || ''
                    }
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 6)}
                    className="px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    {t('materials.viewAll')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              {t('knowledgeBase.title')}
            </h2>
            <p className="text-gray-600">
              {t('knowledgeBase.subtitle')}
            </p>
          </div>

          {articlesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    {language === 'PT' ? article.titlePortuguese : article.titleEnglish}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {language === 'PT' ? article.contentPortuguese : article.contentEnglish}
                  </p>
                  <button className="text-yellow-600 font-semibold text-sm hover:text-yellow-700">
                    {t('knowledgeBase.readMore')} →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4">
            <span>BALUARTE</span>
            <span className="text-yellow-500 ml-1">WIKIBUILD</span>
          </div>
          <p className="text-gray-400 mb-4">
            {language === 'PT'
              ? 'Conhecimento que protege. Materiais que constroem.'
              : 'Knowledge that protects. Materials that build.'}
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 Baluarte Obra Segura. {language === 'PT' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
