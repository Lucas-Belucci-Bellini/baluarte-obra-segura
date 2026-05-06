import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { CategoryBar } from '@/components/CategoryBar';
import { MaterialCard } from '@/components/MaterialCard';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export default function Catalog() {
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [offset, setOffset] = useState(0);
  const limit = 12;

  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: materials = [], isLoading } = trpc.materials.list.useQuery({
    categoryId: selectedCategoryId,
    limit: 100,
    offset: 0,
  });

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const displayedMaterials = materials.slice(0, offset + limit);
  const hasMore = materials.length > offset + limit;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          setOffset(0);
        }}
      />

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-gray-900 mb-8">
            {language === 'PT' ? 'Catálogo Completo' : 'Complete Catalog'}
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('search.noResults')}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                    onClick={() => setOffset(offset + limit)}
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
    </div>
  );
}
