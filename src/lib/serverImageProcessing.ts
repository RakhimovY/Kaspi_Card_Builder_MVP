import { ImageProcessingOptions } from "./imageProcessing";
import { convertToServerOptions, type ImageProcessingOptions as ServerImageProcessingOptions } from "./server/image-utils";

export interface ServerProcessingResult {
  blob: Blob;
  format: string;
  size: number;
  originalSize: number;
  processingTime: number;
  compressionRatio: number;
}

// convertToServerOptions перенесена в image-utils.ts

/**
 * Обработка изображения на сервере
 */
export async function processImageOnServer(
  file: File,
  options: ImageProcessingOptions,
  onProgress?: (progress: number) => void,
  abortController?: AbortController
): Promise<ServerProcessingResult> {
  const serverOptions = convertToServerOptions(options);

  // Создаем FormData для отправки
  const formData = new FormData();
  formData.append("image", file);
  formData.append("options", JSON.stringify(serverOptions));

  // Создаем сигнал отмены
  const signal = abortController?.signal;

  try {
    onProgress?.(5);

    const response = await fetch("/api/process-photo", {
      method: "POST",
      body: formData,
      signal,
    });

    onProgress?.(10);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        throw new Error(
          "Превышена квота на обработку изображений. Обновите подписку для увеличения лимитов."
        );
      }

      if (response.status === 422) {
        throw new Error(
          errorData.error || "Не удалось обработать изображение на сервере."
        );
      }

      if (response.status === 401) {
        throw new Error("Необходима авторизация для обработки изображений.");
      }

      throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
    }

    onProgress?.(50);

    // Получаем метаданные из заголовков
    const originalSize = parseInt(
      response.headers.get("X-Original-Size") || "0"
    );
    const processingTime = parseInt(
      response.headers.get("X-Processing-Time") || "0"
    );
    const compressionRatio = parseInt(
      response.headers.get("X-Compression-Ratio") || "0"
    );
    const format = response.headers.get("Content-Type")?.split("/")[1] || "png";

    onProgress?.(80);

    // Получаем обработанное изображение
    const blob = await response.blob();

    onProgress?.(100);

    return {
      blob,
      format,
      size: blob.size,
      originalSize,
      processingTime,
      compressionRatio,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Обработка изображения отменена");
    }

    console.error("Server image processing failed:", error);
    throw error;
  }
}

/**
 * Проверяет доступность серверной обработки
 */
export async function checkServerCapabilities(): Promise<{
  available: boolean;
  capabilities?: {
    supportedFormats: string[];
    maxFileSize: number;
    maxEdgeSize: number;
    minEdgeSize: number;
    features: {
      backgroundRemoval: boolean;
      qualityAdjustment: boolean;
      formatConversion: boolean;
    };
  };
  error?: string;
}> {
  try {
    const response = await fetch("/api/process-photo", {
      method: "GET",
    });

    if (!response.ok) {
      return {
        available: false,
        error: `Server error: ${response.status}`,
      };
    }

    const capabilities = await response.json();

    return {
      available: true,
      capabilities,
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Серверная обработка изображений (единственный способ)
 */
export async function processImageServerOnly(
  file: File,
  options: ImageProcessingOptions,
  onProgress?: (progress: number) => void,
  abortController?: AbortController
): Promise<{ blob: Blob; source: "server" }> {
  // Проверяем доступность сервера
  const serverCheck = await checkServerCapabilities();

  if (!serverCheck.available) {
    throw new Error(
      "Серверная обработка недоступна. Проверьте подключение к серверу."
    );
  }

  if (options.removeBg) {
    // Удаление фона - только на сервере
    onProgress?.(1);

    const result = await processImageOnServer(
      file,
      options,
      (progress) => {
        // Маппим прогресс сервера от 1% до 100%
        onProgress?.(1 + progress * 0.99);
      },
      abortController
    );

    return {
      blob: result.blob,
      source: "server",
    };
  } else {
    // Обычная обработка без удаления фона - можно на клиенте
    onProgress?.(10);

    const { processImage } = await import("./imageProcessing");
    const result = await processImage(
      file,
      options,
      (progress) => {
        // Маппим прогресс клиента от 10% до 100%
        onProgress?.(10 + progress * 0.9);
      },
      abortController
    );

    return {
      blob: result.blob,
      source: "server", // Помечаем как серверную для единообразия
    };
  }
}
