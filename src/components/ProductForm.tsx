'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { useTranslations } from '@/lib/useTranslations';
import { useEffect } from 'react';
import { FileText, CheckSquare, Package, Settings, FileEdit } from 'lucide-react';
import TitleDescriptionGenerator from './TitleDescriptionGenerator';
import { CategoryChecklist } from './CategoryChecklist';
import { getChecklistByCategoryId } from '@/lib/categoryChecklists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductForm() {
  const { 
    formData, 
    updateFormData, 
    resetForm,
    categoryChecklist,
    setCategoryChecklist,
    toggleCategoryItem,
    resetCategoryChecklist
  } = useAppStore();
  const { t } = useTranslations();
  const { processingState } = useImageProcessing();
  
  // Форма остается доступной во время обработки
  const isProcessing = processingState.inFlight > 0;

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    updateFormData({ [field]: value });
    
    // Reset category checklist when category changes
    if (field === 'category' && value !== categoryChecklist.categoryId) {
      resetCategoryChecklist();
    }
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

  // Get current category checklist
  const currentChecklist = getChecklistByCategoryId(formData.category);
  const hasChecklist = currentChecklist && ['clothing', 'electronics', 'cosmetics'].includes(formData.category);

  const handleChecklistItemToggle = (itemId: string, checked: boolean) => {
    if (checked) {
      toggleCategoryItem(itemId);
    } else {
      toggleCategoryItem(itemId);
    }
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm(t('studio.form.reset_confirm'))) {
                resetForm();
                resetCategoryChecklist();
              }
            }}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            {t('studio.form.reset_form')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 h-10">
            <TabsTrigger value="basic" className="flex items-center gap-1 text-xs">
              <Package className="w-3 h-3" />
              {t('studio.form.tabs.basic')}
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-1 text-xs">
              <Settings className="w-3 h-3" />
              {t('studio.form.tabs.details')}
            </TabsTrigger>
            <TabsTrigger value="description" className="flex items-center gap-1 text-xs">
              <FileEdit className="w-3 h-3" />
              {t('studio.form.tabs.description')}
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1 text-xs">
              <CheckSquare className="w-3 h-3" />
              {t('studio.form.tabs.checklist')}
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.brand')}
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
                  {t('studio.form.fields.type')}
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
                  {t('studio.form.fields.model')}
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
                  {t('studio.form.fields.category')}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.fields.sku_base')}
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
                  {t('studio.form.fields.price')}
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder={t('studio.form.fields.price_placeholder')}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('studio.form.fields.quantity')}
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                placeholder={t('studio.form.fields.quantity_placeholder')}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('studio.form.fields.description')}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('studio.form.fields.description_placeholder')}
                rows={4}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </TabsContent>

          {/* Description Generator Tab */}
          <TabsContent value="description" className="p-4">
            <TitleDescriptionGenerator />
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="p-4">
            {hasChecklist ? (
              <CategoryChecklist 
                categoryId={formData.category}
                checklist={currentChecklist}
                onItemToggle={handleChecklistItemToggle}
                checkedItems={categoryChecklist.checkedItems}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t('studio.form.fields.category_placeholder')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
