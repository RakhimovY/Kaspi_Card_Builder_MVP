'use client';

import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/lib/useTranslations';
import { trackBarcodeScan } from '@/lib/analytics';
import { Camera, X, AlertCircle, Settings, Info } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const { t } = useTranslations();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCameras();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const loadCameras = async () => {
    try {
      // Запрашиваем разрешение на доступ к камере
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (permissionErr) {
        console.warn('Camera permission denied or not available:', permissionErr);
        setError('Доступ к камере запрещен или недоступен. Проверьте разрешения браузера.');
        return;
      }

      const reader = new BrowserMultiFormatReader();
      const videoInputDevices = await reader.listVideoInputDevices();
      
      console.log('Available cameras:', videoInputDevices.map(cam => ({
        deviceId: cam.deviceId,
        label: cam.label,
        kind: cam.kind
      })));
      
      setAvailableCameras(videoInputDevices);
      
      if (videoInputDevices.length > 0) {
        const firstCameraId = videoInputDevices[0].deviceId;
        setSelectedCameraId(firstCameraId);
        // Небольшая задержка для установки состояния
        setTimeout(() => {
          startScanning(firstCameraId);
        }, 100);
      } else {
        setError('Камеры не найдены. Убедитесь, что камера подключена и доступна.');
      }
    } catch (err) {
      console.error('Failed to load cameras:', err);
      setError('Не удалось загрузить список камер. Проверьте подключение камеры.');
    }
  };

  const startScanning = async (deviceId?: string) => {
    try {
      setError(null);
      setIsScanning(true);
      
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Настройка подсказок для лучшего распознавания
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8');
      
      reader.hints = hints;

      // Use the provided device ID or the selected one
      let selectedDeviceId = deviceId || selectedCameraId;
      
      // Если deviceId не передан и selectedCameraId пустой, попробуем получить камеры снова
      if (!selectedDeviceId) {
        console.log('No device ID provided, trying to get cameras again...');
        const videoInputDevices = await reader.listVideoInputDevices();
        if (videoInputDevices.length > 0) {
          selectedDeviceId = videoInputDevices[0].deviceId;
          setSelectedCameraId(selectedDeviceId);
        } else {
          throw new Error('No camera devices found');
        }
      }

      // Настройка видео элемента для лучшего качества
      if (videoRef.current) {
        videoRef.current.style.objectFit = 'cover';
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = '100%';
      }

      console.log('Starting barcode scanning with device:', selectedDeviceId);
      console.log('Video element:', videoRef.current);
      
      // Start decoding from video element
      await reader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            const format = result.getBarcodeFormat();
            console.log('Barcode detected:', { barcode, format });
            trackBarcodeScan(true);
            onScan(barcode);
            stopScanning();
            onClose();
          }
          
          if (error && !(error instanceof Error && error.name === 'NotFoundException')) {
            console.warn('Barcode scanning error:', error);
            trackBarcodeScan(false);
          }
        }
      );
    } catch (err) {
      console.error('Failed to start barcode scanner:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      trackBarcodeScan(true);
      onScan(manualInput.trim());
      onClose();
    }
  };

  const handleClose = () => {
    stopScanning();
    setError(null);
    setManualInput('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {t('studio.form.actions.scan_barcode')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Preview */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm mb-2">
                  {t('common.processing')}
                </div>
                {/* Сканирующая рамка */}
                <div className="w-48 h-32 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>
                </div>
              </div>
            )}
          </div>

          {/* Выбор камеры */}
          {availableCameras.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Выберите камеру:
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  stopScanning();
                  startScanning(e.target.value);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableCameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Камера ${camera.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Инструкции для пользователя */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Советы для лучшего сканирования:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Держите штрихкод прямо перед камерой</li>
                  <li>• Убедитесь, что штрихкод хорошо освещен</li>
                  <li>• Держите телефон на расстоянии 15-30 см от камеры</li>
                  <li>• Избегайте бликов и теней на штрихкоде</li>
                  <li>• Если не работает - попробуйте другую камеру</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
              {error.includes('разрешения') && (
                <Button
                  onClick={loadCameras}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Запросить разрешение на камеру
                </Button>
              )}
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('studio.form.fields.gtin_placeholder')}
            </label>
            <div className="flex gap-2">
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="1234567890123"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit();
                  }
                }}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                size="sm"
              >
                {t('common.submit')}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            {!isScanning && !error && (
              <Button
                onClick={() => startScanning(selectedCameraId)}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {t('common.tryAgain')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
