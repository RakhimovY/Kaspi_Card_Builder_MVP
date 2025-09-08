import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/auth-config";
import { prisma } from "@/lib/server/prisma";
import { logger } from "@/lib/server/logger";
import { assertQuota, incrementUsage } from "@/lib/server/quota";
import {
  processImageServer,
  imageProcessingOptionsSchema,
  type ServerImageProcessingOptions,
} from "@/lib/server/imageProcessing";
// import { z } from "zod"; // Не используется

// Схема для валидации multipart/form-data (не используется, так как валидация происходит в processImageServer)
// const processPhotoSchema = z.object({
//   image: z.any(), // File из FormData
//   options: z.string().optional(), // JSON строка с опциями
// });

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  // Временно отключаем логирование для избежания проблем с worker
  // const log = logger.child({
  //   requestId,
  //   endpoint: "process-photo",
  //   method: "POST",
  // });

  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("Unauthorized request to process-photo");
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    // log.info({ message: "Process photo request", userId });
    console.log("Process photo request", { userId });

    // Проверяем квоты
    await assertQuota(userId, "imageProcessing");

    // Парсим multipart/form-data
    // log.info({ message: "Parsing form data" });
    console.log("Parsing form data");
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const optionsString = formData.get("options") as string;

    // log.info({
    //   message: "Form data parsed",
    //   hasImage: !!imageFile,
    //   imageName: imageFile?.name,
    //   imageSize: imageFile?.size,
    //   hasOptions: !!optionsString,
    // });
    console.log("Form data parsed", {
      hasImage: !!imageFile,
      imageName: imageFile?.name,
      imageSize: imageFile?.size,
      hasOptions: !!optionsString,
    });

    if (!imageFile) {
      // log.error({ message: "No image file provided" });
      console.log("No image file provided");
      return NextResponse.json(
        { error: "No image file provided", code: "MISSING_IMAGE" },
        { status: 400 }
      );
    }

    // Парсим опции
    let options: ServerImageProcessingOptions;
    try {
      const parsedOptions = optionsString ? JSON.parse(optionsString) : {};
      options = imageProcessingOptionsSchema.parse(parsedOptions);
    } catch (error) {
      // log.error({ message: "Invalid options provided", error });
      console.log("Invalid options provided", error);
      return NextResponse.json(
        { error: "Invalid processing options", code: "INVALID_OPTIONS" },
        { status: 400 }
      );
    }

    // log.info({
    //   message: "Processing image",
    //   filename: imageFile.name,
    //   size: imageFile.size,
    //   options,
    // });
    console.log("Processing image", {
      filename: imageFile.name,
      size: imageFile.size,
      options,
    });

    // Конвертируем File в Buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Обрабатываем изображение
    const result = await processImageServer(
      buffer,
      imageFile.name,
      options,
      (progress) => {
        // log.debug({ message: "Processing progress", progress });
        console.log("Processing progress", progress);
      }
    );

    // Инкрементируем использование
    await incrementUsage(userId, "imageProcessing");

    // Сохраняем информацию об обработке в базу данных
    try {
      // TODO: Временно закомментировано из-за проблем с типами Prisma
      // await prisma.imageProcessingLog.create({
      //   data: {
      //     userId,
      //     filename: imageFile.name,
      //     originalSize: result.originalSize,
      //     processedSize: result.size,
      //     processingTime: result.processingTime,
      //     options: JSON.stringify(options),
      //     success: true,
      //   },
      // });
      // log.info({
      //   message: "Processing completed (logging disabled)",
      //   userId,
      //   filename: imageFile.name,
      //   originalSize: result.originalSize,
      //   processedSize: result.size,
      //   processingTime: result.processingTime,
      // });
      console.log("Processing completed", {
        userId,
        filename: imageFile.name,
        originalSize: result.originalSize,
        processedSize: result.size,
        processingTime: result.processingTime,
      });
    } catch (dbError) {
      // log.warn({
      //   message: "Failed to save processing log",
      //   error: dbError instanceof Error ? dbError.message : "Unknown error",
      // });
      console.log("Failed to save processing log", dbError);
      // Не прерываем выполнение из-за ошибки логирования
    }

    // Возвращаем результат
    const response = new NextResponse(result.blob as Blob, {
      status: 200,
      headers: {
        "Content-Type": `image/${result.format}`,
        "Content-Length": result.size.toString(),
        "X-Original-Size": result.originalSize.toString(),
        "X-Processing-Time": result.processingTime.toString(),
        "X-Compression-Ratio": Math.round(
          (1 - result.size / result.originalSize) * 100
        ).toString(),
      },
    });

    // log.info({
    //   message: "Image processing completed successfully",
    //   originalSize: result.originalSize,
    //   processedSize: result.size,
    //   processingTime: result.processingTime,
    //   compressionRatio: Math.round(
    //     (1 - result.size / result.originalSize) * 100
    //   ),
    // });
    console.log("Image processing completed successfully", {
      originalSize: result.originalSize,
      processedSize: result.size,
      processingTime: result.processingTime,
      compressionRatio: Math.round(
        (1 - result.size / result.originalSize) * 100
      ),
    });

    return response;
  } catch (error) {
    // log.error({
    //   message: "Image processing failed",
    //   error: error instanceof Error ? error.message : "Unknown error",
    //   stack: error instanceof Error ? error.stack : undefined,
    // });
    console.log("Image processing failed", error);

    // Сохраняем ошибку в базу данных
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        // TODO: Временно закомментировано из-за проблем с типами Prisma
        // await prisma.imageProcessingLog.create({
        //   data: {
        //     userId: session.user.id,
        //     filename: 'unknown',
        //     originalSize: 0,
        //     processedSize: 0,
        //     processingTime: 0,
        //     options: '{}',
        //     success: false,
        //     errorMessage: error instanceof Error ? error.message : 'Unknown error',
        //   },
        // });
        // log.error({
        //   message: "Processing failed (error logging disabled)",
        //   userId: session.user.id,
        //   error: error instanceof Error ? error.message : "Unknown error",
        // });
        console.log("Processing failed", {
          userId: session.user.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } catch (dbError) {
      // log.warn({
      //   message: "Failed to save error log",
      //   error: dbError instanceof Error ? dbError.message : "Unknown error",
      // });
      console.log("Failed to save error log", dbError);
    }

    if (error instanceof Error && error.name === "QuotaError") {
      return NextResponse.json(
        { error: "Quota exceeded", code: "QUOTA_EXCEEDED" },
        { status: 429 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Не удалось удалить фон")
    ) {
      return NextResponse.json(
        { error: error.message, code: "BACKGROUND_REMOVAL_FAILED" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// GET endpoint для получения информации о возможностях обработки
export async function GET() {
  // const log = logger.child({ endpoint: "process-photo", method: "GET" });

  try {
    const capabilities = {
      supportedFormats: ["jpeg", "png", "webp"],
      maxFileSize: 25 * 1024 * 1024, // 25MB
      maxEdgeSize: 5000,
      minEdgeSize: 500,
      features: {
        backgroundRemoval: true,
        qualityAdjustment: true,
        formatConversion: true,
      },
      models: {
        backgroundRemoval: ["isnet"],
      },
    };

    // log.info({ message: "Process photo capabilities requested" });
    console.log("Process photo capabilities requested");
    return NextResponse.json(capabilities);
  } catch (error) {
    // log.error({
    //   message: "Failed to get capabilities",
    //   error: error instanceof Error ? error.message : "Unknown error",
    // });
    console.log("Failed to get capabilities", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
