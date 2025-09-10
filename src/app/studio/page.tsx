'use client';

import Header from '@/components/Header';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import MagicFillStep from '@/components/MagicFillStep';
import ProductInfoStep from '@/components/ProductInfoStep';
import PhotoEditorStep from '@/components/PhotoEditorStep';
import ExportPanel from '@/components/ExportPanel';
import StepRoadmap from '@/components/StepRoadmap';
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
        showAuthButtons={true}
      />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-6 z-10">
        <div className="max-w-4xl mx-auto space-y-8">
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
