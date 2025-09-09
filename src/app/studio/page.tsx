'use client';


import Header from '@/components/Header';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import UploadAndSettings from '@/components/UploadAndSettings';
import Preview from '@/components/Preview';
import ProductForm from '@/components/ProductForm';
import ExportPanel from '@/components/ExportPanel';
import { useTranslations } from '@/lib/useTranslations';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';

export default function StudioPage() {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslations();
  const { files } = useAppStore();
  const { processingState } = useImageProcessing();

  useEffect(() => {
    setMounted(true);
    trackPageView('/studio');
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <Header 
        variant="studio"
        showBackButton={false}
        showBetaBadge={true}
        showAuthButtons={true}
      />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          {/* Step 1: Upload & Settings */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">1. Загрузите и настройте</h2>
              <p className="text-sm text-gray-600">Загрузите изображения и настройте параметры обработки</p>
            </div>
            <UploadAndSettings />
          </motion.section>

          {/* Step 2: Preview (only shown after processing starts) */}
          <Preview />

          {/* Step 3: Product Information (only shown after processing starts) */}
          {(processingState.inFlight > 0 || processingState.doneCount > 0 || files.some(f => f.status === 'completed')) && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">3. Заполните информацию о товаре</h2>
                <p className="text-sm text-gray-600">Добавьте детали товара для создания полного пакета</p>
              </div>
              <ProductForm />
            </motion.section>
          )}

          {/* Step 4: Export (only shown after processing starts) */}
          {(processingState.inFlight > 0 || processingState.doneCount > 0 || files.some(f => f.status === 'completed')) && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="sticky bottom-4 z-10"
            >
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">4. Экспорт готового пакета</h2>
                <p className="text-sm text-gray-600">Скачайте обработанные изображения и информацию о товаре</p>
              </div>
              <ExportPanel />
            </motion.section>
          )}
        </motion.div>
      </main>
    </div>
  );
}
