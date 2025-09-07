'use client';


import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowLeft, Sparkles } from 'lucide-react';
import FileDrop from '@/components/FileDrop';
import Preview from '@/components/Preview';
import ProductForm from '@/components/ProductForm';
import ExportPanel from '@/components/ExportPanel';
import ImageSettings from '@/components/ImageSettings';
import { useTranslations } from '@/lib/useTranslations';
import { useAppStore } from '@/lib/store';

export default function StudioPage() {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslations();
  const { files } = useAppStore();

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
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative container mx-auto px-4 py-6 z-10"
      >
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link href="/landing" className="flex items-center space-x-2 group">
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-gray-600 group-hover:text-blue-600 transition-colors">{t('studio.back_to_landing')}</span>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {t('studio.page_title')}
              </h1>
              <p className="text-sm text-gray-500">{t('studio.subtitle')}</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-3 py-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{t('common.beta')}</span>
            </div>
            <LanguageSwitcher />
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          {/* Step 1: Upload Images */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Загрузите фотографии</h2>
              <p className="text-gray-600">Перетащите изображения или выберите файлы для обработки</p>
            </div>
            <FileDrop />
          </motion.section>

          {/* Step 2: Preview & Settings */}
          {files.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">2. Настройте обработку</h2>
                <p className="text-gray-600">Просмотрите изображения и настройте параметры обработки</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Preview />
                <ImageSettings />
              </div>
            </motion.section>
          )}

          {/* Step 3: Product Information */}
          {files.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">3. Заполните информацию о товаре</h2>
                <p className="text-gray-600">Добавьте детали товара для создания полного пакета</p>
              </div>
              <ProductForm />
            </motion.section>
          )}

          {/* Step 4: Export */}
          {files.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="sticky bottom-4 z-10"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Экспорт готового пакета</h2>
                <p className="text-gray-600">Скачайте обработанные изображения и информацию о товаре</p>
              </div>
              <ExportPanel />
            </motion.section>
          )}
        </motion.div>
      </main>
    </div>
  );
}
