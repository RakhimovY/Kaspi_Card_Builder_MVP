'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Settings, Download, CheckCircle, AlertCircle, Package, FileText } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { exportToZip, downloadFile, generateSKU } from '@/lib/exportUtils';
import { useTranslations } from '@/lib/useTranslations';
import { trackExportZip } from '@/lib/analytics';

import { toast } from 'sonner';

export default function ExportPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const { files, formData } = useAppStore();
  const t = useTranslations();

  const completedFiles = files.filter(file => file.status === 'completed' && file.processedUrl);
  const hasFiles = completedFiles.length > 0;
  const hasFormData = formData.brand && formData.type && formData.model;

  const handleExport = async () => {
    if (!hasFiles || !hasFormData) {
      const errorMsg = 'Недостаточно данных для экспорта. Проверьте загруженные файлы и заполните форму.';
      setExportError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    setExportSuccess(false);

    try {
      toast.loading('Подготовка экспорта...', { id: 'export' });
      
      const zipBlob = await exportToZip(files, formData, (progress) => {
        setExportProgress(progress * 100);
        toast.loading(`Экспорт: ${Math.round(progress * 100)}%`, { id: 'export' });
      });

      const sku = generateSKU(formData);
      const filename = `kaspi-export-${sku}-${new Date().toISOString().split('T')[0]}.zip`;
      
      downloadFile(zipBlob, filename);
      setExportSuccess(true);
      
      toast.success(`Экспорт завершен! Скачан файл: ${filename}`, { id: 'export' });
      
      // Отправляем аналитику
      trackExportZip(completedFiles.length);
      
      // Сбрасываем успех через 3 секунды
      setTimeout(() => setExportSuccess(false), 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Произошла ошибка при экспорте';
      setExportError(errorMsg);
      toast.error(errorMsg, { id: 'export' });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };



  const getButtonText = () => {
    if (isExporting) return 'Экспорт...';
    if (exportSuccess) return 'Скачано!';
    return 'Скачать ZIP';
  };

  const getButtonIcon = () => {
    if (isExporting) return <Settings className="w-4 h-4 animate-spin" />;
    if (exportSuccess) return <CheckCircle className="w-4 h-4" />;
    return <Download className="w-4 h-4" />;
  };

  const isButtonDisabled = isExporting || !hasFiles || !hasFormData;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl compact-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Экспорт
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статус готовности */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {hasFiles ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span className={hasFiles ? 'text-green-700' : 'text-amber-700'}>
              Изображения: {completedFiles.length} готово
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {hasFormData ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span className={hasFormData ? 'text-green-700' : 'text-amber-700'}>
              Данные товара: {hasFormData ? 'заполнены' : 'не заполнены'}
            </span>
          </div>
        </div>

        {/* Прогресс экспорта */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Создание архива...</span>
              <span>{Math.round(exportProgress)}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}

        {/* Ошибка */}
        {exportError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{exportError}</span>
            </div>
          </div>
        )}

        {/* Успех */}
        {exportSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Архив успешно скачан!</span>
            </div>
          </div>
        )}

        {/* Кнопка экспорта */}
        <Button 
          size="lg" 
          onClick={handleExport}
          disabled={isButtonDisabled}
          className={`w-full transition-all duration-300 ${
            exportSuccess 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
          } ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>

        {/* Информация о содержимом архива или пустое состояние */}
        {hasFiles && hasFormData ? (
          <div className="text-xs text-gray-600 space-y-1">
            <p>Архив будет содержать:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Папку images/ с {completedFiles.length} изображениями</li>
              <li>Файл export.csv для импорта в Kaspi</li>
              <li>README.md с инструкциями</li>
            </ul>

          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Готово к экспорту"
            description={
              !hasFiles && !hasFormData 
                ? "Загрузите изображения и заполните форму товара для экспорта"
                : !hasFiles 
                ? "Обработайте изображения для экспорта"
                : "Заполните форму товара для экспорта"
            }
            className="py-4"
          />
        )}
      </CardContent>
    </Card>
  );
}
