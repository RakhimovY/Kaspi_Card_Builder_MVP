import { logger } from "./logger";
import { 
  imageProcessingOptionsSchema,
  type ImageProcessingOptions,
  validateImageBuffer,
  getImageDimensions,
  getMimeTypeFromSignature,
  formatFileSize
} from "./image-utils";

export type ServerImageProcessingOptions = ImageProcessingOptions;

export interface ProcessedImageResult {
  blob: Buffer;
  format: string;
  size: number;
  originalSize: number;
  processingTime: number;
}

// Валидация и утилиты перенесены в image-utils.ts

/**
 * Серверное удаление фона
 */
export async function removeBackgroundServer(
  buffer: Buffer,
  options: ServerImageProcessingOptions,
  onProgress?: (progress: number) => void
): Promise<Buffer> {
  const startTime = Date.now();

  try {
    console.log("Starting server-side background removal");

    onProgress?.(10);

    const { removeBackground } = await import("@imgly/background-removal-node");

    onProgress?.(20);

    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );

    const mimeType = getMimeTypeFromSignature(buffer);
    const blob = new Blob([arrayBuffer as ArrayBuffer], { type: mimeType });

    onProgress?.(30);

    const result = await removeBackground(blob, {
      progress: onProgress
        ? (message: string, progress: number) => {
            const mappedProgress = 30 + progress * 0.6;
            onProgress(mappedProgress);
          }
        : undefined,
      output: {
        format: `image/${options.format}`,
        quality: options.quality,
      },
      model: "small",
    });

    onProgress?.(90);

    const resultBuffer = Buffer.from(await result.arrayBuffer());

    const processingTime = Date.now() - startTime;
    console.log("Background removal completed", {
      processingTime,
      originalSize: buffer.length,
      resultSize: resultBuffer.length,
      compressionRatio: (1 - resultBuffer.length / buffer.length) * 100,
    });

    onProgress?.(100);

    return resultBuffer;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.log("Background removal failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      processingTime,
      bufferSize: buffer.length,
      mimeType: getMimeTypeFromSignature(buffer),
    });

    throw new Error(
      "Не удалось удалить фон на сервере. Попробуйте другое изображение."
    );
  }
}

/**
 * Основная функция обработки изображения на сервере
 */
export async function processImageServer(
  buffer: Buffer,
  filename: string,
  options: ServerImageProcessingOptions,
  onProgress?: (progress: number) => void
): Promise<ProcessedImageResult> {
  const startTime = Date.now();

  try {
    console.log("Starting server-side image processing");

    onProgress?.(5);

    const validation = validateImageBuffer(buffer, filename);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    onProgress?.(10);

    const dimensions = await getImageDimensions(buffer);
    if (dimensions.width > 0 && dimensions.height > 0) {
      const maxEdge = Math.max(dimensions.width, dimensions.height);
      if (maxEdge > options.maxEdgePx) {
        console.log("Image exceeds max edge size", {
          maxEdge,
          maxAllowed: options.maxEdgePx,
        });
      }
    }

    onProgress?.(15);

    let processedBuffer = buffer;

    if (options.removeBg) {
      processedBuffer = await removeBackgroundServer(
        buffer,
        options,
        (progress) => {
          onProgress?.(15 + progress * 0.7);
        }
      );
    }

    onProgress?.(85);
    onProgress?.(95);

    const processingTime = Date.now() - startTime;

    const result: ProcessedImageResult = {
      blob: processedBuffer,
      format: options.format,
      size: processedBuffer.length,
      originalSize: buffer.length,
      processingTime,
    };

    console.log("Image processing completed", {
      processingTime,
      originalSize: buffer.length,
      resultSize: processedBuffer.length,
      compressionRatio: (1 - processedBuffer.length / buffer.length) * 100,
    });

    onProgress?.(100);

    return result;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.log("Image processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime,
    });

    throw error;
  }
}
