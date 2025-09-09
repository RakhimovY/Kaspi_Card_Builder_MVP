'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/useTranslations';
import { useImageProcessing } from '@/lib/useImageProcessing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  FileImage, 
  Sparkles, 
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function Preview() {
  const { files, selectedFileId, setSelectedFile } = useAppStore();
  const { t } = useTranslations();
  const { processingState } = useImageProcessing();
  const [zoom, setZoom] = useState(1);
  const [showComparison, setShowComparison] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const selectedFile = selectedFileId 
    ? files.find(f => f.id === selectedFileId) 
    : files.find(f => f.status === 'completed') || files[0];

  // Only show preview if processing has started or there are completed files
  const hasProcessingStarted = processingState.inFlight > 0 || processingState.doneCount > 0 || files.some(f => f.status === 'completed');
  
  if (!hasProcessingStarted) {
    return null;
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileImage className="w-4 h-4 text-gray-400" />;
    }
  };

  const ImageViewer = ({ 
    src, 
    alt, 
    showControls = true, 
    isProcessed = false 
  }: { 
    src?: string; 
    alt: string; 
    showControls?: boolean; 
    isProcessed?: boolean;
  }) => {
    if (!src) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <EmptyState
            icon={isProcessed ? Sparkles : FileImage}
            title={isProcessed ? t('studio.preview.processed_image') : t('studio.preview.original_image')}
            description={isProcessed ? t('studio.preview.processed_image_description') : t('studio.preview.original_image_description')}
          />
        </div>
      );
    }

    return (
      <div className="relative h-64 bg-gray-50 rounded-lg border overflow-hidden group">
        <div
          ref={imageRef}
          className="w-full h-full flex items-center justify-center cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `scale(${zoom}) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
            transition: dragStart ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
        </div>
        
        {showControls && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleResetZoom}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-xs"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDownload(src, alt)}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-6"
    >
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">2. Предварительный просмотр</h2>
        <p className="text-sm text-gray-600">Просмотрите обработанные изображения</p>
      </div>
      
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="w-5 h-5 text-blue-600" />
              {t('studio.preview.title')}
            </CardTitle>
          <div className="flex items-center gap-2">
            {selectedFile?.processedUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs"
              >
                {showComparison ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showComparison ? 'Скрыть' : 'Сравнить'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Compact File Selector */}
        {files.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Выберите изображение:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {files.map((file, index) => (
                <button
                  key={file.id}
                  className={`flex-shrink-0 p-2 rounded-lg border-2 transition-all ${
                    selectedFile?.id === file.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFile(file.id)}
                >
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div className="relative">
                      {file.originalUrl ? (
                        <img
                          src={file.originalUrl}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                          <FileImage className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(file.status)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium truncate max-w-14" title={file.name}>
                        {file.name.length > 10 ? `${file.name.substring(0, 10)}...` : file.name}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-0.5 px-1 py-0">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Display */}
        {selectedFile ? (
          <div className="space-y-3">
            {/* Compact File Info */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedFile.status)}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <Badge 
                variant={selectedFile.status === 'completed' ? 'default' : 
                        selectedFile.status === 'processing' ? 'secondary' : 'destructive'}
                className="capitalize text-xs"
              >
                {selectedFile.status === 'completed' ? 'Готово' :
                 selectedFile.status === 'processing' ? 'Обработка' :
                 selectedFile.status === 'error' ? 'Ошибка' : 'Ожидание'}
              </Badge>
            </div>

            {/* Image Comparison or Single View */}
            {showComparison && selectedFile.processedUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    До обработки
                  </h3>
                  <ImageViewer 
                    src={selectedFile.originalUrl} 
                    alt={`${selectedFile.name} (оригинал)`}
                    isProcessed={false}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    После обработки
                  </h3>
                  <ImageViewer 
                    src={selectedFile.processedUrl} 
                    alt={`${selectedFile.name} (обработано)`}
                    isProcessed={true}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  {selectedFile.processedUrl ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Обработанное изображение
                    </>
                  ) : (
                    <>
                      <FileImage className="w-4 h-4" />
                      Оригинальное изображение
                    </>
                  )}
                </h3>
                <ImageViewer 
                  src={selectedFile.processedUrl || selectedFile.originalUrl} 
                  alt={selectedFile.name}
                />
              </div>
            )}

            {/* Compact Processing State */}
            {selectedFile.status === 'processing' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Обработка изображения...</p>
                    <p className="text-xs text-blue-700">Пожалуйста, подождите</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <EmptyState
              icon={FileImage}
              title="Нет выбранного изображения"
              description="Выберите изображение из списка выше для предварительного просмотра"
            />
          </div>
        )}
      </CardContent>
    </Card>
    </motion.section>
  );
}
