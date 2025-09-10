'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/useTranslations';
import { useAppStore } from '@/lib/store';
import { trackMagicFill } from '@/lib/analytics';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MagicFillButtonProps {
  className?: string;
  onComplete?: () => void;
  disabled?: boolean;
}

export default function MagicFillButton({ className, onComplete, disabled }: MagicFillButtonProps) {
  const { t } = useTranslations();
  const { formData, updateFormData, files } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicFill = async () => {
    if (!formData.gtin) {
      toast.error('Введите GTIN для Magic Fill');
      return;
    }

    setIsLoading(true);

    try {
      const completedFiles = files.filter(file => file.status === 'completed');
      const imageIds = completedFiles.map(file => file.id);

      const requestBody = {
        gtin: formData.gtin,
        imageIds: imageIds.length > 0 ? imageIds : undefined,
        // Для Magic Fill НЕ отправляем ручные данные, чтобы использовать только GTIN
        manual: undefined,
      };

      const response = await fetch('/api/magic-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Magic Fill failed');
      }

      const result = await response.json();

      // Update form with Magic Fill results
      updateFormData({
        sku: result.fields.sku,
        brand: result.fields.brand,
        type: result.fields.type,
        model: result.fields.model,
        keySpec: result.fields.keySpec,
        titleRU: result.fields.titleRU,
        titleKZ: result.fields.titleKZ,
        descRU: result.fields.descRU,
        descKZ: result.fields.descKZ,
        category: result.fields.category,
        gtin: result.fields.gtin,
        // Convert attributes object to array format
        attributes: result.fields.attributes ? 
          Object.entries(result.fields.attributes).map(([key, value]) => ({
            key,
            value: String(value)
          })) : [],
      });

      // Отправляем аналитику
      const fieldsFilled = Object.values(result.fields).filter(value => value && String(value).trim()).length;
      trackMagicFill(!!formData.gtin, imageIds.length > 0, fieldsFilled);

      toast.success('Magic Fill завершен! Форма заполнена автоматически.');
      
      // Вызываем callback если передан
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Magic Fill error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка Magic Fill. Попробуйте еще раз.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const canUseMagicFill = formData.gtin?.trim();

  return (
    <Button
      onClick={handleMagicFill}
      disabled={isLoading || !canUseMagicFill || disabled}
      className={`flex items-center gap-2 ${className}`}
      variant="default"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {isLoading ? 'Заполнение...' : 'Заполнить автоматически'}
    </Button>
  );
}
