'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { useEffect } from 'react';
import { FileText, CheckSquare, Package, Settings, FileEdit } from 'lucide-react';
import TitleDescriptionGenerator from './TitleDescriptionGenerator';
import { CategoryChecklist } from './CategoryChecklist';
import { getChecklistByCategoryId } from '@/lib/categoryChecklists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { value: 'electronics', label: 'Электроника' },
  { value: 'clothing', label: 'Одежда' },
  { value: 'cosmetics', label: 'Косметика' },
  { value: 'home', label: 'Дом и сад' },
  { value: 'sports', label: 'Спорт и отдых' },
  { value: 'books', label: 'Книги' },
  { value: 'toys', label: 'Игрушки' },
  { value: 'other', label: 'Другое' },
];

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
            <span>Информация о товаре</span>
            {isProcessing && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Обработка...
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Сбросить форму?')) {
                resetForm();
                resetCategoryChecklist();
              }
            }}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            Сбросить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 h-10">
            <TabsTrigger value="basic" className="flex items-center gap-1 text-xs">
              <Package className="w-3 h-3" />
              Основное
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-1 text-xs">
              <Settings className="w-3 h-3" />
              Детали
            </TabsTrigger>
            <TabsTrigger value="description" className="flex items-center gap-1 text-xs">
              <FileEdit className="w-3 h-3" />
              Описание
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1 text-xs">
              <CheckSquare className="w-3 h-3" />
              Чек-лист
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Бренд *
                </label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Введите бренд"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип товара *
                </label>
                <Input
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  placeholder="Смартфон, Футболка..."
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Модель *
                </label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Модель товара"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите категорию</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ключевые характеристики
              </label>
              <Textarea
                value={formData.keySpec}
                onChange={(e) => handleInputChange('keySpec', e.target.value)}
                placeholder="Основные характеристики товара"
                rows={2}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (₸) *
                </label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', Number(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество *
                </label>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => handleInputChange('quantity', Number(e.target.value) || 1)}
                  placeholder="1"
                  min="1"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Автогенерация или введите вручную"
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSKU}
                  disabled={!formData.brand || !formData.model}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 whitespace-nowrap"
                >
                  Авто
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дополнительные характеристики
              </label>
              <Textarea
                value={formData.additionalSpecs}
                onChange={(e) => handleInputChange('additionalSpecs', e.target.value)}
                placeholder="Размеры, вес, материал, цвет..."
                rows={3}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </TabsContent>

          {/* Description Tab */}
          <TabsContent value="description" className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание товара
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Подробное описание товара, его преимущества и особенности..."
                rows={4}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t">
              <TitleDescriptionGenerator />
            </div>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="p-4">
            {hasChecklist && currentChecklist ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Чек-лист готовности
                  </h3>
                </div>
                <CategoryChecklist
                  categoryId={formData.category}
                  checklist={currentChecklist}
                  checkedItems={categoryChecklist.checkedItems}
                  onItemToggle={handleChecklistItemToggle}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Выберите категорию для отображения чек-листа</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Form Status - Compact */}
        <div className="px-4 pb-3 border-t bg-gray-50">
          <div className="pt-2">
            <div className="text-xs text-gray-600 mb-2">Заполнено полей:</div>
            <div className="grid grid-cols-4 gap-1 text-xs">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize truncate text-xs">{key}:</span>
                  <span className={value ? 'text-green-600' : 'text-red-500'}>
                    {value ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
