import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/auth-config";
import { prisma } from "@/lib/server/prisma";
import { assertQuota, assertIpQuota, incrementUsage, incrementIpUsage } from "@/lib/server/quota";
import { getClientIp } from "@/lib/server/api-utils";
import {
  processImageServer,
  type ServerImageProcessingOptions,
} from "@/lib/server/imageProcessing";
import { imageProcessingOptionsSchema } from "@/lib/server/image-utils";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const ipAddress = getClientIp(request);
    
    console.log("Process photo request", { userId, ipAddress, isAnonymous: !userId });

    // Check quota based on authentication status
    if (userId) {
      // Authenticated user - check user quota
      await assertQuota(userId, "imageProcessing");
    } else {
      // Anonymous user - check IP quota
      await assertIpQuota(ipAddress, "imageProcessing");
    }

    console.log("Parsing form data");
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const optionsString = formData.get("options") as string;

    console.log("Form data parsed", {
      hasImage: !!imageFile,
      imageName: imageFile?.name,
      imageSize: imageFile?.size,
      hasOptions: !!optionsString,
    });

    if (!imageFile) {
      console.log("No image file provided");
      return NextResponse.json(
        { error: "No image file provided", code: "MISSING_IMAGE" },
        { status: 400 }
      );
    }

    let options: ServerImageProcessingOptions;
    try {
      const parsedOptions = optionsString ? JSON.parse(optionsString) : {};
      options = imageProcessingOptionsSchema.parse(parsedOptions);
    } catch (error) {
      console.log("Invalid options provided", error);
      return NextResponse.json(
        { error: "Invalid processing options", code: "INVALID_OPTIONS" },
        { status: 400 }
      );
    }

    console.log("Processing image", {
      filename: imageFile.name,
      size: imageFile.size,
      options,
    });

    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const result = await processImageServer(
      buffer,
      imageFile.name,
      options,
      (progress) => {
        console.log("Processing progress", progress);
      }
    );

    // Increment usage based on authentication status
    if (userId) {
      await incrementUsage(userId, "imageProcessing");
    } else {
      await incrementIpUsage(ipAddress, "imageProcessing");
    }

    try {
      await prisma.imageProcessingLog.create({
        data: {
          userId: userId || null,
          ipAddress: userId ? null : ipAddress,
          filename: imageFile.name,
          originalSize: result.originalSize,
          processedSize: result.size,
          processingTime: result.processingTime,
          options: JSON.stringify(options),
          success: true,
        },
      });
      console.log("Processing completed", {
        userId,
        ipAddress,
        filename: imageFile.name,
        originalSize: result.originalSize,
        processedSize: result.size,
        processingTime: result.processingTime,
      });
    } catch (dbError) {
      console.log("Failed to save processing log", dbError);
    }

    const response = new NextResponse(result.blob as unknown as Blob, {
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
    console.log("Image processing failed", error);

    try {
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id;
      const ipAddress = getClientIp(request);
      
      if (userId || !userId) { // Log for both authenticated and anonymous users
        await prisma.imageProcessingLog.create({
          data: {
            userId: userId || null,
            ipAddress: userId ? null : ipAddress,
            filename: 'unknown',
            originalSize: 0,
            processedSize: 0,
            processingTime: 0,
            options: '{}',
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });
        console.log("Processing failed", {
          userId,
          ipAddress,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } catch (dbError) {
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

export async function GET() {
  try {
    const capabilities = {
      supportedFormats: ["jpeg", "png", "webp"],
      maxFileSize: 25 * 1024 * 1024,
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

    console.log("Process photo capabilities requested");
    return NextResponse.json(capabilities);
  } catch (error) {
    console.log("Failed to get capabilities", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
