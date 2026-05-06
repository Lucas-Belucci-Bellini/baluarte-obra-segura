import { useLanguage } from '@/contexts/LanguageContext';

interface RiskBadgeProps {
  level: 'RISCO_ALTO' | 'ATENCAO' | 'NORMAL';
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const { t } = useLanguage();

  const getStyles = () => {
    switch (level) {
      case 'RISCO_ALTO':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          label: 'RISCO ALTO',
        };
      case 'ATENCAO':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          label: 'ATENÇÃO',
        };
      case 'NORMAL':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          label: 'NORMAL',
        };
    }
  };

  const styles = getStyles();

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.label}
    </span>
  );
}
