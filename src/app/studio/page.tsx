'use client';

import Header from '@/components/Header';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import MagicFillStep from '@/components/MagicFillStep';
import ProductInfoStep from '@/components/ProductInfoStep';
import PhotoEditorStep from '@/components/PhotoEditorStep';
import ExportPanel from '@/components/ExportPanel';
import { useAppStore } from '@/lib/store';

export default function StudioPage() {
  const [mounted, setMounted] = useState(false);
  const { currentStep } = useAppStore();

  useEffect(() => {
    setMounted(true);
    trackPageView('/studio');
  }, []);

  if (!mounted) {
    return null;
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'magic-fill':
        return '1. Magic Fill AI';
      case 'product-info':
        return '2. Информация о товаре';
      case 'photo-editor':
        return '3. Редактор фото (опционально)';
      case 'export':
        return '4. Экспорт готового пакета';
      default:
        return 'Студия';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'magic-fill':
        return 'Автоматическое заполнение данных о товаре';
      case 'product-info':
        return 'Проверка и редактирование информации';
      case 'photo-editor':
        return 'Обработка изображений товара (опционально)';
      case 'export':
        return 'Скачивание готового пакета';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Simplified Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <Header 
        variant="studio"
        showBackButton={false}
        showBetaBadge={true}
        showAuthButtons={true}
      />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-6 z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step Header */}
          <section className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
            <p className="text-gray-600">{getStepDescription()}</p>
          </section>

          {/* Current Step Content */}
          <section>
            {currentStep === 'magic-fill' && <MagicFillStep />}
            {currentStep === 'product-info' && <ProductInfoStep />}
            {currentStep === 'photo-editor' && <PhotoEditorStep />}
            {currentStep === 'export' && <ExportPanel />}
          </section>
        </div>
      </main>
    </div>
  );
}
