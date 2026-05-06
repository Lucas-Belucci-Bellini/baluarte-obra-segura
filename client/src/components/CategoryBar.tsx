import { useLanguage } from '@/contexts/LanguageContext';
import { Category } from '@shared/types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId?: number;
  onSelectCategory: (categoryId?: number) => void;
}

const categoryIcons: Record<string, string> = {
  'Elétrica': '⚡',
  'Estrutural': '🏗️',
  'Hidráulica': '💧',
  'Fundações': '🔨',
  'Ferramentas': '🔧',
  'Acabamentos': '🎨',
};

export function CategoryBar({ categories, selectedCategoryId, onSelectCategory }: CategoryBarProps) {
  const { language, t } = useLanguage();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
          {t('categories.title')}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => onSelectCategory(undefined)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
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
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 border-2 ${
                selectedCategoryId === cat.id
                  ? 'border-yellow-400 bg-yellow-50 text-black'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{categoryIcons[cat.namePortuguese] || '📦'}</span>
              <span>{language === 'PT' ? cat.namePortuguese : cat.nameEnglish}</span>
              <span className="text-xs opacity-70">({cat.itemCount})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
