'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AuthButtons } from '@/components/AuthButtons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations, useAuthTranslations } from '@/lib/useTranslations';
import { 
  ArrowLeft, 
  Menu, 
  X,
  Home,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import LogoIcon from './LogoIcon';

interface HeaderProps {
  variant?: 'landing' | 'studio' | 'profile' | 'minimal';
  showBackButton?: boolean;
  backHref?: Route;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  showPricingButton?: boolean;
  onPricingClick?: () => void;
  showAuthButtons?: boolean;
  showLanguageSwitcher?: boolean;
  className?: string;
}

export default function Header({
  variant = 'landing',
  showBackButton = false,
  backHref = '/',
  backLabel,
  title,
  subtitle,
  showPricingButton = false,
  onPricingClick,
  showAuthButtons = true,
  showLanguageSwitcher = true,
  className = ''
}: HeaderProps) {
  const { t } = useTranslations();
  const { profile } = useAuthTranslations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getDefaultBackLabel = () => {
    switch (variant) {
      case 'studio':
        return t('studio.back_to_landing');
      case 'profile':
        return profile.backToHome;
      default:
        return 'Назад';
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'landing':
        return 'Trade Card Builder';
      case 'studio':
        return t('studio.page_title');
      case 'profile':
        return profile.pageTitle;
      default:
        return 'Trade Card Builder';
    }
  };

  const getDefaultSubtitle = () => {
    switch (variant) {
      case 'studio':
        return t('studio.subtitle');
      default:
        return undefined;
    }
  };

  const displayTitle = title || getDefaultTitle();
  const displaySubtitle = subtitle || getDefaultSubtitle();
  const displayBackLabel = backLabel || getDefaultBackLabel();

  // Mobile menu items
  const mobileMenuItems: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }>; description?: string }> = [
    { href: '/landing', label: 'Главная', icon: Home, description: 'На главную страницу' },
    { href: '/studio', label: 'Студия', icon: LogoIcon, description: 'Открыть студию обработки' },
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative container mx-auto px-4 py-6 z-10 ${className}`}
    >
      <div className="flex justify-between items-center">
        {/* Left side - Logo and back button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 sm:space-x-4"
        >
          {showBackButton && (
            <Link href={backHref} className="flex items-center space-x-2 group p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-gray-600 group-hover:text-blue-600 transition-colors text-sm sm:text-base hidden sm:inline font-medium">
                {displayBackLabel}
              </span>
            </Link>
          )}
          
          <Link href="/landing" className="flex items-center space-x-2 sm:space-x-3 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-800 to-gray-900 rounded-xl flex items-center justify-center group-hover:from-slate-700 group-hover:to-gray-800 transition-all shadow-lg">
              <LogoIcon className="text-white" size="sm" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-xs sm:text-sm text-gray-500">{displaySubtitle}</p>
              )}
            </div>
            {/* Mobile title */}
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {variant === 'landing' ? 'TCB' : displayTitle}
              </h1>
            </div>
          </Link>
        </motion.div>

        {/* Right side - Desktop actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center space-x-3"
        >
          {showPricingButton && (
            <Button 
              variant="outline" 
              onClick={onPricingClick}
              className="text-sm px-4 py-2 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
            >
              <Crown className="w-4 h-4 mr-2" />
              Тарифы
            </Button>
          )}
          
          {showAuthButtons && <AuthButtons />}
          {showLanguageSwitcher && <LanguageSwitcher />}
        </motion.div>

        {/* Mobile menu button */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sm:hidden"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="sm:hidden mt-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Mobile title and subtitle */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <LogoIcon className="text-white" size="sm" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{displayTitle}</h2>
                </div>
                {displaySubtitle && (
                  <p className="text-sm text-gray-500 ml-11">{displaySubtitle}</p>
                )}
              </div>

              {/* Navigation items */}
              <div className="space-y-2">
                {mobileMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">{item.label}</span>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile actions */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                {showPricingButton && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onPricingClick?.();
                      closeMobileMenu();
                    }}
                    className="w-full h-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 text-purple-700 font-medium"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Тарифы и подписки
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {showAuthButtons && (
                    <div className="col-span-1">
                      <AuthButtons />
                    </div>
                  )}
                  {showLanguageSwitcher && (
                    <div className="col-span-1">
                      <LanguageSwitcher />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
