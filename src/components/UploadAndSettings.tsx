'use client';

import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';
import { FileItem } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { trackFileDrop } from '@/lib/analytics';
import { useTranslations } from '@/lib/useTranslations';
import { 
  X, Upload, FileImage, AlertCircle, Play, Pause, Square, Download, ImageIcon,
  Settings, Zap, Image, Wand2, CheckCircle, RotateCcw, Info, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILES = 50;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function UploadAndSettings() {
  const { files, addFile, removeFile, clearFiles, settings, updateSettings } = useAppStore();
  const { t } = useTranslations();
  const { 
    processingState, 
    isProcessing, 
    processAllFiles, 
    pauseProcessing, 
    resumeProcessing, 
    cancelAllProcessing,
    getProgress, 
    getCurrentFileName,
    getCompletedFiles 
  } = useImageProcessing();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const validateFile = (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t('studio.file_drop.file_validation.unsupported_format');
      }
      if (file.size > MAX_FILE_SIZE) {
        return t('studio.file_drop.file_validation.file_too_large');
      }
      return null;
    };

    const newFiles: File[] = Array.from(fileList);
    
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(t('studio.file_drop.file_validation.max_files_exceeded', { max: MAX_FILES }));
      return;
    }

    let addedCount = 0;
    let errorCount = 0;

    newFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        errorCount++;
        return;
      }

      const fileItem: FileItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        originalFile: file,
      };

      const url = URL.createObjectURL(file);
      fileItem.originalUrl = url;

      addFile(fileItem);
      addedCount++;
    });

    if (addedCount > 0) {
      toast.success(t('studio.file_drop.toast.files_added', { count: addedCount }));
      trackFileDrop(addedCount);
    }
    if (errorCount > 0) {
      toast.error(t('studio.file_drop.toast.errors_count', { count: errorCount }));
    }
  }, [files.length, addFile, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragCounter(0);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    e.target.value = '';
  }, [handleFiles]);

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'pending':
        return <FileImage className="w-4 h-4 text-gray-400" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <div className="w-4 h-4 bg-green-500 rounded-full" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Settings handlers
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

  const exportCompletedFiles = useCallback(async () => {
    const completedFiles = getCompletedFiles();
    if (completedFiles.length === 0) return;

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        for (let i = 0; i < completedFiles.length; i++) {
          const file = completedFiles[i];
          if (file.processedUrl) {
            try {
              const response = await fetch(file.processedUrl);
              const blob = await response.blob();
              const fileName = `image_${i + 1}.${file.processedUrl.includes('webp') ? 'webp' : 'jpg'}`;
              imagesFolder.file(fileName, blob);
            } catch (error) {
              console.error(`Failed to add ${file.name} to ZIP:`, error);
            }
          }
        }
      }

      const readmeContent = `# Экспорт изображений Trade Card Builder

Дата экспорта: ${new Date().toLocaleString('ru-RU')}
Количество файлов: ${completedFiles.length}

## Инструкция по загрузке в Kaspi

1. Распакуйте архив
2. Загрузите изображения из папки 'images' в ваш товар на Kaspi
3. Убедитесь, что все изображения соответствуют требованиям Kaspi

## Ограничения Kaspi

- Максимальный размер файла: 10MB
- Поддерживаемые форматы: JPEG, PNG, WebP
- Рекомендуемый размер: 1000x1000px или больше
- Минимальный размер: 500x500px

        Сгенерировано Trade Card Builder
`;

      zip.file('README.md', readmeContent);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('studio.file_drop.toast.export_error'));
    }
  }, [getCompletedFiles, t]);

  const isDangerousSettingDisabled = isProcessing;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Загрузка и настройки</span>
            {files.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {files.length} из {MAX_FILES}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <Badge variant="secondary" className="text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
                Обработка
              </Badge>
            )}
            {files.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Удалить все загруженные файлы?')) {
                    clearFiles();
                  }
                }}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <X className="w-4 h-4 mr-1" />
                Очистить
              </Button>
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
        {/* Upload Section */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-lg'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-3">
            <div className="relative">
              <Upload className={`w-12 h-12 mx-auto transition-colors ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
              {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className={`text-base font-semibold transition-colors ${
                isDragOver ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {isDragOver ? 'Отпустите файлы здесь' : 'Перетащите изображения сюда'}
              </h3>
              <p className="text-sm text-gray-500">
                или нажмите кнопку для выбора файлов
              </p>
            </div>
            
            <Button
              variant="outline"
              size="default"
              onClick={() => document.getElementById('file-input')?.click()}
              className={`transition-all ${
                isDragOver 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Выбрать файлы
            </Button>
            
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="text-xs text-gray-400 flex justify-center gap-4">
              <span>JPEG, PNG, WebP</span>
              <span>•</span>
              <span>до 25MB</span>
              <span>•</span>
              <span>макс. {MAX_FILES}</span>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Загруженные файлы</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto component-scrollbar">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    file.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : file.status === 'processing'
                      ? 'bg-blue-50 border-blue-200'
                      : file.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  } hover:shadow-md`}
                >
                  <div className="relative flex-shrink-0">
                    {file.originalUrl ? (
                      <img
                        src={file.originalUrl}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded border flex items-center justify-center">
                        <FileImage className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1">
                      {getStatusIcon(file.status)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium truncate text-gray-800" title={file.name}>
                        {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                      </p>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-xs text-gray-600">
                        {formatFileSize(file.size)}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-600 capitalize">
                        {file.status === 'completed' ? 'Готово' :
                         file.status === 'processing' ? 'Обработка' :
                         file.status === 'error' ? 'Ошибка' : 'Ожидание'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {files.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Настройки обработки
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

            {/* Advanced Settings */}
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

            {/* Processing Info */}
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
          </div>
        )}

        {/* Control Buttons */}
        {files.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {/* Start Processing Button */}
            {!isProcessing && (
              <Button
                onClick={processAllFiles}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 py-2.5"
                disabled={files.every(f => f.status === 'completed')}
              >
                <Play className="w-4 h-4 mr-2" />
                <span className="font-semibold">Начать обработку</span>
                <span className="ml-2 text-sm opacity-90">
                  ({files.filter(f => f.status === 'pending').length} файлов)
                </span>
              </Button>
            )}

            {/* Processing Controls */}
            {isProcessing && (
              <div className="space-y-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-900">Обработка изображений</h3>
                  <div className="flex items-center gap-2">
                    {processingState.isPaused ? (
                      <Badge variant="secondary" className="text-xs">
                        <Pause className="w-3 h-3 mr-1" />
                        Приостановлено
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs bg-blue-600">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                        Активно
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">Прогресс</span>
                    <span className="text-sm font-bold text-blue-900">{getProgress().toFixed(0)}%</span>
                  </div>
                  <Progress value={getProgress()} className="h-2" />
                  
                  {getCurrentFileName() && (
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="truncate">Обрабатывается: {getCurrentFileName()}</span>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2">
                  {processingState.isPaused ? (
                    <Button
                      onClick={resumeProcessing}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Продолжить
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseProcessing}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-300"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Приостановить
                    </Button>
                  )}
                  <Button
                    onClick={cancelAllProcessing}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Отменить
                  </Button>
                </div>
                
                {/* Processing Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="font-semibold text-blue-900">{processingState.queueLen}</div>
                    <div className="text-blue-700">В очереди</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="font-semibold text-blue-900">{processingState.inFlight}</div>
                    <div className="text-blue-700">Обрабатывается</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="font-semibold text-green-600">{processingState.doneCount}</div>
                    <div className="text-green-700">Готово</div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Completed Files */}
            {getCompletedFiles().length > 0 && (
              <Button
                onClick={exportCompletedFiles}
                variant="outline"
                className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 py-2.5"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="font-semibold">Скачать готовые файлы</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  {getCompletedFiles().length}
                </Badge>
              </Button>
            )}
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-6">
            <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <h3 className="text-sm font-medium text-gray-500 mb-1">Нет загруженных файлов</h3>
            <p className="text-xs text-gray-400">Загрузите изображения для начала работы</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

