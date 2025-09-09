import { 
  IMAGE_CONSTRAINTS,
  validateImageFile,
  formatFileSize
} from './server/image-utils'

export interface ImageProcessingOptions {
  maxEdgePx: number;
  format: "jpeg" | "webp";
  quality: number;
  removeBg: boolean;
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

/**
 * Validates image dimensions and file size
 */
export function validateImage(
  file: File,
  width?: number,
  height?: number
): ImageValidationResult {
  const result = validateImageFile(file, width, height);
  return {
    ...result,
    warnings: result.warnings || []
  };
}

/**
 * Resizes image to fit within maxEdgePx while maintaining aspect ratio
 */
export function resizeImage(
  canvas: HTMLCanvasElement,
  maxEdgePx: number
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")!;
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
  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;
  const resizedCtx = resizedCanvas.getContext("2d")!;

  // Draw resized image
  resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

  return resizedCanvas;
}

/**
 * Compresses image with specified quality and format
 */
export function compressImage(
  canvas: HTMLCanvasElement,
  format: "jpeg" | "webp",
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
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
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
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
            reject(new Error("Failed to remove EXIF"));
          }
        },
        blob.type,
        1.0
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(blob);
  });
}

// Функции удаления фона удалены - используется только серверная обработка

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
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    onProgress?.(10);

    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error("Processing cancelled");
    }

    // Yield control to browser
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Step 2: Validate
    const validation = validateImage(file, img.width, img.height);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    onProgress?.(20);

    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error("Processing cancelled");
    }

    // Yield control to browser
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Step 3: Удаление фона теперь выполняется только на сервере
    // Клиентская обработка удалена - используется только серверная обработка
    if (options.removeBg) {
      throw new Error(
        "Удаление фона должно выполняться на сервере. Используйте серверную обработку."
      );
    }

    onProgress?.(60);

    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error("Processing cancelled");
    }

    // Yield control to browser
    await new Promise((resolve) => setTimeout(resolve, 0));

    onProgress?.(70);

    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error("Processing cancelled");
    }

    // Yield control to browser
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Step 5: Resize
    const resizedCanvas = resizeImage(canvas, options.maxEdgePx);

    onProgress?.(80);

    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error("Processing cancelled");
    }

    // Yield control to browser
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Step 6: Compress
    const compressedBlob = await compressImage(
      resizedCanvas,
      options.format,
      options.quality
    );

    onProgress?.(90);

    // Check for cancellation
    if (abortController?.signal.aborted) {
      throw new Error("Processing cancelled");
    }

    // Yield control to browser
    await new Promise((resolve) => setTimeout(resolve, 0));

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
    console.error("Image processing failed:", error);
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
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

// formatFileSize перенесена в image-utils.ts

/**
 * Gets image dimensions from file
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => reject(new Error("Failed to get image dimensions"));
    img.src = URL.createObjectURL(file);
  });
}
