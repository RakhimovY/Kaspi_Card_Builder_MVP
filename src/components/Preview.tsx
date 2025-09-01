'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppStore } from '@/lib/store';

import { Image, ZoomIn, Download, FileImage, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Preview() {
  const { files, selectedFileId, setSelectedFile } = useAppStore();
  const selectedFile = selectedFileId 
    ? files.find(f => f.id === selectedFileId) 
    : files.find(f => f.status === 'completed') || files[0];



  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg compact-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5 text-blue-600" />
          Предпросмотр
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
                        <Tabs defaultValue="before" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 bg-blue-50/50">
                    <TabsTrigger value="before" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">До обработки</TabsTrigger>
                    <TabsTrigger value="after" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">После обработки</TabsTrigger>
                  </TabsList>
          
          <div className="flex-1 mt-4">
            <TabsContent value="before" className="h-full">
              {selectedFile?.originalUrl ? (
                <div className="relative h-full">
                  <img
                    src={selectedFile.originalUrl}
                    alt={selectedFile.name}
                    className="w-full h-full object-contain rounded-lg border"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        // Zoom functionality
                      }}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(selectedFile.originalUrl!, selectedFile.name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : selectedFile?.status === 'processing' ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Skeleton className="w-32 h-32 mx-auto rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="w-48 h-4 mx-auto" />
                      <Skeleton className="w-32 h-3 mx-auto" />
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={FileImage}
                  title="Оригинальное изображение"
                  description="Загрузите файлы для предпросмотра"
                />
              )}
            </TabsContent>
            
            <TabsContent value="after" className="h-full">
              {selectedFile?.processedUrl ? (
                <div className="relative h-full">
                  <img
                    src={selectedFile.processedUrl}
                    alt={`${selectedFile.name} (обработано)`}
                    className="w-full h-full object-contain rounded-lg border"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        // Zoom functionality
                      }}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(selectedFile.processedUrl!, `processed_${selectedFile.name}`)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : selectedFile?.status === 'processing' ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Skeleton className="w-32 h-32 mx-auto rounded-lg" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="w-48 h-4 mx-auto" />
                      <Skeleton className="w-32 h-3 mx-auto" />
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="Обработанное изображение"
                  description={files.length > 0 
                    ? 'Обработайте файлы для предпросмотра'
                    : 'Загрузите файлы для обработки'
                  }
                />
              )}
            </TabsContent>
          </div>

          {/* File Selector */}
          {files.length > 1 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Выберите файл:</p>
              <div className="flex gap-2 overflow-x-auto">
                {files.map((file, index) => (
                  <button
                    key={file.id}
                    className={`flex-shrink-0 p-2 rounded border text-xs relative ${
                      selectedFile?.id === file.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFile(file.id)}
                    title={file.name}
                  >
                    {index < 9 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                    )}
                    {file.name.length > 15 
                      ? `${file.name.substring(0, 15)}...`
                      : file.name
                    }
                  </button>
                ))}
              </div>

            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
