'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { useLandingTranslations } from '@/lib/useTranslations';
import { motion } from 'framer-motion';
import { 
  Camera, 
  FileText, 
  Download, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  Play,
  Mail,
  MessageCircle,
  Clock,
  ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { hero, features, how_it_works, faq, isLoading, hasError } = useLandingTranslations();

  useEffect(() => {
    setMounted(true);
    trackPageView('/landing');
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h1>
          <p className="text-gray-600">Не удалось загрузить переводы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Kaspi Card Builder
            </h1>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <LanguageSwitcher />
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Новый инструмент для Kaspi</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
            {hero.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/studio">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                {hero.cta}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 border-2 border-gray-300 hover:border-gray-400 bg-white/80 backdrop-blur-sm"
              onClick={() => setIsVideoPlaying(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Смотреть демо
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2 мин</div>
              <div className="text-sm text-gray-600">Время обработки</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Фото за раз</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Автоматизация</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Почему выбирают нас</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Все необходимые инструменты для создания профессиональных карточек товаров
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Camera className="w-8 h-8" />,
              title: features.kaspi_check,
              description: "Автоматическая обработка фотографий под требования Kaspi с удалением фона и оптимизацией",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: <FileText className="w-8 h-8" />,
              title: features.generator,
              description: "Умная генерация заголовков и описаний для лучшего поиска и конверсии",
              color: "from-indigo-500 to-indigo-600"
            },
            {
              icon: <Download className="w-8 h-8" />,
              title: features.export,
              description: "Готовые пакеты для загрузки в Kaspi с правильной структурой файлов",
              color: "from-purple-500 to-purple-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative container mx-auto px-4 py-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {how_it_works.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Простой процесс от загрузки до готового результата
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "1", text: how_it_works.step1, icon: <Upload className="w-6 h-6" /> },
            { step: "2", text: how_it_works.step2, icon: <Sparkles className="w-6 h-6" /> },
            { step: "3", text: how_it_works.step3, icon: <FileText className="w-6 h-6" /> },
            { step: "4", text: how_it_works.step4, icon: <Download className="w-6 h-6" /> }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {item.icon}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transform translate-x-4"></div>
                )}
              </div>
              <p className="text-gray-700 font-medium leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative container mx-auto px-4 py-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {faq.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ответы на самые популярные вопросы
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {[
            { q: faq.q1, a: faq.a1 },
            { q: faq.q2, a: faq.a2 },
            { q: faq.q3, a: faq.a3 }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between group-hover:text-blue-600 transition-colors">
                    {item.q}
                    <ChevronDown className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {item.a}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold mb-4">Готовы начать?</h2>
              <p className="text-xl mb-8 opacity-90">
                Присоединяйтесь к тысячам успешных продавцов на Kaspi
              </p>
              <Link href="/studio">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Начать бесплатно
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Kaspi Card Builder</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Профессиональные карточки товаров для Kaspi Marketplace. Автоматизация обработки фотографий и генерация описаний.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Продукт</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/studio" className="hover:text-white transition-colors flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Студия</Link></li>
                <li><a href="/pricing" className="hover:text-white transition-colors flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Тарифы</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Документация</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Поддержка</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="mailto:support@kaspi-card-builder.com" className="hover:text-white transition-colors flex items-center"><Mail className="w-4 h-4 mr-2" />support@kaspi-card-builder.com</a></li>
                <li><a href="https://t.me/kaspi_card_builder" className="hover:text-white transition-colors flex items-center"><MessageCircle className="w-4 h-4 mr-2" />Telegram</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors flex items-center"><ArrowRight className="w-4 h-4 mr-2" />FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Контакты</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center"><Mail className="w-4 h-4 mr-2" />info@kaspi-card-builder.com</li>
                <li className="flex items-center"><MessageCircle className="w-4 h-4 mr-2" />@kaspi_card_builder</li>
                <li className="flex items-center"><Clock className="w-4 h-4 mr-2" />Пн-Пт 9:00-18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Kaspi Card Builder. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Демо-видео</p>
                <p className="text-sm text-gray-400">Скоро будет доступно</p>
              </div>
            </div>
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
