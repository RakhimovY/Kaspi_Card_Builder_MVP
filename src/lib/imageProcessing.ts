import { removeBackground } from '@imgly/background-removal';

export interface ImageProcessingOptions {
  maxEdgePx: number;
  format: 'jpeg' | 'webp';
  quality: number;
  removeBg: boolean;
  optimizeBgRemoval?: boolean; // Включить оптимизацию удаления фона
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  size: number;
  format: string;
}

// Validation constants
const MIN_SIZE = 500;
const MAX_SIZE = 5000;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * Validates image dimensions and file size
 */
export function validateImage(
  file: File,
  width?: number,
  height?: number
): ImageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`Файл слишком большой (${formatFileSize(file.size)}). Максимум: ${formatFileSize(MAX_FILE_SIZE)}`);
  }

  // Dimensions validation (if available)
  if (width && height) {
    if (width < MIN_SIZE || height < MIN_SIZE) {
      warnings.push(`Размер изображения меньше ${MIN_SIZE}px. Рекомендуется: минимум ${MIN_SIZE}px`);
    }
    if (width > MAX_SIZE || height > MAX_SIZE) {
      warnings.push(`Размер изображения больше ${MAX_SIZE}px. Будет уменьшено до ${MAX_SIZE}px`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Resizes image to fit within maxEdgePx while maintaining aspect ratio
 */
export function resizeImage(
  canvas: HTMLCanvasElement,
  maxEdgePx: number
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;

  // Calculate new dimensions
  let newWidth = width;
  let newHeight = height;

  if (width > maxEdgePx || height > maxEdgePx) {
    if (width > height) {
      newWidth = maxEdgePx;
      newHeight = (height * maxEdgePx) / width;
    } else {
      newHeight = maxEdgePx;
      newWidth = (width * maxEdgePx) / height;
    }
  }

  // Create new canvas with target size
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;
  const resizedCtx = resizedCanvas.getContext('2d')!;

  // Draw resized image
  resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

  return resizedCanvas;
}

/**
 * Compresses image with specified quality and format
 */
export function compressImage(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'webp',
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Removes EXIF data from image
 */
export function removeExif(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (newBlob) => {
          if (newBlob) {
            resolve(newBlob);
          } else {
            reject(new Error('Failed to remove EXIF'));
          }
        },
        blob.type,
        1.0
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Resizes image for background removal optimization
 */
function resizeImageForBgRemoval(canvas: HTMLCanvasElement, maxSize: number): HTMLCanvasElement {
  const { width, height } = canvas;
  
  // Calculate new dimensions
  let newWidth = width;
  let newHeight = height;
  
  if (width > maxSize || height > maxSize) {
    if (width > height) {
      newWidth = maxSize;
      newHeight = (height * maxSize) / width;
    } else {
      newHeight = maxSize;
      newWidth = (width * maxSize) / height;
    }
  }
  
  // Create new canvas with target size
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;
  const resizedCtx = resizedCanvas.getContext('2d')!;
  
  // Draw resized image
  resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
  
  return resizedCanvas;
}

/**
 * Applies background removal mask to original image
 */
function applyMaskToOriginal(
  originalCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const { width, height } = originalCanvas;
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resultCtx = resultCanvas.getContext('2d')!;
  
  // Draw original image
  resultCtx.drawImage(originalCanvas, 0, 0);
  
  // Create mask from background removal result
  const maskCtx = maskCanvas.getContext('2d')!;
  const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  
  // Scale mask to original size
  const scaledMaskCanvas = document.createElement('canvas');
  scaledMaskCanvas.width = width;
  scaledMaskCanvas.height = height;
  const scaledMaskCtx = scaledMaskCanvas.getContext('2d')!;
  scaledMaskCtx.drawImage(maskCanvas, 0, 0, width, height);
  
  // Apply mask
  resultCtx.globalCompositeOperation = 'destination-in';
  resultCtx.drawImage(scaledMaskCanvas, 0, 0);
  
  return resultCanvas;
}

/**
 * Optimized background removal with pre-scaling
 */
export async function removeBackgroundOptimized(
  blob: Blob,
  onProgress?: (progress: number) => void,
  abortController?: AbortController
): Promise<Blob> {
  try {
    // Step 1: Load original image
    const originalImg = await loadImage(blob);
    const originalCanvas = document.createElement('canvas');
    const originalCtx = originalCanvas.getContext('2d')!;
    
    originalCanvas.width = originalImg.width;
    originalCanvas.height = originalImg.height;
    originalCtx.drawImage(originalImg, 0, 0);
    
    onProgress?.(10);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Background removal cancelled');
    }
    
    // Step 2: Determine if we need to scale down
    const maxBgRemovalSize = 1024;
    const needsScaling = originalImg.width > maxBgRemovalSize || originalImg.height > maxBgRemovalSize;
    
    let workingCanvas = originalCanvas;
    let scaleFactor = 1;
    
    if (needsScaling) {
      onProgress?.(20);
      
      // Scale down for background removal
      workingCanvas = resizeImageForBgRemoval(originalCanvas, maxBgRemovalSize);
      scaleFactor = originalImg.width / workingCanvas.width;
      
      onProgress?.(30);
    }
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Background removal cancelled');
    }
    
    // Step 3: Convert to blob for background removal
    const workingBlob = await new Promise<Blob>((resolve) => {
      workingCanvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.9);
    });
    
    onProgress?.(40);
    
    // Step 4: Remove background on scaled image
    const result = await removeBackground(workingBlob, {
      progress: onProgress ? (message: string, progress: number) => {
        // Map progress from 40-80%
        const mappedProgress = 40 + (progress * 0.4);
        onProgress(mappedProgress);
        
        // Check for cancellation
        if (abortController?.signal.aborted) {
          throw new Error('Background removal cancelled');
        }
      } : undefined,
      output: {
        format: 'image/png',
        quality: 0.7, // Lower quality for speed
      },
      model: 'isnet', // Faster model
    });
    
    onProgress?.(80);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Background removal cancelled');
    }
    
    // Step 5: Apply result to original image
    if (needsScaling) {
      onProgress?.(85);
      
      // Load the background removal result
      const resultImg = await loadImage(result);
      const resultCanvas = document.createElement('canvas');
      const resultCtx = resultCanvas.getContext('2d')!;
      
      resultCanvas.width = resultImg.width;
      resultCanvas.height = resultImg.height;
      resultCtx.drawImage(resultImg, 0, 0);
      
      // Apply mask to original
      const finalCanvas = applyMaskToOriginal(originalCanvas, resultCanvas);
      
      onProgress?.(95);
      
      // Convert to blob
      const finalBlob = await new Promise<Blob>((resolve) => {
        finalCanvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 0.9);
      });
      
      onProgress?.(100);
      return finalBlob;
    } else {
      onProgress?.(100);
      return result;
    }
    
  } catch (error) {
    console.error('Optimized background removal failed:', error);
    throw new Error('Не удалось удалить фон. Попробуйте другое изображение.');
  }
}

