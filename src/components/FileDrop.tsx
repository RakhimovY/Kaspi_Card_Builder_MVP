'use client';

import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useAppStore } from '@/lib/store';
import { FileItem } from '@/lib/store';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { trackFileDrop } from '@/lib/analytics';
import { X, Upload, FileImage, AlertCircle, Play, Pause, Square, Download, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILES = 50;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function FileDrop() {
  const { files, addFile, removeFile, clearFiles } = useAppStore();
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

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Неподдерживаемый формат файла';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Файл слишком большой (максимум 25MB)';
    }
    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: File[] = Array.from(fileList);
    
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`Максимум ${MAX_FILES} файлов`);
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
        originalFile: file, // Store the actual File object
      };

      // Create URL for preview
      const url = URL.createObjectURL(file);
      fileItem.originalUrl = url;

      addFile(fileItem);
      addedCount++;
    });

    if (addedCount > 0) {
      toast.success(`Добавлено ${addedCount} файлов`);
      // Отправляем аналитику
      trackFileDrop(addedCount);
    }
    if (errorCount > 0) {
      toast.error(`Ошибок: ${errorCount}`);
    }
  }, [files.length, addFile]);

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

  const exportCompletedFiles = useCallback(async () => {
    const completedFiles = getCompletedFiles();
    if (completedFiles.length === 0) return;

    try {
      // Создаем ZIP архив
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Добавляем обработанные изображения
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

      // Добавляем README файл
      const readmeContent = `# Экспорт изображений Kaspi Card Builder

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

Сгенерировано Kaspi Card Builder
`;

      zip.file('README.md', readmeContent);

      // Генерируем и скачиваем ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kaspi-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Ошибка при экспорте файлов. Попробуйте еще раз.');
    }
  }, [getCompletedFiles]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg compact-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Файлы ({files.length}/{MAX_FILES})</span>
          </div>
          {files.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Очистить все файлы?')) {
                  clearFiles();
                }
              }}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              Очистить
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/80 backdrop-blur-sm scale-105'
              : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <p className="text-gray-700 font-medium mb-2">
            {isDragOver ? 'Отпустите файлы здесь' : 'Перетащите фотографии сюда'}
          </p>
          <p className="text-sm text-gray-500 mb-4">или нажмите для выбора файлов</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-input')?.click()}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
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
          <p className="text-xs text-gray-400 mt-2">
            JPEG, PNG, WebP • Максимум 25MB • До {MAX_FILES} файлов
          </p>
        </div>

        {/* File List */}
        {files.length > 0 ? (
          <div className="space-y-2 max-h-48 lg:max-h-64 overflow-y-auto component-scrollbar">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-50/80 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-600">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ImageIcon}
            title="Нет загруженных файлов"
            description="Перетащите изображения в область выше или нажмите кнопку выбора файлов"
          />
        )}

        {/* Control Buttons */}
        {files.length > 0 && (
          <div className="space-y-2">
            {/* Start Processing Button */}
            {!isProcessing && (
              <Button
                onClick={processAllFiles}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={files.every(f => f.status === 'completed')}
              >
                <Play className="w-4 h-4 mr-2" />
                Обработать все файлы
              </Button>
            )}

            {/* Processing Controls */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {processingState.isPaused ? (
                    <Button
                      onClick={resumeProcessing}
                      variant="outline"
                      className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 active:scale-95 transition-transform"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Продолжить
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseProcessing}
                      variant="outline"
                      className="flex-1 border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-300 active:scale-95 transition-transform"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Пауза
                    </Button>
                  )}
                  <Button
                    onClick={cancelAllProcessing}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:scale-95 transition-transform"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Обработка файлов...</span>
                    <span>{getProgress().toFixed(0)}%</span>
                  </div>
                  <Progress value={getProgress()} />
                  {getCurrentFileName() && (
                    <p className="text-xs text-gray-500 truncate">
                      Обрабатывается: {getCurrentFileName()}
                    </p>
                  )}
                  
                  {/* Processing Stats */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>В очереди:</span>
                      <span>{processingState.queueLen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Обрабатывается:</span>
                      <span>{processingState.inFlight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Готово:</span>
                      <span>{processingState.doneCount}</span>
                    </div>
                    <div className="flex justify-center mt-2">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        ✨ Кнопки управления активны
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Completed Files */}
            {getCompletedFiles().length > 0 && (
              <Button
                onClick={exportCompletedFiles}
                variant="outline"
                className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Экспорт готовых ({getCompletedFiles().length})
              </Button>
            )}
          </div>
        )}


      </CardContent>
    </Card>
  );
}
