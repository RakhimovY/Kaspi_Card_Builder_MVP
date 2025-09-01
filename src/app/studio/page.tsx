'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowLeft, Settings, Sparkles } from 'lucide-react';
import FileDrop from '@/components/FileDrop';
import Preview from '@/components/Preview';
import ProductForm from '@/components/ProductForm';
import Checklist from '@/components/Checklist';
import ImageSettings from '@/components/ImageSettings';

export default function StudioPage() {
  const [mounted, setMounted] = useState(false);

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
              <span className="text-gray-600 group-hover:text-blue-600 transition-colors">Назад</span>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Kaspi Card Builder
              </h1>
              <p className="text-sm text-gray-500">Студия обработки</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-3 py-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Бета</span>
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
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
        >
          {/* Left Panel - File Drop */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 order-1"
          >
            <FileDrop />
          </motion.div>

          {/* Center Panel - Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-6 order-2"
          >
            <Preview />
          </motion.div>

          {/* Right Panel - Settings, Form and Checklist */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 order-3 space-y-4 lg:space-y-6"
          >
            <ImageSettings />
            <ProductForm />
            <Checklist />
          </motion.div>
        </motion.div>

        {/* Bottom Panel - Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 sticky bottom-4 z-10"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Экспорт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Скачать ZIP
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