/**
 * Removes background from image
 */
export async function removeBackgroundFromImage(
  blob: Blob,
  onProgress?: (progress: number) => void,
  abortController?: AbortController
): Promise<Blob> {
  try {
    const result = await removeBackground(blob, {
      progress: onProgress ? (message: string, progress: number) => {
        // Синхронный вызов onProgress
        onProgress(progress);
        
        // Check for cancellation during background removal
        if (abortController?.signal.aborted) {
          throw new Error('Background removal cancelled');
        }
        
        // Yield control to browser more frequently during background removal
        if (progress % 5 === 0) { // More frequent checks
          // Используем setTimeout для асинхронного yield
          setTimeout(() => {}, 0);
        }
      } : undefined,
      output: {
        format: 'image/png',
        quality: 0.8,
      },
    });
    
    // Yield control after background removal
    await new Promise(resolve => setTimeout(resolve, 0));
    
    return result;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error('Не удалось удалить фон. Попробуйте другое изображение.');
  }
}

/**
 * Main image processing pipeline
 */
export async function processImage(
  file: File,
  options: ImageProcessingOptions,
  onProgress?: (progress: number) => void,
  abortController?: AbortController
): Promise<ProcessedImage> {
  try {
    // Step 1: Load image
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    onProgress?.(10);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Processing cancelled');
    }
    
    // Yield control to browser
    await new Promise(resolve => setTimeout(resolve, 0));

    // Step 2: Validate
    const validation = validateImage(file, img.width, img.height);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    onProgress?.(20);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Processing cancelled');
    }
    
    // Yield control to browser
    await new Promise(resolve => setTimeout(resolve, 0));

    // Step 3: Remove background (if requested)
    let processedBlob: Blob = file;
    if (options.removeBg) {
      // Выбираем оптимизированную или обычную версию
      if (options.optimizeBgRemoval !== false) { // По умолчанию включено
        processedBlob = await removeBackgroundOptimized(
          file,
          (progress) => onProgress?.(20 + progress * 0.4), // 20-60%
          abortController
        );
      } else {
        processedBlob = await removeBackgroundFromImage(
          file,
          (progress) => onProgress?.(20 + progress * 0.4), // 20-60%
          abortController
        );
      }
    }

    onProgress?.(60);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Processing cancelled');
    }
    
    // Yield control to browser
    await new Promise(resolve => setTimeout(resolve, 0));

    // Step 4: Load processed image back to canvas
    if (options.removeBg) {
      const processedImg = await loadImage(processedBlob);
      canvas.width = processedImg.width;
      canvas.height = processedImg.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(processedImg, 0, 0);
    }

    onProgress?.(70);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Processing cancelled');
    }
    
    // Yield control to browser
    await new Promise(resolve => setTimeout(resolve, 0));

    // Step 5: Resize
    const resizedCanvas = resizeImage(canvas, options.maxEdgePx);

    onProgress?.(80);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Processing cancelled');
    }
    
    // Yield control to browser
    await new Promise(resolve => setTimeout(resolve, 0));

    // Step 6: Compress
    const compressedBlob = await compressImage(
      resizedCanvas,
      options.format,
      options.quality
    );

    onProgress?.(90);
    
    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error('Processing cancelled');
    }
    
    // Yield control to browser
    await new Promise(resolve => setTimeout(resolve, 0));

    // Step 7: Remove EXIF
    const finalBlob = await removeExif(compressedBlob);

    onProgress?.(100);

    return {
      blob: finalBlob,
      width: resizedCanvas.width,
      height: resizedCanvas.height,
      size: finalBlob.size,
      format: finalBlob.type,
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    throw error;
  }
}

/**
 * Loads image from file/blob
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => reject(new Error('Failed to get image dimensions'));
    img.src = URL.createObjectURL(file);
  });
}
