'use client';

import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { trackFileDrop } from '@/lib/analytics';
import { useTranslations } from '@/lib/useTranslations';
import { 
  Upload, 
  FileImage, 
  AlertCircle, 
  Play, 
  Pause, 
  Square, 
  ImageIcon,
  Settings, 
  Zap, 
  Image, 
  Wand2, 
  CheckCircle, 
  RotateCcw, 
  Info, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function PhotoEditorStep() {
  const { t } = useTranslations();
  const { 
    files, 
    addFile, 
    removeFile, 
    clearFiles, 
    settings, 
    updateSettings,
    setCurrentStep 
  } = useAppStore();
  const { 
    processingState, 
    isProcessing, 
    processAllFiles, 
    pauseProcessing, 
    resumeProcessing, 
    cancelAllProcessing,
    getProgress, 
    getCurrentFileName,
  } = useImageProcessing();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleFiles = useCallback((fileList: FileList) => {
    const validateFile = (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t('studio.file_drop.file_validation.unsupported_format');
      }
      return null;
    };

    const newFiles: File[] = Array.from(fileList);
    
    // File limit validation removed

    let addedCount = 0;
    let errorCount = 0;

    newFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        errorCount++;
        return;
      }

      const url = URL.createObjectURL(file);
      const fileItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending' as const,
        originalFile: file,
        originalUrl: url,
      };

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

  const getStatusIcon = (status: string) => {
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

  const handleRemoveBgChange = (checked: boolean) => {
    updateSettings({ removeBg: checked });
  };

  const completedFiles = files.filter(file => file.status === 'completed' && file.processedUrl);
  
  // Определяем, есть ли файлы в процессе обработки
  const hasProcessingFiles = files.some(file => file.status === 'processing');
  const hasPendingFiles = files.some(file => file.status === 'pending');
  
  // Блокируем навигацию, если есть файлы в обработке или ожидании
  const isNavigationDisabled = hasProcessingFiles || (hasPendingFiles && files.length > 0);
  
  const canProceed = true; // Этап опциональный - всегда можно продолжить

  const handleNext = () => {
    setCurrentStep('export');
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            <span>Обработка изображений (опционально)</span>
            {files.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {files.length} файлов
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
                {isDragOver ? 'Отпустите файлы здесь' : 'Загрузите изображения товара'}
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
            </div>
          </div>
        </div>

        {/* Background Removal Setting */}
        {files.length > 0 && (
          <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
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
        )}

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

        {/* Processing Controls */}
        {files.length > 0 && (
          <div className="space-y-3">
            {/* Start Processing Button */}
            {!isProcessing && (
              <Button
                onClick={processAllFiles}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 py-2.5"
                disabled={files.every(f => f.status === 'completed')}
              >
                <Play className="w-4 h-4 mr-2" />
                <span className="font-semibold">Обработать изображения</span>
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
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('product-info')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к информации
          </Button>
          
          <div className="flex gap-3">
            <Button
              onClick={handleNext}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isNavigationDisabled}
            >
              Пропустить фото
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            {files.length > 0 && (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
                disabled={isNavigationDisabled}
              >
                Продолжить к экспорту
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        {files.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>Этап опциональный - можете пропустить и перейти к экспорту без изображений</span>
          </div>
        )}

        {/* Processing Info */}
        {isNavigationDisabled && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {hasProcessingFiles 
                ? 'Дождитесь завершения обработки изображений перед переходом к следующему шагу'
                : 'Загружены файлы, но обработка не начата. Нажмите "Обработать изображения" или удалите файлы для продолжения'
              }
            </span>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-6">
            <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <h3 className="text-sm font-medium text-gray-500 mb-1">Нет загруженных файлов</h3>
            <p className="text-xs text-gray-400">Загрузите изображения для обработки</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
