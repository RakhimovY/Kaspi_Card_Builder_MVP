'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AuthButtons } from '@/components/AuthButtons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations, useAuthTranslations } from '@/lib/useTranslations';
import { 
  Camera, 
  ArrowLeft, 
  Menu, 
  X,
  Home,
  User,
  Settings
} from 'lucide-react';

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
  const mobileMenuItems: Array<{ href: Route; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { href: '/landing', label: 'Главная', icon: Home },
    { href: '/studio', label: 'Студия', icon: Camera },
    { href: '/profile', label: 'Профиль', icon: User },
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
            <Link href={backHref} className="flex items-center space-x-2 group">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-gray-600 group-hover:text-blue-600 transition-colors text-sm sm:text-base hidden sm:inline">
                {displayBackLabel}
              </span>
            </Link>
          )}
          
          <Link href="/landing" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-xs sm:text-sm text-gray-500">{displaySubtitle}</p>
              )}
            </div>
            {/* Mobile title */}
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                {variant === 'landing' ? 'TCB' : displayTitle}
              </h1>
            </div>
          </Link>
        </motion.div>

        {/* Right side - Desktop actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center space-x-4"
        >
          {showPricingButton && (
            <Button 
              variant="outline" 
              onClick={onPricingClick}
              className="text-sm"
            >
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
            className="p-2"
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
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="sm:hidden mt-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="p-4 space-y-3">
            {/* Mobile title and subtitle */}
            <div className="pb-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{displayTitle}</h2>
              {displaySubtitle && (
                <p className="text-sm text-gray-500 mt-1">{displaySubtitle}</p>
              )}
            </div>

            {/* Navigation items */}
            <div className="space-y-2">
              {mobileMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile actions */}
            <div className="pt-3 border-t border-gray-200 space-y-3">
              {showPricingButton && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onPricingClick?.();
                    closeMobileMenu();
                  }}
                  className="w-full"
                >
                  Тарифы
                </Button>
              )}
              
              
              <div className="flex space-x-2">
                {showAuthButtons && (
                  <div className="flex-1">
                    <AuthButtons />
                  </div>
                )}
                {showLanguageSwitcher && (
                  <div className="flex-1">
                    <LanguageSwitcher />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
