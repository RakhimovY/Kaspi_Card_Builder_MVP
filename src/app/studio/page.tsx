'use client';

import Header from '@/components/Header';
import SubscriptionSuccessWatcher from '@/components/SubscriptionSuccessWatcher';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import MagicFillStep from '@/components/MagicFillStep';
import ProductInfoStep from '@/components/ProductInfoStep';
import PhotoEditorStep from '@/components/PhotoEditorStep';
import ExportPanel from '@/components/ExportPanel';
import StepRoadmap from '@/components/StepRoadmap';
import KaspiBrand from '@/components/KaspiBrand';
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


  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-full filter blur-3xl opacity-40"></div>
      </div>

      {/* Header */}
      <Header 
        variant="studio"
        showBackButton={false}
        showAuthButtons={true}
      />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-4 md:py-8 z-10">
        <SubscriptionSuccessWatcher />
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
          {/* Kaspi Branding */}
          <section className="text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <KaspiBrand variant="badge" />
              <span className="text-gray-600 text-sm">Профессиональные карточки товаров</span>
            </div>
          </section>

          {/* Step Roadmap */}
          <section>
            <StepRoadmap />
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
