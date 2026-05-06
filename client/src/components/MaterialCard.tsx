import { useLanguage } from '@/contexts/LanguageContext';
import { RiskBadge } from './RiskBadge';
import { Link } from 'wouter';

interface MaterialCardProps {
  id: number;
  namePortuguese: string;
  nameEnglish: string;
  descriptionPortuguese: string;
  descriptionEnglish: string;
  riskLevel: 'RISCO_ALTO' | 'ATENCAO' | 'NORMAL';
  storeCount: number;
  categoryName: string;
}

export function MaterialCard({
  id,
  namePortuguese,
  nameEnglish,
  descriptionPortuguese,
  descriptionEnglish,
  riskLevel,
  storeCount,
  categoryName,
}: MaterialCardProps) {
  const { language } = useLanguage();
  const name = language === 'PT' ? namePortuguese : nameEnglish;
  const description = language === 'PT' ? descriptionPortuguese : descriptionEnglish;

  return (
    <Link href={`/material/${id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow h-full cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-sm text-gray-900 flex-1">{name}</h3>
        </div>

        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between mb-3">
          <RiskBadge level={riskLevel} />
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {categoryName}
          </span>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          {storeCount} {language === 'PT' ? 'lojas' : 'stores'}
        </div>
      </div>
    </Link>
  );
}
