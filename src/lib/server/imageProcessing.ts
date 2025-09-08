// Динамический импорт для избежания проблем с sharp
// import { removeBackground } from '@imgly/background-removal-node';
import { logger } from "./logger";
import { z } from "zod";

// Схемы валидации
export const imageProcessingOptionsSchema = z.object({
  removeBg: z.boolean().default(false),
  quality: z.number().min(0.1).max(1.0).default(0.8),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
  maxEdgePx: z.number().min(500).max(5000).default(2000),
});

export type ServerImageProcessingOptions = z.infer<
  typeof imageProcessingOptionsSchema
>;

export interface ProcessedImageResult {
  blob: Buffer;
  format: string;
  size: number;
  originalSize: number;
  processingTime: number;
}

/**
 * Валидация изображения на сервере
 */
export function validateImageBuffer(
  buffer: Buffer,
  filename: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Проверка размера файла (25MB максимум)
  const maxSizeBytes = 25 * 1024 * 1024;
  if (buffer.length > maxSizeBytes) {
    errors.push(
      `Размер файла превышает 25MB (${Math.round(
        buffer.length / 1024 / 1024
      )}MB)`
    );
  }

  // Проверка минимального размера
  if (buffer.length < 1024) {
    errors.push("Файл слишком маленький (меньше 1KB)");
  }

  // Проверка формата файла
  // const allowedFormats = ["image/jpeg", "image/png", "image/webp"]; // Не используется
  const fileExtension = filename.toLowerCase().split(".").pop();
  const validExtensions = ["jpg", "jpeg", "png", "webp"];

  if (!fileExtension || !validExtensions.includes(fileExtension)) {
    errors.push("Неподдерживаемый формат файла. Разрешены: JPEG, PNG, WebP");
  }

  // Проверка сигнатуры файла
  const isValidImage = checkImageSignature(buffer);
  if (!isValidImage) {
    errors.push("Файл не является валидным изображением");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Проверка сигнатуры файла изображения
 */
function checkImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    // Проверяем RIFF...WEBP
    if (
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Получение размеров изображения из Buffer
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  // Простая проверка для PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // Для JPEG и WebP нужна более сложная логика
  // Пока возвращаем заглушку, в реальном проекте можно использовать sharp или jimp
  return { width: 0, height: 0 };
}

/**
 * Серверное удаление фона
 */
export async function removeBackgroundServer(
  buffer: Buffer,
  options: ServerImageProcessingOptions,
  onProgress?: (progress: number) => void
): Promise<Buffer> {
  const startTime = Date.now();
  // const log = logger.child({
  //   operation: "removeBackgroundServer",
  //   bufferSize: buffer.length,
  //   options,
  // });

  try {
    // log.info({ message: "Starting server-side background removal" });
    console.log("Starting server-side background removal");

    onProgress?.(10);

    // Динамический импорт библиотеки
    const { removeBackground } = await import("@imgly/background-removal-node");

    onProgress?.(20);

    // Конвертируем Buffer в Blob для библиотеки с правильным MIME типом
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );

    // Определяем MIME тип по сигнатуре файла
    let mimeType = "image/png"; // по умолчанию
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      mimeType = "image/jpeg";
    } else if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      mimeType = "image/png";
    } else if (
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      mimeType = "image/webp";
    }

    const blob = new Blob([arrayBuffer as ArrayBuffer], { type: mimeType });

    onProgress?.(30);

    // Вызываем библиотеку удаления фона
    const result = await removeBackground(blob, {
      progress: onProgress
        ? (message: string, progress: number) => {
            // Маппим прогресс от 30% до 90%
            const mappedProgress = 30 + progress * 0.6;
            onProgress(mappedProgress);
          }
        : undefined,
      output: {
        format: `image/${options.format}`,
        quality: options.quality,
      },
      model: "small", // Используем быструю модель
    });

    onProgress?.(90);

    // Конвертируем результат обратно в Buffer
    const resultBuffer = Buffer.from(await result.arrayBuffer());

    const processingTime = Date.now() - startTime;
    // log.info({
    //   message: "Background removal completed",
    //   processingTime,
    //   originalSize: buffer.length,
    //   resultSize: resultBuffer.length,
    //   compressionRatio: (1 - resultBuffer.length / buffer.length) * 100,
    // });
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
    // log.error({
    //   message: "Background removal failed",
    //   error: error instanceof Error ? error.message : "Unknown error",
    //   processingTime,
    // });
    console.log("Background removal failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      processingTime,
      bufferSize: buffer.length,
      mimeType:
        buffer[0] === 0xff && buffer[1] === 0xd8
          ? "image/jpeg"
          : buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47
          ? "image/png"
          : buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50
          ? "image/webp"
          : "unknown",
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
  // const log = logger.child({
  //   operation: "processImageServer",
  //   filename,
  //   bufferSize: buffer.length,
  //   options,
  // });

  try {
    // log.info({ message: "Starting server-side image processing" });
    console.log("Starting server-side image processing");

    onProgress?.(5);

    // Валидация
    const validation = validateImageBuffer(buffer, filename);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    onProgress?.(10);

    // Получение размеров изображения
    const dimensions = await getImageDimensions(buffer);
    if (dimensions.width > 0 && dimensions.height > 0) {
      const maxEdge = Math.max(dimensions.width, dimensions.height);
      if (maxEdge > options.maxEdgePx) {
        // log.warn({
        //   message: "Image exceeds max edge size",
        //   maxEdge,
        //   maxAllowed: options.maxEdgePx,
        // });
        console.log("Image exceeds max edge size", {
          maxEdge,
          maxAllowed: options.maxEdgePx,
        });
      }
    }

    onProgress?.(15);

    let processedBuffer = buffer;

    // Удаление фона если запрошено
    if (options.removeBg) {
      processedBuffer = await removeBackgroundServer(
        buffer,
        options,
        (progress) => {
          // Маппим прогресс от 15% до 85%
          onProgress?.(15 + progress * 0.7);
        }
      );
    }

    onProgress?.(85);

    // Здесь можно добавить дополнительную обработку:
    // - Ресайз изображения
    // - Сжатие
    // - Конвертация формата

    onProgress?.(95);

    const processingTime = Date.now() - startTime;

    const result: ProcessedImageResult = {
      blob: processedBuffer,
      format: options.format,
      size: processedBuffer.length,
      originalSize: buffer.length,
      processingTime,
    };

    // log.info({
    //   message: "Image processing completed",
    //   processingTime,
    //   originalSize: buffer.length,
    //   resultSize: processedBuffer.length,
    //   compressionRatio: (1 - processedBuffer.length / buffer.length) * 100,
    // });
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
    // log.error({
    //   message: "Image processing failed",
    //   error: error instanceof Error ? error.message : "Unknown error",
    //   processingTime,
    // });
    console.log("Image processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime,
    });

    throw error;
  }
}
