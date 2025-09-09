'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/useTranslations';
import { generateTitle, generateDescription, copyToClipboard } from '@/lib/titleDescriptionGenerator';
import { X, Copy, Check, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TitleDescriptionGeneratorInline() {
  const { formData, updateFormData } = useAppStore();
  const { t } = useTranslations();
  const [newKeyword, setNewKeyword] = useState('');
  const [copyStates, setCopyStates] = useState<{ title: boolean; description: boolean }>({
    title: false,
    description: false
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData?.extraKeywords?.includes(newKeyword.trim())) {
      updateFormData({
        extraKeywords: [...formData.extraKeywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const newKeywords = formData.extraKeywords.filter((_, i) => i !== index);
    updateFormData({ extraKeywords: newKeywords });
  };

  const handleGenerateTitle = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const title = generateTitle(formData);
      updateFormData({ generatedTitle: title });
      toast.success('Заголовок сгенерирован!');
    } catch (error) {
      toast.error('Ошибка генерации заголовка');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const description = generateDescription(formData);
      updateFormData({ generatedDescription: description });
      toast.success('Описание сгенерировано!');
    } catch (error) {
      toast.error('Ошибка генерации описания');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTitle = async () => {
    const success = await copyToClipboard(formData.generatedTitle);
    setCopyStates(prev => ({ ...prev, title: success }));
    if (success) {
      toast.success('Заголовок скопирован!');
    } else {
      toast.error('Ошибка копирования');
    }
    setTimeout(() => setCopyStates(prev => ({ ...prev, title: false })), 2000);
  };

  const handleCopyDescription = async () => {
    const success = await copyToClipboard(formData.generatedDescription);
    setCopyStates(prev => ({ ...prev, description: success }));
    if (success) {
      toast.success('Описание скопировано!');
    } else {
      toast.error('Ошибка копирования');
    }
    setTimeout(() => setCopyStates(prev => ({ ...prev, description: false })), 2000);
  };

  const canGenerate = formData.type && formData.brand && formData.model;

  return (
    <div className="space-y-4">
      {/* Extra Keywords */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Дополнительные ключевые слова
        </label>
        
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Добавить ключевое слово"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddKeyword();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
            size="sm"
            variant="outline"
          >
            Добавить
          </Button>
        </div>

        {formData.extraKeywords && formData.extraKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.extraKeywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => handleRemoveKeyword(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerateTitle}
          disabled={!canGenerate || isGenerating}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {isGenerating ? 'Генерирую...' : 'Генерировать заголовок'}
        </Button>
        <Button
          onClick={handleGenerateDescription}
          disabled={!canGenerate || isGenerating}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {isGenerating ? 'Генерирую...' : 'Генерировать описание'}
        </Button>
      </div>

      {/* Generated Results */}
      {(formData.generatedTitle || formData.generatedDescription) && (
        <div className="space-y-4">
          {formData.generatedTitle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Сгенерированный заголовок</label>
                <Button
                  onClick={handleCopyTitle}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {copyStates.title ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <Textarea
                value={formData.generatedTitle}
                readOnly
                rows={2}
                className="bg-green-50 border-green-200"
              />
            </div>
          )}

          {formData.generatedDescription && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Сгенерированное описание</label>
                <Button
                  onClick={handleCopyDescription}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {copyStates.description ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <Textarea
                value={formData.generatedDescription}
                readOnly
                rows={4}
                className="bg-blue-50 border-blue-200"
              />
            </div>
          )}
        </div>
      )}

      {!canGenerate && (
        <div className="text-sm text-gray-500 text-center py-2">
          Заполните бренд, тип и модель для генерации
        </div>
      )}
    </div>
  );
}
