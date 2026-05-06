import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'PT' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  'nav.home': { PT: 'Início', EN: 'Home' },
  'nav.search': { PT: 'Buscar materiais, técnicas, segurança…', EN: 'Search materials, techniques, safety…' },
  'nav.language': { PT: 'PT', EN: 'EN' },
  'hero.title': { PT: 'O CONHECIMENTO', EN: 'THE KNOWLEDGE' },
  'hero.titleHighlight': { PT: 'QUE PROTEGE.', EN: 'THAT PROTECTS.' },
  'hero.subtitle': { PT: 'Do conduíte ao cimento. Do fio à fundação. Tudo que você precisa saber antes de comprar, contratar ou construir.', EN: 'From conduit to cement. From wire to foundation. Everything you need to know before buying, hiring, or building.' },
  'hero.searchPlaceholder': { PT: 'Pesquise qualquer material, técnica ou dúvida de obra…', EN: 'Search any material, technique, or construction question…' },
  'categories.title': { PT: 'EXPLORAR POR CATEGORIA', EN: 'EXPLORE BY CATEGORY' },
  'categories.elétrica': { PT: 'Elétrica', EN: 'Electrical' },
  'categories.estrutural': { PT: 'Estrutural', EN: 'Structural' },
  'categories.hidráulica': { PT: 'Hidráulica', EN: 'Hydraulic' },
  'categories.fundações': { PT: 'Fundações', EN: 'Foundations' },
  'categories.ferramentas': { PT: 'Ferramentas', EN: 'Tools' },
  'categories.acabamentos': { PT: 'Acabamentos', EN: 'Finishes' },
  'categories.items': { PT: 'itens', EN: 'items' },
  'materials.title': { PT: 'MATERIAIS EM FOCO', EN: 'FEATURED MATERIALS' },
  'materials.viewAll': { PT: 'Ver todos', EN: 'See all' },
  'materials.stores': { PT: 'lojas', EN: 'stores' },
  'materials.riskHigh': { PT: 'RISCO ALTO', EN: 'HIGH RISK' },
  'materials.attention': { PT: 'ATENÇÃO', EN: 'ATTENTION' },
  'materials.normal': { PT: 'NORMAL', EN: 'NORMAL' },
  'materials.safetyWarnings': { PT: 'Avisos de Segurança', EN: 'Safety Warnings' },
  'materials.usageTips': { PT: 'Dicas de Uso', EN: 'Usage Tips' },
  'materials.storeAvailability': { PT: 'Disponível em', EN: 'Available at' },
  'knowledgeBase.title': { PT: 'WIKIBUILD - BASE DE CONHECIMENTO', EN: 'WIKIBUILD - KNOWLEDGE BASE' },
  'knowledgeBase.subtitle': { PT: 'Guias, técnicas e boas práticas para profissionais', EN: 'Guides, techniques, and best practices for professionals' },
  'knowledgeBase.readMore': { PT: 'Ler mais', EN: 'Read more' },
  'search.noResults': { PT: 'Nenhum resultado encontrado', EN: 'No results found' },
  'search.results': { PT: 'Resultados da busca', EN: 'Search results' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('PT');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
