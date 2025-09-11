'use client';

import { Button } from '@/components/ui/button';
import { BuyProButton } from '@/components/BuyProButton';
import Header from '@/components/Header';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { useLandingTranslations } from '@/lib/useTranslations';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoIcon from '@/components/LogoIcon';
import { 
  ArrowRight, 
  MessageCircle,
  ChevronDown,
  Check,
  User,
  Crown,
  ScanLine,
  Brain,
  Package,
  QrCode,
  Wand2,
} from 'lucide-react';

interface SubscriptionData {
  plan: string
  status: string
  subscription: {
    plan: string
    status: string
  } | null
}

interface FAQItemProps {
  question: string
  answer: string
  index: number
}

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 pr-4">{question}</h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-0">
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="text-gray-600 leading-relaxed"
                >
                  {answer}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const { nav, hero, features, how_it_works, faq, pricing, cta, footer, user_status, isLoading, hasError } = useLandingTranslations();

  useEffect(() => {
    setMounted(true);
    trackPageView('/landing');
    
    // Monitor Lemon Squeezy script loading
    const checkLemonSqueezy = () => {
      if (typeof window !== 'undefined' && (window as unknown as { createLemonSqueezy?: unknown }).createLemonSqueezy) {
        (window as unknown as { lemonSqueezyReady?: boolean }).lemonSqueezyReady = true;
        // Lemon Squeezy script detected
      }
    };
    
    // Check immediately
    checkLemonSqueezy();
    
    // Check periodically until loaded
    const interval = setInterval(checkLemonSqueezy, 500);
    
    // Handle hash navigation (e.g., from profile page)
    const handleHashNavigation = () => {
      if (window.location.hash === '#pricing') {
        setTimeout(() => {
          scrollToPricing();
        }, 500); // Wait for page to load
      }
    };
    
    // Check hash on mount
    handleHashNavigation();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  // Fetch subscription data when session changes
  useEffect(() => {
    if (session?.user?.email && !subscriptionData) {
      fetchSubscriptionData();
    }
  }, [session?.user?.email, subscriptionData]);

  const fetchSubscriptionData = async () => {
    if (isLoadingSubscription) return; // Prevent duplicate calls
    
    setIsLoadingSubscription(true);
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Check if user is registered or has Pro subscription
  const isUserRegistered = !!session?.user;
  const hasProSubscription = subscriptionData?.plan === 'pro' && subscriptionData?.status === 'active';
  const shouldDisableStartFree = isUserRegistered || hasProSubscription;

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };


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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-50 to-pink-50 rounded-full filter blur-3xl opacity-60"></div>
      </div>

      {/* Header */}
      <Header 
        variant="landing"
        showPricingButton={true}
        onPricingClick={scrollToPricing}
      />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-8 md:py-16 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 mb-8"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">{hero.badge}</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-gray-900 leading-tight">
            {hero.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            {hero.subtitle} 
            <span className="font-semibold text-gray-900">{hero.subtitle_highlight}</span>
          </p>

          {/* CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center items-center mb-8 md:mb-12"
          >
            <Link href="/studio">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {hero.cta}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">{hero.stats.scan}</div>
              <div className="text-sm text-gray-600">{hero.stats.scan_desc}</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">{hero.stats.time}</div>
              <div className="text-sm text-gray-600">{hero.stats.time_desc}</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">{hero.stats.manual}</div>
              <div className="text-sm text-gray-600">{hero.stats.manual_desc}</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-8 md:py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{features.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {features.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <ScanLine className="w-6 h-6" />,
              title: features.kaspi_check,
              description: features.kaspi_check_desc,
            },
            {
              icon: <Brain className="w-6 h-6" />,
              title: features.generator,
              description: features.generator_desc,
            },
            {
              icon: <Package className="w-6 h-6" />,
              title: features.export,
              description: features.export_desc,
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mb-6 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative container mx-auto px-4 py-8 md:py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {how_it_works.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {how_it_works.subtitle}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                step: "01", 
                text: how_it_works.step1, 
                icon: <QrCode className="w-5 h-5" />
              },
              { 
                step: "02", 
                text: how_it_works.step2, 
                icon: <Wand2 className="w-5 h-5" />
              },
              { 
                step: "03", 
                text: how_it_works.step3, 
                icon: <Brain className="w-5 h-5" />
              },
              { 
                step: "04", 
                text: how_it_works.step4, 
                icon: <Package className="w-5 h-5" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-500 mb-2">{item.step}</div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative container mx-auto px-4 py-8 md:py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-8"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {pricing.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {pricing.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pricing.free.title}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">{pricing.free.price}</div>
                <p className="text-gray-600 mb-4">{pricing.free.description}</p>
                <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {pricing.free.limit}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {Object.values(pricing.free.features).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {shouldDisableStartFree ? (
                <Button 
                  className="w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  {hasProSubscription ? (
                    <>
                      <Crown className="mr-2 w-4 h-4" />
                      {user_status.already_pro}
                    </>
                  ) : (
                    <>
                      <User className="mr-2 w-4 h-4" />
                      {user_status.already_registered}
                    </>
                  )}
                </Button>
              ) : (
                <Link href="/studio">
                  <Button 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {pricing.free.cta}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="p-8 bg-gray-900 text-white rounded-2xl border-2 border-gray-900 hover:shadow-2xl transition-all duration-300 h-full relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium border border-gray-700">
                  {pricing.mostPopular}
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{pricing.pro.title}</h3>
                <div className="text-4xl font-bold mb-2">{pricing.pro.price}<span className="text-gray-400 text-lg">/месяц</span></div>
                <p className="text-gray-300 mb-4">{pricing.pro.description}</p>
                <div className="inline-block bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                  {pricing.pro.limit}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {Object.values(pricing.pro.features).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <BuyProButton 
                className="w-full bg-white text-gray-900 hover:bg-gray-100"
                onSuccess={() => {
                  // Redirect to studio after successful purchase
                  setTimeout(() => {
                    window.location.href = '/studio';
                  }, 2500);
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative container mx-auto px-4 py-8 md:py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-8"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {faq.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {faq.subtitle}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {[
            { q: faq.q1, a: faq.a1 },
            { q: faq.q2, a: faq.a2 },
            { q: faq.q3, a: faq.a3 },
            { q: faq.q4, a: faq.a4 },
            { q: faq.q5, a: faq.a5 },
            { q: faq.q6, a: faq.a6 }
          ].map((item, index) => (
            <FAQItem key={index} question={item.q} answer={item.a} index={index} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-8 md:py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="p-12 bg-gray-900 text-white rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{cta.title}</h2>
            <p className="text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
              {cta.subtitle}
            </p>
            <div className="flex justify-center items-center">
              {shouldDisableStartFree ? (
                <Button 
                  size="lg" 
                  variant="secondary"
                  disabled
                  className="text-lg px-8 py-4 bg-gray-700 text-gray-400 cursor-not-allowed"
                >
                  {hasProSubscription ? (
                    <>
                      <Crown className="mr-2 w-5 h-5" />
                      {user_status.already_pro}
                    </>
                  ) : (
                    <>
                      <User className="mr-2 w-5 h-5" />
                      {user_status.already_registered}
                    </>
                  )}
                </Button>
              ) : (
                <Link href="/studio">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="text-lg px-8 py-4 bg-white text-gray-900 hover:bg-gray-100"
                  >
                    {cta.start_free}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-12 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <LogoIcon className="text-gray-900" size="md" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{footer.title}</h3>
                <p className="text-sm text-gray-400">{footer.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="https://wa.me/77086934037?text=Здравствуйте!%20Меня%20интересует%20Trade%20Card%20Builder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{footer.whatsapp}</span>
              </a>
              <a 
                href="https://t.me/YerkebulanR" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{footer.telegram_contact}</span>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-400">
            <p className="text-sm">{footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
