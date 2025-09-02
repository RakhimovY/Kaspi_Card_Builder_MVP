'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/useTranslations';
import { generateTitle, generateDescription, copyToClipboard } from '@/lib/titleDescriptionGenerator';
import { X, Copy, Check, Wand2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function TitleDescriptionGenerator() {
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
      // Имитируем небольшую задержку для UX
      await new Promise(resolve => setTimeout(resolve, 300));
      const title = generateTitle(formData);
      updateFormData({ generatedTitle: title });
      toast.success(t('studio.title_generator.title_generated'));
    } catch (error) {
      toast.error(t('studio.title_generator.title_generation_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      // Имитируем небольшую задержку для UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const description = generateDescription(formData);
      updateFormData({ generatedDescription: description });
      toast.success(t('studio.title_generator.description_generated'));
    } catch (error) {
      toast.error(t('studio.title_generator.description_generation_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTitle = async () => {
    const success = await copyToClipboard(formData.generatedTitle);
    setCopyStates(prev => ({ ...prev, title: success }));
    if (success) {
      toast.success(t('studio.title_generator.title_copied'));
    } else {
      toast.error(t('studio.title_generator.title_copy_failed'));
    }
    setTimeout(() => setCopyStates(prev => ({ ...prev, title: false })), 2000);
  };

  const handleCopyDescription = async () => {
    const success = await copyToClipboard(formData.generatedDescription);
    setCopyStates(prev => ({ ...prev, description: success }));
    if (success) {
      toast.success(t('studio.title_generator.description_copied'));
    } else {
      toast.error(t('studio.title_generator.description_copy_failed'));
    }
    setTimeout(() => setCopyStates(prev => ({ ...prev, description: false })), 2000);
  };

  const canGenerate = formData.type && formData.brand && formData.model;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-green-600" />
          <span>{t('studio.title_generator.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Extra Keywords */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {t('studio.title_generator.extra_keywords')}
          </label>
          
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder={t('studio.title_generator.keyword_placeholder')}
              className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <Button
              onClick={handleAddKeyword}
              disabled={!newKeyword.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {t('studio.title_generator.add_keyword')}
            </Button>
          </div>

          {formData?.extraKeywords?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.extraKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(index)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                    aria-label={t('studio.title_generator.remove_keyword_aria')}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateTitle}
            disabled={!canGenerate || isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? t('studio.title_generator.generating') : t('studio.title_generator.generate_title')}
          </Button>
          <Button
            onClick={handleGenerateDescription}
            disabled={!canGenerate || isGenerating}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? t('studio.title_generator.generating') : t('studio.title_generator.generate_description')}
          </Button>
        </div>

        {/* Generated Title */}
        {formData.generatedTitle && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('studio.title_generator.generated_title')}
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.generatedTitle}
                readOnly
                className="flex-1 bg-gray-50 border-gray-300"
              />
              <Button
                onClick={handleCopyTitle}
                variant="outline"
                size="sm"
                className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
              >
                {copyStates.title ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Generated Description */}
        {formData.generatedDescription && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('studio.title_generator.generated_description')}
            </label>
            <div className="space-y-2">
              <Textarea
                value={formData.generatedDescription}
                readOnly
                rows={8}
                className="w-full bg-gray-50 border-gray-300 resize-none"
              />
              <Button
                onClick={handleCopyDescription}
                variant="outline"
                size="sm"
                className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
              >
                {copyStates.description ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    {t('studio.title_generator.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('studio.title_generator.copy_to_clipboard')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {(formData.generatedTitle || formData.generatedDescription) && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('studio.title_generator.preview')}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              {formData.generatedTitle && (
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {formData.generatedTitle}
                  </h3>
                </div>
              )}
              {formData.generatedDescription && (
                <div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {formData.generatedDescription}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        {!canGenerate && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            {t('studio.title_generator.fill_required_fields')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

