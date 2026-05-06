import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { Link } from 'wouter';

export default function KnowledgeBase() {
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();

  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: articles = [], isLoading } = trpc.knowledgeBase.articles.useQuery({
    categoryId: selectedCategoryId,
    limit: 100,
    offset: 0,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            {t('knowledgeBase.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('knowledgeBase.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {language === 'PT' ? 'Filtrar por categoria' : 'Filter by category'}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategoryId(undefined)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedCategoryId === undefined
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'PT' ? 'Todos' : 'All'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    selectedCategoryId === cat.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language === 'PT' ? cat.namePortuguese : cat.nameEnglish}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('search.noResults')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    {language === 'PT' ? article.titlePortuguese : article.titleEnglish}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-4">
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
    </div>
  );
}
