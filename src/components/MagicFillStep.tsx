'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/useTranslations';
import { trackBarcodeScan } from '@/lib/analytics';
import { validateGTIN, isPotentialGTIN } from '@/lib/gtinValidation';
import QuotaStatus from '@/components/QuotaStatus';
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
  const { formData, updateFormData, setCurrentStep, resetFormData } = useAppStore();
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [manualGtin, setManualGtin] = useState(formData.gtin || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [gtinValidation, setGtinValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const manualEntryRef = useRef<HTMLDivElement>(null);

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

  // Логика для кнопок
  const canUseMagicFill = manualGtin.trim() && gtinValidation?.isValid;
  const canProceedManual = formData.brand?.trim() && formData.type?.trim() && formData.model?.trim();

  return (
    <>
    <div className="max-w-4xl mx-auto">
      {/* Magic Fill AI Block - Main */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-4 md:p-6">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4 md:mb-6">
              <Wand2 className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Magic Fill AI</h3>
            <p className="text-lg text-gray-600">Отсканируйте штрихкод и получите готовую карточку за 2 минуты</p>
          </div>

          <div className="space-y-4 md:space-y-6">
            {/* GTIN Input */}
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                <Input
                  value={manualGtin}
                  onChange={(e) => handleManualGtinChange(e.target.value)}
                  placeholder="Введите GTIN или отсканируйте штрихкод"
                  className={`flex-1 max-w-md text-center text-base sm:text-lg font-mono transition-all duration-300 placeholder:text-sm sm:placeholder:text-base ${
                    gtinValidation 
                      ? gtinValidation.isValid 
                        ? 'border-green-400 focus:border-green-500 focus:ring-green-400 bg-green-50/50' 
                        : 'border-red-400 focus:border-red-500 focus:ring-red-400 bg-red-50/50'
                      : 'border-gray-200 focus:border-gray-400 focus:ring-gray-400 hover:border-gray-300'
                  }`}
                />
                <Button
                  onClick={() => setIsBarcodeScannerOpen(true)}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-4 sm:px-6 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 transition-all duration-300"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Сканировать</span>
                </Button>
              </div>
              
              {/* Error/Success Message */}
              {gtinValidation && !gtinValidation.isValid && (
                <div className="flex items-center gap-2 text-sm text-red-600 animate-fade-in-scale max-w-md text-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{gtinValidation.message}</span>
                </div>
              )}
            </div>


            {/* Magic Fill Button */}
            <div className="flex justify-center">
              <MagicFillButton 
                onComplete={handleMagicFillComplete}
                disabled={!canUseMagicFill}
                className={`w-full max-w-md text-white shadow-lg transition-all duration-300 py-4 text-lg font-semibold ${
                  canUseMagicFill
                    ? 'bg-gray-900 hover:bg-gray-800 hover:shadow-xl cursor-pointer' 
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
              />
            </div>
            
            {!canUseMagicFill && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Введите валидный GTIN для автоматического заполнения
              </div>
            )}

            {/* Quota Status - Only show when GTIN is valid */}
            {canUseMagicFill && (
              <div className="mt-4">
                <QuotaStatus feature="magicFill" className="max-w-md mx-auto" />
              </div>
            )}
          </div>


          {/* Manual Entry Toggle */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <Button
                onClick={() => {
                  const newShowState = !showManualEntry;
                  setShowManualEntry(newShowState);
                  
                  // Scroll to manual entry section after showing it
                  if (newShowState) {
                    setTimeout(() => {
                      if (manualEntryRef.current) {
                        manualEntryRef.current.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                          inline: 'nearest'
                        });
                      }
                    }, 200); // Increased delay to ensure animation completes
                  }
                }}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 text-sm transition-all duration-300 hover:bg-gray-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                {showManualEntry ? 'Скрыть' : 'Нет штрихкода? Заполнить вручную'}
              </Button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Block - Collapsible */}
      {showManualEntry && (
        <div ref={manualEntryRef} className="mt-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-slide-down">
          <div className="p-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Заполнение без GTIN</h4>
              <p className="text-sm text-gray-600 mb-3">
                Если у вас нет штрихкода, заполните основные поля вручную
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                <Wand2 className="w-3 h-3" />
                <span>Magic Fill AI всё равно поможет с описаниями на следующем шаге</span>
              </div>
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

              <div className="flex justify-center">
                <Button
                  onClick={() => setCurrentStep('product-info')}
                  disabled={!canProceedManual}
                  className={`w-full max-w-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                    canProceedManual
                      ? 'bg-gradient-to-r from-gray-600 to-blue-600 hover:from-gray-700 hover:to-blue-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  Продолжить к Magic Fill AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {!canProceedManual && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  Заполните все поля: Бренд, Тип товара, Модель
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
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
