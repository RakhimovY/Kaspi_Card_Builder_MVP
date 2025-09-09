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
import { trackExportZip, trackExportCsvReady } from '@/lib/analytics';
import FormProgress from './FormProgress';

import { toast } from 'sonner';

export default function ExportPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const { files, formData } = useAppStore();
  const { t } = useTranslations();

  const completedFiles = files.filter(file => file.status === 'completed' && file.processedUrl);
  const hasFiles = completedFiles.length > 0;
  const hasFormData = formData.brand && formData.type && formData.model;

  const handleExport = async () => {
    if (!hasFiles || !hasFormData) {
      const errorMsg = t('studio.export.insufficient_data');
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
      console.error('Export error:', error);
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

  const isButtonDisabled = isExporting || !hasFiles || !hasFormData;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl compact-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          {t('studio.export.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Progress */}
        <FormProgress />

        {/* Status Display */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">
              {t('studio.export.files_count', { count: completedFiles.length })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">
              {hasFormData ? t('studio.export.form_complete') : t('studio.export.form_incomplete')}
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
          <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-green-800 font-medium">{t('studio.export.success')}</p>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isButtonDisabled}
          className={`w-full ${
            isExporting
              ? 'bg-blue-600 cursor-not-allowed'
              : exportSuccess
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          } text-white shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          {getButtonIcon()}
          <span className="ml-2">{getButtonText()}</span>
        </Button>

        {/* Requirements Info */}
        {!hasFiles && (
          <div className="text-center py-4 text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">{t('studio.export.no_files')}</p>
          </div>
        )}

        {!hasFormData && (
          <div className="text-center py-4 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">{t('studio.export.incomplete_form')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
