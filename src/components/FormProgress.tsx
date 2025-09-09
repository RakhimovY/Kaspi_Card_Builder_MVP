'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/lib/useTranslations';
import { useAppStore } from '@/lib/store';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function FormProgress() {
  const { t, loading: translationsLoading } = useTranslations();
  const { formData } = useAppStore();

  const progressData = useMemo(() => {
    const requiredFields = [
      { key: 'sku', label: 'SKU', value: formData.sku },
      { key: 'brand', label: 'Бренд', value: formData.brand },
      { key: 'type', label: 'Тип товара', value: formData.type },
      { key: 'model', label: 'Модель', value: formData.model },
      { key: 'category', label: 'Категория', value: formData.category },
      { key: 'titleRU', label: 'Заголовок (RU)', value: formData.titleRU },
      { key: 'descRU', label: 'Описание (RU)', value: formData.descRU },
      { key: 'price', label: 'Цена', value: formData.price },
      { key: 'quantity', label: 'Количество', value: formData.quantity },
    ];

    const completedFields = requiredFields.filter(field => {
      if (typeof field.value === 'string') {
        return field.value.trim().length > 0;
      }
      return false;
    });

    const missingFields = requiredFields.filter(field => {
      if (typeof field.value === 'string') {
        return field.value.trim().length === 0;
      }
      return true;
    });

    const progressPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

    return {
      completed: completedFields,
      missing: missingFields,
      percentage: progressPercentage,
      total: requiredFields.length,
    };
  }, [formData]);

  const isComplete = progressData.percentage === 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          {translationsLoading ? 'Заполненность' : t('studio.form.progress.title')}
        </h3>
        <span className="text-sm font-medium text-gray-600">
          {progressData.percentage}%
        </span>
      </div>

      <Progress 
        value={progressData.percentage} 
        className="w-full h-2"
      />

      <div className="text-sm text-gray-600">
        {isComplete ? (
          <span className="text-green-600 font-medium">
            {translationsLoading ? 'Форма заполнена полностью' : t('studio.form.progress.complete')}
          </span>
        ) : (
          <span>
            {translationsLoading 
              ? `Не хватает полей: ${progressData.missing.map(f => f.label).join(', ')}`
              : t('studio.form.progress.missing', { 
                  fields: progressData.missing.map(f => f.label).join(', ')
                })
            }
          </span>
        )}
      </div>

      {progressData.missing.length > 0 && (
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Не заполнено:</p>
          <ul className="list-disc list-inside space-y-1">
            {progressData.missing.map(field => (
              <li key={field.key}>{field.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
