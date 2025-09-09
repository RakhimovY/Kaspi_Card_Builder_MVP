'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/lib/useTranslations';
import { useAppStore } from '@/lib/store';
import { Truck } from 'lucide-react';

export default function ProductLogistics() {
  const { t } = useTranslations();
  const { formData, updateFormData } = useAppStore();

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Truck className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('studio.form.logistics.title')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('studio.form.logistics.weight')}
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
            placeholder="0.5"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('studio.form.logistics.dimensions')}
          </label>
          <Input
            value={formData.dimensions || ''}
            onChange={(e) => handleInputChange('dimensions', e.target.value)}
            placeholder="20×15×8"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('studio.form.logistics.warranty')}
          </label>
          <Input
            value={formData.warranty || ''}
            onChange={(e) => handleInputChange('warranty', e.target.value)}
            placeholder="12 месяцев"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('studio.form.logistics.country')}
          </label>
          <Input
            value={formData.country || ''}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="Китай"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('studio.form.logistics.cert')}
          </label>
          <Input
            value={formData.cert || ''}
            onChange={(e) => handleInputChange('cert', e.target.value)}
            placeholder="EAC, ТР ТС"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('studio.form.logistics.power')}
          </label>
          <Input
            value={formData.power || ''}
            onChange={(e) => handleInputChange('power', e.target.value)}
            placeholder="220В, 50-60Гц, 800Вт"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('studio.form.logistics.age')}
          </label>
          <Input
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="3+"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('studio.form.logistics.bundle')}
        </label>
        <Textarea
          value={formData.bundle || ''}
          onChange={(e) => handleInputChange('bundle', e.target.value)}
          placeholder="Кабель, инструкция, гарантийный талон..."
          rows={3}
          className="w-full"
        />
      </div>
    </div>
  );
}
