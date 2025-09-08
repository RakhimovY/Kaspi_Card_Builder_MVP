import { useState, useCallback, useRef } from "react";
import { useAppStore } from "./store";
import { ImageProcessingOptions } from "./imageProcessing";
import { processImageServerOnly } from "./serverImageProcessing";
import { trackProcessStart, trackProcessDone } from "./analytics";

interface ProcessingState {
  inFlight: number; // количество задач в воркерах
  queueLen: number; // длина очереди
  doneCount: number; // количество завершенных
  isPaused: boolean;
  isCancelled: boolean;
}

export function useImageProcessing() {
  const { files, updateFileStatus, updateFileUrls, settings } = useAppStore();
  const [processingState, setProcessingState] = useState<ProcessingState>({
    inFlight: 0,
    queueLen: 0,
    doneCount: 0,
    isPaused: false,
    isCancelled: false,
  });
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingQueueRef = useRef<Set<string>>(new Set());
  const processingStateRef = useRef<ProcessingState>(processingState);

  // Синхронизируем ref с состоянием
  processingStateRef.current = processingState;

  // Функция для проверки состояния паузы с yield
  const checkPauseState = async () => {
    while (
      processingStateRef.current.isPaused &&
      !processingStateRef.current.isCancelled &&
      !abortControllerRef.current?.signal.aborted
    ) {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Очень частые проверки
    }
  };

  // Методы управления пулом
  const pauseProcessing = useCallback(() => {
    setProcessingState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeProcessing = useCallback(() => {
    setProcessingState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const cancelAllProcessing = useCallback(() => {
    setProcessingState((prev) => ({
      ...prev,
      isCancelled: true,
      isPaused: false,
    }));
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    processingQueueRef.current.clear();
  }, []);

  const resetProcessingState = useCallback(() => {
    setProcessingState({
      inFlight: 0,
      queueLen: 0,
      doneCount: 0,
      isPaused: false,
      isCancelled: false,
    });
    setCurrentFileIndex(0);
    processingQueueRef.current.clear();
  }, []);

  const processAllFiles = useCallback(async () => {
    if (files.length === 0) return;

    // Создаем новый AbortController для отмены
    abortControllerRef.current = new AbortController();

    // Сбрасываем состояние
    setProcessingState({
      inFlight: 0,
      queueLen: files.filter((f) => f.status !== "completed").length,
      doneCount: files.filter((f) => f.status === "completed").length,
      isPaused: false,
      isCancelled: false,
    });
    setCurrentFileIndex(0);

    try {
      trackProcessStart(files.length);

      const unprocessedFiles = files.filter((f) => f.status !== "completed");

      for (let i = 0; i < unprocessedFiles.length; i++) {
        const file = unprocessedFiles[i];

        // Проверяем отмену перед каждой итерацией
        if (
          processingStateRef.current.isCancelled ||
          abortControllerRef.current?.signal.aborted
        ) {
          break;
        }

        // Ждем если на паузе - с очень частыми проверками
        await checkPauseState();

        if (
          processingStateRef.current.isCancelled ||
          abortControllerRef.current?.signal.aborted
        ) {
          break;
        }

        // Yield control to browser for UI responsiveness
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Проверяем паузу после yield
        await checkPauseState();

        setCurrentFileIndex(i);
        updateFileStatus(file.id, "processing");

        // Добавляем в очередь обработки
        processingQueueRef.current.add(file.id);
        setProcessingState((prev) => ({
          ...prev,
          inFlight: prev.inFlight + 1,
        }));

        // Создаем отдельный AbortController для этого файла
        const fileAbortController = new AbortController();

        // Связываем с основным AbortController
        const mainAbortHandler = () => {
          fileAbortController.abort();
        };
        abortControllerRef.current?.signal.addEventListener(
          "abort",
          mainAbortHandler
        );

        try {
          // Use the original File object if available, otherwise fetch from URL
          const actualFile =
            file.originalFile ||
            (await fetch(file.originalUrl!)
              .then((r) => r.blob())
              .then((b) => new File([b], file.name, { type: file.type })));
          if (!actualFile) {
            throw new Error("Failed to get file data");
          }

          const options: ImageProcessingOptions = {
            maxEdgePx: settings.maxEdgePx,
            format: settings.format,
            quality: settings.quality,
            removeBg: settings.removeBg,
          };

          // Используем только серверную обработку
          const result = await processImageServerOnly(
            actualFile,
            options,
            (progress) => {
              // Update progress in UI if needed
              console.log(`Processing ${file.name}: ${progress}%`);
            },
            fileAbortController
          );

          // Create URL for processed image
          const processedUrl = URL.createObjectURL(result.blob);

          // Update file with processed data
          updateFileUrls(file.id, file.originalUrl, processedUrl);
          updateFileStatus(file.id, "completed");
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          updateFileStatus(
            file.id,
            "error",
            error instanceof Error ? error.message : "Unknown error"
          );
        } finally {
          // Очищаем обработчик событий
          abortControllerRef.current?.signal.removeEventListener(
            "abort",
            mainAbortHandler
          );

          // Убираем из очереди обработки
          processingQueueRef.current.delete(file.id);
          setProcessingState((prev) => ({
            ...prev,
            inFlight: Math.max(0, prev.inFlight - 1),
            doneCount: prev.doneCount + 1,
            queueLen: Math.max(0, prev.queueLen - 1),
          }));
        }
      }

      trackProcessDone(
        files.length,
        files.filter((f) => f.status === "completed").length
      );
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      // Сбрасываем состояние только если не отменено
      if (!processingStateRef.current.isCancelled) {
        resetProcessingState();
      }
    }
  }, [files, settings, updateFileStatus, updateFileUrls, resetProcessingState]);

  const processSingleFile = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      // Добавляем в очередь обработки
      processingQueueRef.current.add(fileId);
      setProcessingState((prev) => ({ ...prev, inFlight: prev.inFlight + 1 }));

      try {
        updateFileStatus(fileId, "processing");

        // Use the original File object if available, otherwise fetch from URL
        const actualFile =
          file.originalFile ||
          (await fetch(file.originalUrl!)
            .then((r) => r.blob())
            .then((b) => new File([b], file.name, { type: file.type })));
        if (!actualFile) {
          throw new Error("Failed to get file data");
        }

        const options: ImageProcessingOptions = {
          maxEdgePx: settings.maxEdgePx,
          format: settings.format,
          quality: settings.quality,
          removeBg: settings.removeBg,
        };

        // Используем только серверную обработку
        const result = await processImageServerOnly(
          actualFile,
          options,
          undefined,
          abortControllerRef.current || undefined
        );

        // Create URL for processed image
        const processedUrl = URL.createObjectURL(result.blob);

        // Update file with processed data
        updateFileUrls(fileId, file.originalUrl, processedUrl);
        updateFileStatus(fileId, "completed");
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        updateFileStatus(
          fileId,
          "error",
          error instanceof Error ? error.message : "Unknown error"
        );
      } finally {
        // Убираем из очереди обработки
        processingQueueRef.current.delete(fileId);
        setProcessingState((prev) => ({
          ...prev,
          inFlight: Math.max(0, prev.inFlight - 1),
          doneCount: prev.doneCount + 1,
        }));
      }
    },
    [files, settings, updateFileStatus, updateFileUrls]
  );

  const getProgress = useCallback(() => {
    if (files.length === 0) return 0;
    return (processingState.doneCount / files.length) * 100;
  }, [files.length, processingState.doneCount]);

  const getCurrentFileName = useCallback(() => {
    if (currentFileIndex < files.length) {
      return files[currentFileIndex]?.name;
    }
    return null;
  }, [files, currentFileIndex]);

  // Получаем готовые файлы для экспорта
  const getCompletedFiles = useCallback(() => {
    return files.filter((f) => f.status === "completed");
  }, [files]);

  // Проверяем, есть ли активная обработка
  const isProcessing =
    processingState.inFlight > 0 || processingState.queueLen > 0;

  return {
    // Гранулярные флаги состояния
    processingState,
    isProcessing,

    // Методы обработки
    processAllFiles,
    processSingleFile,

    // Методы управления
    pauseProcessing,
    resumeProcessing,
    cancelAllProcessing,
    resetProcessingState,

    // Утилиты
    getProgress,
    getCurrentFileName,
    getCompletedFiles,

    // Метаданные
    currentFileIndex,
    totalFiles: files.length,
  };
}
