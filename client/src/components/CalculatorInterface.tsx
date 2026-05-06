import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Download, Save } from 'lucide-react';

interface CalculatorField {
  name: string;
  label: string;
  type: 'number' | 'select' | 'text';
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: number | string;
  unit?: string;
}

interface CalculatorInterfaceProps {
  title: string;
  description: string;
  fields: CalculatorField[];
  onCalculate: (inputs: Record<string, any>) => Promise<any>;
  specialty: string;
}

export function CalculatorInterface({
  title,
  description,
  fields,
  onCalculate,
  specialty,
}: CalculatorInterfaceProps) {
  const { language } = useLanguage();
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (fieldName: string, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [fieldName]: value === '' ? undefined : value,
    }));
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      const missingFields = fields
        .filter((f) => f.required && !inputs[f.name])
        .map((f) => f.label);

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      const result = await onCalculate(inputs);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = {
      calculator: title,
      specialty,
      timestamp: new Date().toISOString(),
      inputs,
      results,
    };

    const csv = [
      ['Calculator', title],
      ['Specialty', specialty],
      ['Timestamp', new Date().toISOString()],
      [],
      ['Inputs'],
      ...Object.entries(inputs).map(([key, value]) => [key, value]),
      [],
      ['Results'],
      ...Object.entries(results || {}).map(([key, value]) => [key, value]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
        <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          {specialty}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {language === 'PT' ? 'Entrada de Dados' : 'Input Data'}
            </h2>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'number' && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={inputs[field.name] ?? field.defaultValue ?? ''}
                        onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="0"
                        step="0.01"
                      />
                      {field.unit && (
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                          {field.unit}
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === 'select' && (
                    <select
                      value={inputs[field.name] ?? field.defaultValue ?? ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={inputs[field.name] ?? field.defaultValue ?? ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'PT' ? 'Calculando...' : 'Calculating...'}
                </>
              ) : (
                language === 'PT' ? 'Calcular' : 'Calculate'
              )}
            </Button>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {results ? (
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {language === 'PT' ? 'Resultados' : 'Results'}
              </h2>

              <div className="space-y-3 mb-6">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {language === 'PT' ? 'Exportar' : 'Export'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {language === 'PT' ? 'Salvar' : 'Save'}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 flex items-center justify-center h-64 bg-gray-50">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">
                  {language === 'PT'
                    ? 'Preencha os dados e clique em Calcular'
                    : 'Fill in the data and click Calculate'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
