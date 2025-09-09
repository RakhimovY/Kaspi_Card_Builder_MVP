'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/lib/useTranslations';
import { useAppStore, ProductVariant } from '@/lib/store';
import { trackVariantsAdded } from '@/lib/analytics';
import { Plus, Trash2, Package, AlertCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function ProductVariants() {
  const { t } = useTranslations();
  const { formData, addVariant, updateVariant, removeVariant } = useAppStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddVariant = () => {
    addVariant({
      sku: '',
      color: '',
      size: '',
      capacity: '',
      compat: '',
    });
    
    // Отправляем аналитику
    trackVariantsAdded((Array.isArray(formData.variants) ? formData.variants.length : 0) + 1);
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, value: string) => {
    // Валидация SKU
    if (field === 'sku') {
      const skuError = validateSKU(value, id);
      setErrors(prev => ({
        ...prev,
        [id]: skuError
      }));
    }
    
    updateVariant(id, { [field]: value });
  };

  const validateSKU = (sku: string, variantId: string): string => {
    if (!sku.trim()) return 'SKU обязателен';
    if (sku.length < 3) return 'SKU должен содержать минимум 3 символа';
    if (!/^[A-Za-z0-9-_]+$/.test(sku)) return 'SKU может содержать только буквы, цифры, дефисы и подчеркивания';
    
    // Проверка на уникальность
    const isDuplicate = Array.isArray(formData.variants) ? formData.variants.some(v => v.id !== variantId && v.sku === sku) : false;
    if (isDuplicate) return 'SKU должен быть уникальным';
    
    return '';
  };

  const handleRemoveVariant = (id: string) => {
    removeVariant(id);
    // Удаляем ошибку при удалении варианта
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const generateVariantSKU = (variant: ProductVariant, index: number) => {
    if (variant.sku) return; // Не перезаписываем существующий SKU
    
    const baseSku = formData.sku || 'PRODUCT';
    const color = variant.color ? `-${variant.color.toLowerCase().replace(/\s+/g, '-')}` : '';
    const size = variant.size ? `-${variant.size.toLowerCase()}` : '';
    const capacity = variant.capacity ? `-${variant.capacity.toLowerCase().replace(/\s+/g, '-')}` : '';
    
    const generatedSKU = `${baseSku}${color}${size}${capacity}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
    
    if (generatedSKU !== baseSku) {
      updateVariant(variant.id, { sku: generatedSKU });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t('studio.form.variants.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Добавьте варианты товара с разными характеристиками (цвет, размер, объем)
          </p>
        </div>
        <Button
          onClick={handleAddVariant}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('studio.form.variants.add')}
        </Button>
      </div>

      {!formData.variants || !Array.isArray(formData.variants) || formData.variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>{t('studio.form.variants.no_variants')}</p>
          <p className="text-sm mt-2">Нажмите "Добавить вариант" для создания вариантов товара</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(Array.isArray(formData.variants) ? formData.variants : []).map((variant, index) => (
            <div
              key={variant.id}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  {t('studio.form.variants.title')} #{index + 1}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => generateVariantSKU(variant, index)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Автогенерация SKU"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleRemoveVariant(variant.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('studio.form.variants.sku')} *
                  </label>
                  <Input
                    value={variant.sku}
                    onChange={(e) => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                    placeholder="VARIANT-SKU-001"
                    className={`w-full ${errors[variant.id] ? 'border-red-500' : ''}`}
                  />
                  {errors[variant.id] && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors[variant.id]}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('studio.form.variants.color')}
                  </label>
                  <Input
                    value={variant.color || ''}
                    onChange={(e) => handleUpdateVariant(variant.id, 'color', e.target.value)}
                    placeholder="Красный, Синий..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('studio.form.variants.size')}
                  </label>
                  <Input
                    value={variant.size || ''}
                    onChange={(e) => handleUpdateVariant(variant.id, 'size', e.target.value)}
                    placeholder="S, M, L, XL..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('studio.form.variants.capacity')}
                  </label>
                  <Input
                    value={variant.capacity || ''}
                    onChange={(e) => handleUpdateVariant(variant.id, 'capacity', e.target.value)}
                    placeholder="128GB, 500мл..."
                    className="w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('studio.form.variants.compat')}
                  </label>
                  <Input
                    value={variant.compat || ''}
                    onChange={(e) => handleUpdateVariant(variant.id, 'compat', e.target.value)}
                    placeholder="iPhone 12, Samsung Galaxy..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
