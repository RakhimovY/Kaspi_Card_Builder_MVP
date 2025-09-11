'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ErrorState } from '@/components/ui/error-state';
import { Settings, Download, CheckCircle, AlertCircle, Package, FileText, ArrowLeft, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { exportToZip, downloadFile, generateSKU } from '@/lib/exportUtils';
import { useTranslations } from '@/lib/useTranslations';
import { trackExportZip, trackExportCsvReady } from '@/lib/analytics';
import FormProgress from './FormProgress';
import KaspiBrand from './KaspiBrand';

import { toast } from 'sonner';

export default function ExportPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const { files, formData, setCurrentStep, resetStudio } = useAppStore();
  const { t } = useTranslations();

  const completedFiles = files.filter(file => file.status === 'completed' && file.processedUrl);
  const hasFiles = completedFiles.length > 0;
  const hasFormData = formData.brand && formData.type && formData.model && formData.price && formData.quantity;

  const handleExport = async () => {
    if (!hasFormData) {
      const errorMsg = 'Заполните информацию о товаре для экспорта';
      setExportError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    setExportSuccess(false);

    try {
      toast.loading(t('studio.export.preparing'), { id: 'export' });
      
      const zipBlob = await exportToZip(files, formData, (progress) => {
        setExportProgress(progress * 100);
        toast.loading(t('studio.export.progress', { progress: Math.round(progress * 100) }), { id: 'export' });
      });

      const sku = generateSKU(formData);
              const filename = `trade-export-${sku}-${new Date().toISOString().split('T')[0]}.zip`;
      
      downloadFile(zipBlob, filename);
      setExportSuccess(true);
      
      toast.success(t('studio.export.completed', { filename }), { id: 'export' });
      
      // Отправляем аналитику
      trackExportZip(completedFiles.length);
      trackExportCsvReady((formData.variants || []).length > 0, (formData.attributes || []).length > 0);
      
      // Сбрасываем успех через 3 секунды
      setTimeout(() => setExportSuccess(false), 3000);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('studio.export.error');
      setExportError(errorMsg);
      toast.error(errorMsg, { id: 'export' });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getButtonText = () => {
    if (isExporting) return t('studio.export.exporting');
    if (exportSuccess) return t('studio.export.downloaded');
    return t('studio.export.download_zip');
  };

  const getButtonIcon = () => {
    if (isExporting) return <Settings className="w-4 h-4 animate-spin" />;
    if (exportSuccess) return <CheckCircle className="w-4 h-4" />;
    return <Download className="w-4 h-4" />;
  };

  const isButtonDisabled = isExporting || !hasFormData;

  const handleReset = () => {
    if (confirm('Сбросить все данные и начать заново?')) {
      resetStudio();
      toast.success('Данные сброшены');
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-red-600" />
            {t('studio.export.title')}
            <KaspiBrand variant="badge" className="ml-2" />
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Начать заново
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Progress */}
        <FormProgress />

        {/* Status Display */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">
              {hasFiles ? `${completedFiles.length} изображений готово` : 'Изображения не загружены (опционально)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">
              {hasFormData ? 'Информация о товаре готова' : 'Информация о товаре неполная'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('studio.export.processing')}</span>
              <span>{exportProgress.toFixed(0)}%</span>
            </div>
            <Progress value={exportProgress} />
          </div>
        )}

        {/* Error Display */}
        {exportError && (
          <ErrorState
            title={t('studio.export.error_title')}
            description={exportError}
            onRetry={() => {
              setExportError(null);
              handleExport();
            }}
          />
        )}

        {/* Success Display */}
        {exportSuccess && (
          <KaspiBrand variant="accent" className="bg-green-50 rounded-lg py-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-green-800 font-medium">{t('studio.export.success')}</p>
              <p className="text-sm text-gray-600 mt-1">Готово для загрузки на маркетплейс</p>
            </div>
          </KaspiBrand>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('photo-editor')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {hasFiles ? 'Назад к фото' : 'Добавить фото'}
          </Button>
          
          <Button
            onClick={handleExport}
            disabled={isButtonDisabled}
            className={`${
              isExporting
                ? 'bg-blue-600 cursor-not-allowed'
                : exportSuccess
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            } text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2`}
          >
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </Button>
        </div>

        {/* Requirements Info */}
        {!hasFormData && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>Заполните информацию о товаре для экспорта</span>
          </div>
        )}

        {/* Success Message */}
        {exportSuccess && (
          <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-green-800 font-medium">Экспорт завершен успешно!</p>
            <p className="text-green-700 text-sm mt-1">Файл загружен в папку загрузок</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
