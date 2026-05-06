import { useParams, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { RiskBadge } from '@/components/RiskBadge';
import { trpc } from '@/lib/trpc';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function MaterialDetail() {
  const { language, t } = useLanguage();
  const params = useParams();
  const [, setLocation] = useLocation();
  const materialId = parseInt(params?.id || '0');

  const { data: material, isLoading } = trpc.materials.byId.useQuery(materialId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-yellow-500" size={40} />
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 mb-8"
          >
            <ArrowLeft size={20} />
            {language === 'PT' ? 'Voltar' : 'Back'}
          </button>
          <div className="text-center py-12 text-gray-500">
            {language === 'PT' ? 'Material não encontrado' : 'Material not found'}
          </div>
        </div>
      </div>
    );
  }

  const name = language === 'PT' ? material.namePortuguese : material.nameEnglish;
  const description = language === 'PT' ? material.descriptionPortuguese : material.descriptionEnglish;
  const safetyWarnings = language === 'PT' ? material.safetyWarningsPortuguese : material.safetyWarningsEnglish;
  const usageTips = language === 'PT' ? material.usageTipsPortuguese : material.usageTipsEnglish;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 mb-8"
        >
          <ArrowLeft size={20} />
          {language === 'PT' ? 'Voltar' : 'Back'}
        </button>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-4">{name}</h1>
              <RiskBadge level={material.riskLevel as any} />
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-8">{description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Safety Warnings */}
            {safetyWarnings && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  {t('materials.safetyWarnings')}
                </h3>
                <p className="text-red-800 text-sm">{safetyWarnings}</p>
              </div>
            )}

            {/* Usage Tips */}
            {usageTips && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  {t('materials.usageTips')}
                </h3>
                <p className="text-blue-800 text-sm">{usageTips}</p>
              </div>
            )}
          </div>
        </div>

        {/* Store Availability */}
        {material.stores && material.stores.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('materials.storeAvailability')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {material.stores.map((storeItem: any) => (
                <div
                  key={storeItem.store.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
                >
                  <p className="font-semibold text-gray-900">
                    {language === 'PT' ? storeItem.store.namePortuguese : storeItem.store.nameEnglish}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
