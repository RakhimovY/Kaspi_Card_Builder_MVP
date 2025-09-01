'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { useEffect } from 'react';
import { FileText } from 'lucide-react';

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
  const { formData, updateFormData, resetForm } = useAppStore();
  const { processingState } = useImageProcessing();
  
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

  const autoGenerateTitle = () => {
    const { type, brand, model, keySpec } = formData;
    if (type && brand && model) {
      const title = [type, brand, model, keySpec].filter(Boolean).join(' ');
      // TODO: Add title to store
    }
  };

  useEffect(() => {
    // Auto-generate SKU when brand or model changes
    if (formData.brand && formData.model && !formData.sku) {
      generateSKU();
    }
  }, [formData.brand, formData.model]);

  return (
    <Card 
      className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg"
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
              }
            }}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            Сбросить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип товара *
            </label>
            <Input
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              placeholder="Например: Смартфон, Футболка, Крем"
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ключевые характеристики
            </label>
            <Textarea
              value={formData.keySpec}
              onChange={(e) => handleInputChange('keySpec', e.target.value)}
              placeholder="Основные характеристики товара"
              rows={3}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* SKU and Category */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
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
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                Авто
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Price and Quantity */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дополнительные характеристики
            </label>
            <Textarea
              value={formData.additionalSpecs}
              onChange={(e) => handleInputChange('additionalSpecs', e.target.value)}
              placeholder="Размеры, вес, материал, цвет и другие характеристики..."
              rows={3}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Auto-generation */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={autoGenerateTitle}
            disabled={!formData.type || !formData.brand || !formData.model}
            className="w-full"
          >
            Автогенерация заголовка
          </Button>
        </div>

        {/* Form Status */}
        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Заполнено полей:</p>
            <div className="space-y-1">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
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
