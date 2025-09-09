'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { useTranslations } from '@/lib/useTranslations';
import { 
  Settings, 
  Image, 
  Zap, 
  Wand2, 
  Info,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ImageSettings() {
  const { settings, updateSettings } = useAppStore();
  const { processingState } = useImageProcessing();
  const { t } = useTranslations();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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

  const resetToDefaults = () => {
    updateSettings({
      maxEdgePx: 2000,
      quality: 0.82,
      format: 'webp',
      removeBg: false
    });
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 0.9) return 'Высокое';
    if (quality >= 0.7) return 'Среднее';
    if (quality >= 0.5) return 'Низкое';
    return 'Очень низкое';
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 0.9) return 'text-green-600 bg-green-50';
    if (quality >= 0.7) return 'text-blue-600 bg-blue-50';
    if (quality >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card 
      className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
      aria-busy={isProcessing}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-blue-600" />
            {t('studio.image_settings.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <Badge variant="secondary" className="text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
                Обработка
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Сброс
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Compact Quick Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Быстрые настройки
          </h3>
          
          {/* Quality & Format Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quality Preset */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Image className="w-4 h-4 text-blue-600" />
                Качество
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: 0.6, label: 'Быстро', desc: '60%' },
                  { value: 0.82, label: 'Сбалансированно', desc: '82%' },
                  { value: 0.95, label: 'Высокое', desc: '95%' }
                ].map((preset) => (
                  <Button
                    key={preset.value}
                    variant={Math.abs(settings.quality - preset.value) < 0.01 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQualityChange(preset.value.toString())}
                    className={`text-xs h-8 ${
                      Math.abs(settings.quality - preset.value) < 0.01
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium text-xs">{preset.label}</div>
                      <div className="text-xs opacity-75">{preset.desc}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Формат</label>
              <div className="flex gap-1">
                <Button
                  variant={settings.format === 'webp' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFormatChange('webp')}
                  disabled={isDangerousSettingDisabled}
                  className={`flex-1 h-8 ${
                    settings.format === 'webp' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-center">
                    <div className="font-medium text-xs">WebP</div>
                    <div className="text-xs opacity-75">Современный</div>
                  </div>
                </Button>
                <Button
                  variant={settings.format === 'jpeg' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFormatChange('jpeg')}
                  disabled={isDangerousSettingDisabled}
                  className={`flex-1 h-8 ${
                    settings.format === 'jpeg' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-center">
                    <div className="font-medium text-xs">JPEG</div>
                    <div className="text-xs opacity-75">Универсальный</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Background Removal */}
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <Checkbox
              id="remove-bg"
              checked={settings.removeBg}
              onCheckedChange={handleRemoveBgChange}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="remove-bg"
                className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
                Удалить фон
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Автоматически удаляет фон с изображений для лучшего вида на Kaspi
              </p>
              {settings.removeBg && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Активно
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Compact Advanced Settings */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full text-gray-600 hover:text-gray-800 text-sm"
          >
            <Info className="w-4 h-4 mr-2" />
            {showAdvanced ? 'Скрыть' : 'Показать'} расширенные настройки
          </Button>

          {showAdvanced && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
              {/* Max Edge Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Image className="w-4 h-4 text-blue-600" />
                  Максимальный размер (пиксели)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="500"
                        max="5000"
                        step="100"
                        value={settings.maxEdgePx}
                        onChange={(e) => handleMaxEdgeChange(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        disabled={isDangerousSettingDisabled}
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((settings.maxEdgePx - 500) / (5000 - 500)) * 100}%, #e5e7eb ${((settings.maxEdgePx - 500) / (5000 - 500)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                    <div className="w-16 text-center">
                      <input
                        type="number"
                        min="500"
                        max="5000"
                        value={settings.maxEdgePx}
                        onChange={(e) => handleMaxEdgeChange(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDangerousSettingDisabled}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>500px</span>
                    <span>5000px</span>
                  </div>
                </div>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Точная настройка качества
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.01"
                        value={settings.quality}
                        onChange={(e) => handleQualityChange(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #3b82f6 50%, #10b981 75%, #10b981 100%)`
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium px-2 py-1 rounded ${getQualityColor(settings.quality)}`}>
                        {Math.round(settings.quality * 100)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {getQualityLabel(settings.quality)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Processing Info */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Размер: 500-5000px</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Формат: JPEG/WebP</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Вес: до 25MB</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              <span>Качество: {Math.round(settings.quality * 100)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
