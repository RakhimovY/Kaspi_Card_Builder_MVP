'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/useTranslations';
import { trackBarcodeScan } from '@/lib/analytics';
import { validateGTIN, isPotentialGTIN } from '@/lib/gtinValidation';
import { 
  QrCode, 
  Sparkles, 
  Wand2, 
  ArrowRight, 
  Camera,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import BarcodeScanner from './BarcodeScanner';
import MagicFillButton from './MagicFillButton';

export default function MagicFillStep() {
  const { t } = useTranslations();
  const { formData, updateFormData, setCurrentStep } = useAppStore();
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [manualGtin, setManualGtin] = useState(formData.gtin || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [gtinValidation, setGtinValidation] = useState<{ isValid: boolean; message: string } | null>(null);

  const handleBarcodeScan = (barcode: string) => {
    setManualGtin(barcode);
    updateFormData({ gtin: barcode });
    
    // Валидация отсканированного GTIN
    const validation = validateGTIN(barcode);
    setGtinValidation(validation);
    
    trackBarcodeScan(true);
    toast.success('Штрихкод отсканирован!');
  };

  const handleManualGtinChange = (value: string) => {
    setManualGtin(value);
    updateFormData({ gtin: value });
    
    // Валидация GTIN
    if (value.trim()) {
      const validation = validateGTIN(value);
      setGtinValidation(validation);
    } else {
      setGtinValidation(null);
    }
  };

  const handleMagicFillComplete = () => {
    // Переходим к следующему этапу
    setCurrentStep('product-info');
    toast.success('Magic Fill завершен! Переходим к редактированию информации о товаре.');
  };

  const canProceed = formData.gtin || formData.brand || formData.type;
  const canUseMagicFill = manualGtin.trim() && gtinValidation?.isValid;

  return (
    <>
    <div className="max-w-2xl mx-auto">
      {/* Magic Fill AI Block - Main */}
      <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full -translate-y-16 translate-x-16 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full translate-y-12 -translate-x-12 animate-float-delayed"></div>
        
        <CardContent className="p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full mb-6 shadow-lg relative transition-all duration-300 hover:scale-110 hover:shadow-xl">
              <Wand2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3 animate-fade-in">Magic Fill AI</h3>
            <p className="text-lg text-gray-600 mb-2 animate-fade-in-delay">Автоматическое заполнение данных о товаре</p>
            <p className="text-sm text-gray-500 animate-fade-in-delay-2">Отсканируйте штрихкод и получите готовую карточку за 2 минуты</p>
          </div>

          <div className="space-y-6">
            {/* GTIN Input */}
            <div className="flex gap-4 items-center justify-center">
              <Input
                value={manualGtin}
                onChange={(e) => handleManualGtinChange(e.target.value)}
                placeholder="Введите GTIN или отсканируйте штрихкод"
                className="flex-1 max-w-md text-center text-lg font-mono border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300 hover:border-purple-300"
              />
              <Button
                onClick={() => setIsBarcodeScannerOpen(true)}
                variant="outline"
                size="lg"
                className="px-6 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Camera className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Сканировать</span>
              </Button>
            </div>

            {/* Status */}
            {gtinValidation && (
              <div className={`flex items-center justify-center gap-2 text-sm p-3 rounded-lg border animate-fade-in-scale ${
                gtinValidation.isValid 
                  ? 'text-green-600 bg-green-50 border-green-200' 
                  : 'text-red-600 bg-red-50 border-red-200'
              }`}>
                {gtinValidation.isValid ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{gtinValidation.message}</span>
                {gtinValidation.isValid && (
                  <span className="text-xs text-gray-500 ml-2">({manualGtin})</span>
                )}
              </div>
            )}

            {/* Magic Fill Button */}
            <div className="flex justify-center">
              <MagicFillButton 
                onComplete={handleMagicFillComplete}
                disabled={!canUseMagicFill}
                className={`w-full max-w-md text-white shadow-lg transition-all duration-300 py-4 text-lg font-semibold ${
                  canUseMagicFill
                    ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 cursor-pointer' 
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
              />
            </div>
          </div>

          {/* Manual Entry Toggle */}
          <div className="mt-8 pt-6 border-t border-purple-200">
            <div className="text-center">
              <Button
                onClick={() => setShowManualEntry(!showManualEntry)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 text-sm transition-all duration-300 hover:scale-105 hover:bg-gray-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                {showManualEntry ? 'Скрыть' : 'Заполнить вручную'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Block - Collapsible */}
      {showManualEntry && (
        <Card className="mt-6 bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200 shadow-lg animate-slide-down">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Ручное заполнение</h4>
              <p className="text-sm text-gray-600">Заполните основные поля вручную</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  value={formData.brand}
                  onChange={(e) => updateFormData({ brand: e.target.value })}
                  placeholder="Бренд"
                  className="w-full transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:ring-blue-400"
                />
                <Input
                  value={formData.type}
                  onChange={(e) => updateFormData({ type: e.target.value })}
                  placeholder="Тип товара"
                  className="w-full transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:ring-blue-400"
                />
                <Input
                  value={formData.model}
                  onChange={(e) => updateFormData({ model: e.target.value })}
                  placeholder="Модель"
                  className="w-full transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              {canProceed && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentStep('product-info')}
                    className="w-full max-w-md bg-gradient-to-r from-gray-600 to-blue-600 hover:from-gray-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Продолжить
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    {/* Barcode Scanner Modal */}
    <BarcodeScanner
      isOpen={isBarcodeScannerOpen}
      onClose={() => setIsBarcodeScannerOpen(false)}
      onScan={handleBarcodeScan}
    />
    </>
  );
}
