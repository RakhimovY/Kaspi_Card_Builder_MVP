'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/lib/useTranslations';
import { useAppStore, ProductAttribute } from '@/lib/store';
import { Plus, Trash2, Tag, AlertCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { trackAttributesAdded } from '@/lib/analytics';

// Пресеты популярных атрибутов
const ATTRIBUTE_PRESETS = {
  electronics: [
    { key: 'Материал', value: 'Пластик, металл' },
    { key: 'Питание', value: '220В, 50-60Гц' },
    { key: 'Гарантия', value: '12 месяцев' },
    { key: 'Страна', value: 'Китай' },
    { key: 'Сертификация', value: 'EAC, ТР ТС' },
    { key: 'Вес', value: '0.5 кг' },
    { key: 'Габариты', value: '20×15×8 см' }
  ],
  clothing: [
    { key: 'Материал', value: 'Хлопок 100%' },
    { key: 'Уход', value: 'Машинная стирка' },
    { key: 'Сезон', value: 'Всесезонный' },
    { key: 'Страна', value: 'Китай' },
    { key: 'Состав', value: 'Хлопок 100%' },
    { key: 'Посадка', value: 'Классическая' }
  ],
  cosmetics: [
    { key: 'Объем', value: '50мл' },
    { key: 'Срок годности', value: '36 месяцев' },
    { key: 'Страна', value: 'Китай' },
    { key: 'Сертификация', value: 'ТР ТС' },
    { key: 'Тип кожи', value: 'Все типы' },
    { key: 'Способ применения', value: 'Нанести на кожу' }
  ]
};

export default function ProductAttributes() {
  const { t } = useTranslations();
  const { formData, addAttribute, updateAttribute, removeAttribute } = useAppStore();
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [showPresets, setShowPresets] = useState(false);

  const handleAddAttribute = () => {
    addAttribute({
      key: '',
      value: '',
    });
    
    // Отправляем аналитику
    trackAttributesAdded((Array.isArray(formData.attributes) ? formData.attributes.length : 0) + 1);
  };

  const handleUpdateAttribute = (index: number, field: keyof ProductAttribute, value: string) => {
    // Валидация
    if (field === 'key') {
      const keyError = validateAttributeKey(value, index);
      setErrors(prev => ({
        ...prev,
        [index]: keyError
      }));
    }
    
    updateAttribute(index, { [field]: value });
  };

  const validateAttributeKey = (key: string, index: number): string => {
    if (!key.trim()) return 'Ключ атрибута обязателен';
    if (key.length < 2) return 'Ключ должен содержать минимум 2 символа';
    
    // Проверка на уникальность
    const isDuplicate = Array.isArray(formData.attributes) ? formData.attributes.some((attr, i) => i !== index && attr.key === key) : false;
    if (isDuplicate) return 'Ключ должен быть уникальным';
    
    return '';
  };

  const handleRemoveAttribute = (index: number) => {
    removeAttribute(index);
    // Удаляем ошибку при удалении атрибута
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const addPresetAttribute = (preset: { key: string; value: string }) => {
    addAttribute(preset);
    setShowPresets(false);
  };

  const getPresetsForCategory = () => {
    const category = formData.category?.toLowerCase();
    if (category && category in ATTRIBUTE_PRESETS) {
      return ATTRIBUTE_PRESETS[category as keyof typeof ATTRIBUTE_PRESETS];
    }
    return [];
  };

  const presets = getPresetsForCategory();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {t('studio.form.attributes.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Добавьте дополнительные характеристики товара
          </p>
        </div>
        <div className="flex items-center gap-2">
          {presets.length > 0 && (
            <Button
              onClick={() => setShowPresets(!showPresets)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Пресеты
            </Button>
          )}
          <Button
            onClick={handleAddAttribute}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('studio.form.attributes.add')}
          </Button>
        </div>
      </div>

      {/* Пресеты атрибутов */}
      {showPresets && presets.length > 0 && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-3">Пресеты для категории "{formData.category}"</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presets.map((preset, index) => (
              <Button
                key={index}
                onClick={() => addPresetAttribute(preset)}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-2"
              >
                <div>
                  <div className="font-medium">{preset.key}</div>
                  <div className="text-xs text-gray-500">{preset.value}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {!formData.attributes || !Array.isArray(formData.attributes) || formData.attributes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>{t('studio.form.attributes.no_attributes')}</p>
          <p className="text-sm mt-2">Нажмите "Добавить атрибут" или используйте пресеты</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(Array.isArray(formData.attributes) ? formData.attributes : []).map((attribute, index) => (
            <div
              key={index}
              className="flex gap-3 items-end"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.attributes.key')}
                </label>
                <Input
                  value={attribute.key}
                  onChange={(e) => handleUpdateAttribute(index, 'key', e.target.value)}
                  placeholder="Материал, Цвет, Размер..."
                  className={`w-full ${errors[index] ? 'border-red-500' : ''}`}
                />
                {errors[index] && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors[index]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studio.form.attributes.value')}
                </label>
                <Input
                  value={attribute.value}
                  onChange={(e) => handleUpdateAttribute(index, 'value', e.target.value)}
                  placeholder="Хлопок 100%, Красный, L..."
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => handleRemoveAttribute(index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 mb-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
