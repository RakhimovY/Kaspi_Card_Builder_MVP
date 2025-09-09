'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { useTranslations } from '@/lib/useTranslations';
import { useEffect, useState } from 'react';
import { FileText, QrCode, Globe, Layers, Tag, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import TitleDescriptionGenerator from './TitleDescriptionGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BarcodeScanner from './BarcodeScanner';
import ProductVariants from './ProductVariants';
import ProductAttributes from './ProductAttributes';
import ProductLogistics from './ProductLogistics';
import MagicFillButton from './MagicFillButton';

export default function ProductForm() {
  const { 
    formData, 
    updateFormData, 
    resetForm,
    clearStorage
  } = useAppStore();
  const { t } = useTranslations();
  const { processingState } = useImageProcessing();
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  
  // Форма остается доступной во время обработки
  const isProcessing = processingState.inFlight > 0;

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    updateFormData({ [field]: value });
  };

  const generateSKU = () => {
    const { brand, model } = formData;
    if (brand && model) {
      const sku = `${brand.toLowerCase().replace(/\s+/g, '-')}-${model.toLowerCase().replace(/\s+/g, '-')}`;
      updateFormData({ sku });
    }
  };

  useEffect(() => {
    // Auto-generate SKU when brand or model changes
    if (formData.brand && formData.model && !formData.sku) {
      generateSKU();
    }
  }, [formData.brand, formData.model]);


  const handleBarcodeScan = (barcode: string) => {
    updateFormData({ gtin: barcode });
  };

  // Функция для проверки заполненности табов
  const getTabStatus = (tabName: string) => {
    switch (tabName) {
      case 'identification':
        const requiredIdFields = ['sku', 'brand', 'type', 'model', 'category', 'price', 'quantity'];
        const filledIdFields = requiredIdFields.filter(field => {
          const value = formData[field as keyof typeof formData];
          if (typeof value === 'string') return value.trim().length > 0;
          if (typeof value === 'number') return value > 0;
          return false;
        });
        return { isRequired: true, isComplete: filledIdFields.length === requiredIdFields.length };
      
      case 'content':
        const requiredContentFields = ['titleRU', 'titleKZ', 'descRU', 'descKZ'];
        const filledContentFields = requiredContentFields.filter(field => {
          const value = formData[field as keyof typeof formData];
          return typeof value === 'string' && value.trim().length > 0;
        });
        return { isRequired: true, isComplete: filledContentFields.length === requiredContentFields.length };
      
      case 'variants':
        return { isRequired: false, isComplete: Array.isArray(formData.variants) && formData.variants.length > 0 };
      
      case 'attributes':
        return { isRequired: false, isComplete: Array.isArray(formData.attributes) && formData.attributes.length > 0 };
      
      case 'logistics':
        const logisticsFields = ['weight', 'dimensions', 'warranty', 'country', 'cert', 'power', 'age', 'bundle'];
        const filledLogisticsFields = logisticsFields.filter(field => {
          const value = formData[field as keyof typeof formData];
          return typeof value === 'string' && value.trim().length > 0;
        });
        return { isRequired: false, isComplete: filledLogisticsFields.length > 0 };
      
      default:
        return { isRequired: false, isComplete: false };
    }
  };

  // Функция для расчета общего прогресса
  const getOverallProgress = () => {
    const requiredTabs = ['identification', 'content'];
    const completedRequiredTabs = requiredTabs.filter(tab => getTabStatus(tab).isComplete).length;
    return Math.round((completedRequiredTabs / requiredTabs.length) * 100);
  };

  return (
    <Card 
      className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg compact-card"
      aria-busy={isProcessing}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>{t('studio.form.title')}</span>
            {isProcessing && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {t('studio.form.processing')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Очистить localStorage и сбросить store? (только для разработки)')) {
                    clearStorage();
                    window.location.reload();
                  }
                }}
                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
              >
                Очистить Storage
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(t('studio.form.reset_confirm'))) {
                  resetForm();
                }
              }}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              {t('studio.form.reset_form')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="identification" className="w-full">
          {/* Подсказка о обязательных табах */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>
                <strong>{t('studio.form.tabs_hint.required')}:</strong> {t('studio.form.tabs.identification')} и {t('studio.form.tabs.content')}. 
                <strong className="text-gray-500 ml-2">{t('studio.form.tabs_hint.optional')}:</strong> {t('studio.form.tabs.variants')}, {t('studio.form.tabs.attributes')}, {t('studio.form.tabs.logistics')}
              </span>
            </div>
          </div>
          
          <TabsList className="grid w-full grid-cols-5 bg-gray-50 h-12 mx-4 mb-2">
            <TabsTrigger 
              value="identification" 
              className={`flex items-center gap-1 text-xs relative ${
                getTabStatus('identification').isComplete ? 'text-green-600' : ''
              }`}
            >
              <QrCode className="w-3 h-3" />
              <span className="truncate">{t('studio.form.tabs.identification')}</span>
              {getTabStatus('identification').isRequired && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              {getTabStatus('identification').isComplete && (
                <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="content" 
              className={`flex items-center gap-1 text-xs relative ${
                getTabStatus('content').isComplete ? 'text-green-600' : ''
              }`}
            >
              <Globe className="w-3 h-3" />
              <span className="truncate">{t('studio.form.tabs.content')}</span>
              {getTabStatus('content').isRequired && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              {getTabStatus('content').isComplete && (
                <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="variants" 
              className={`flex items-center gap-1 text-xs relative ${
                getTabStatus('variants').isComplete ? 'text-green-600' : ''
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="truncate">{t('studio.form.tabs.variants')}</span>
              {getTabStatus('variants').isComplete && (
                <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="attributes" 
              className={`flex items-center gap-1 text-xs relative ${
                getTabStatus('attributes').isComplete ? 'text-green-600' : ''
              }`}
            >
              <Tag className="w-3 h-3" />
              <span className="truncate">{t('studio.form.tabs.attributes')}</span>
              {getTabStatus('attributes').isComplete && (
                <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="logistics" 
              className={`flex items-center gap-1 text-xs relative ${
                getTabStatus('logistics').isComplete ? 'text-green-600' : ''
              }`}
            >
              <Truck className="w-3 h-3" />
              <span className="truncate">{t('studio.form.tabs.logistics')}</span>
              {getTabStatus('logistics').isComplete && (
                <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Прогресс-бар */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Progress value={getOverallProgress()} className="h-2" />
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {getOverallProgress()}% {t('common.ready')}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getOverallProgress() === 100 
                ? t('studio.form.progress.complete')
                : t('studio.form.progress.incomplete')
              }
            </div>
          </div>

          {/* Identification Tab */}
          <TabsContent value="identification" className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.sku_base')} *
                </label>
                <Input
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder={t('studio.form.fields.sku_base_placeholder')}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.gtin')}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.gtin || ''}
                    onChange={(e) => handleInputChange('gtin', e.target.value)}
                    placeholder={t('studio.form.fields.gtin_placeholder')}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    onClick={() => setIsBarcodeScannerOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <QrCode className="w-4 h-4" />
                    {t('studio.form.actions.scan_barcode')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.brand')} *
                </label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder={t('studio.form.fields.brand_placeholder')}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.type')} *
                </label>
                <Input
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  placeholder={t('studio.form.fields.type_placeholder')}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.model')} *
                </label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder={t('studio.form.fields.model_placeholder')}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.category')} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('studio.form.fields.category_placeholder')}</option>
                  <option value="electronics">{t('studio.form.categories.electronics')}</option>
                  <option value="clothing">{t('studio.form.categories.clothing')}</option>
                  <option value="cosmetics">{t('studio.form.categories.cosmetics')}</option>
                  <option value="home">{t('studio.form.categories.home')}</option>
                  <option value="sports">{t('studio.form.categories.sports')}</option>
                  <option value="books">{t('studio.form.categories.books')}</option>
                  <option value="toys">{t('studio.form.categories.toys')}</option>
                  <option value="other">{t('studio.form.categories.other')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('studio.form.fields.key_spec')}
              </label>
              <Textarea
                value={formData.keySpec}
                onChange={(e) => handleInputChange('keySpec', e.target.value)}
                placeholder={t('studio.form.fields.key_spec_placeholder')}
                rows={2}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Magic Fill Button */}
            <div className="flex justify-center pt-2">
              <MagicFillButton />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.price')} *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder={t('studio.form.fields.price_placeholder')}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.quantity')} *
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  placeholder={t('studio.form.fields.quantity_placeholder')}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.title_ru')} *
                </label>
                <Textarea
                  value={formData.titleRU}
                  onChange={(e) => handleInputChange('titleRU', e.target.value)}
                  placeholder={t('studio.form.fields.title_ru_placeholder')}
                  rows={2}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.title_kz')} *
                </label>
                <Textarea
                  value={formData.titleKZ}
                  onChange={(e) => handleInputChange('titleKZ', e.target.value)}
                  placeholder={t('studio.form.fields.title_kz_placeholder')}
                  rows={2}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.desc_ru')} *
                </label>
                <Textarea
                  value={formData.descRU}
                  onChange={(e) => handleInputChange('descRU', e.target.value)}
                  placeholder={t('studio.form.fields.desc_ru_placeholder')}
                  rows={4}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.desc_kz')} *
                </label>
                <Textarea
                  value={formData.descKZ}
                  onChange={(e) => handleInputChange('descKZ', e.target.value)}
                  placeholder={t('studio.form.fields.desc_kz_placeholder')}
                  rows={4}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <TitleDescriptionGenerator />
            </div>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="p-4">
            <ProductVariants />
          </TabsContent>

          {/* Attributes Tab */}
          <TabsContent value="attributes" className="p-4">
            <ProductAttributes />
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value="logistics" className="p-4">
            <ProductLogistics />
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </Card>
  );
}
