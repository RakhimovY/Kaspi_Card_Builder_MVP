'use client';

import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/lib/useTranslations';
import { trackBarcodeScan } from '@/lib/analytics';
import { Camera, X, AlertCircle } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get available video devices
      const videoInputDevices = await reader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Use the first available camera
      const selectedDeviceId = videoInputDevices[0].deviceId;

      // Start decoding from video element
      await reader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {t('common.processing')}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
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
                onClick={startScanning}
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
