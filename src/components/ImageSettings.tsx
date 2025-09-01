'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { Settings, Image, Zap } from 'lucide-react';

export default function ImageSettings() {
  const { settings, updateSettings } = useAppStore();
  const { processingState } = useImageProcessing();
  
  // Блокируем только "опасные" настройки во время обработки
  const isProcessing = processingState.inFlight > 0;
  const isDangerousSettingDisabled = isProcessing;

  const handleMaxEdgeChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 500 && numValue <= 5000) {
      updateSettings({ maxEdgePx: numValue });
    }
  };

  const handleQualityChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 1.0) {
      updateSettings({ quality: numValue });
    }
  };

  const handleFormatChange = (format: 'jpeg' | 'webp') => {
    updateSettings({ format });
  };

  const handleRemoveBgChange = (checked: boolean) => {
    updateSettings({ removeBg: checked });
  };

  return (
    <Card 
      className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg"
      aria-busy={isProcessing}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Настройки обработки
          {isProcessing && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Обработка...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Max Edge Size */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Image className="w-4 h-4 text-blue-600" />
            Максимальный размер (px)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-lg p-2">
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={settings.maxEdgePx}
                onChange={(e) => handleMaxEdgeChange(e.target.value)}
                className="w-full h-2"
                disabled={isDangerousSettingDisabled}
                aria-label="Максимальный размер изображения"
              />
            </div>
            <input
              type="number"
              min="500"
              max="5000"
              value={settings.maxEdgePx}
              onChange={(e) => handleMaxEdgeChange(e.target.value)}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDangerousSettingDisabled}
              aria-label="Максимальный размер изображения в пикселях"
            />
          </div>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Zap className="w-4 h-4 text-blue-600" />
            Качество сжатия
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-lg p-2">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.quality}
                onChange={(e) => handleQualityChange(e.target.value)}
                className="w-full h-2"
              />
            </div>
            <span className="w-14 text-sm font-medium text-center bg-blue-50 px-2 py-1 rounded">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Формат файла</label>
          <div className="flex gap-2">
            <Button
              variant={settings.format === 'jpeg' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFormatChange('jpeg')}
              disabled={isDangerousSettingDisabled}
              className={`flex-1 ${
                settings.format === 'jpeg' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              JPEG
            </Button>
            <Button
              variant={settings.format === 'webp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFormatChange('webp')}
              disabled={isDangerousSettingDisabled}
              className={`flex-1 ${
                settings.format === 'webp' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              WebP
            </Button>
          </div>
        </div>

        {/* Background Removal */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
            <Checkbox
              id="remove-bg"
              checked={settings.removeBg}
              onCheckedChange={handleRemoveBgChange}
            />
            <div>
              <label
                htmlFor="remove-bg"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Удалить фон
              </label>
              <p className="text-xs text-gray-500">
                Автоматическое удаление фона
              </p>
            </div>
          </div>
        </div>

        {/* Processing Info - Compact */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-1">
              <span>Мин: 500px</span>
              <span>Макс: 5000px</span>
              <span>Файл: ≤25MB</span>
              <span>Форматы: JPEG/PNG/WebP</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
