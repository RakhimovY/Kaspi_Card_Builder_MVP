import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { getUserIdFromRequest } from '@/lib/server/auth'
import { assertQuota, incrementUsage } from '@/lib/server/quota'
import { lookupGtin } from '@/lib/server/gtin-lookup'
import { extractKeyInfoFromOcr } from '@/lib/server/ocr'
import { enrichProductWithLlm } from '@/lib/server/llm'
import { logger } from '@/lib/server/logger'
import { env } from '@/lib/server/env'
import { debugLogger } from '@/lib/server/debug-logger'
import { z } from 'zod'

const magicFillSchema = z.object({
  gtin: z.string().min(8).max(14).optional(),
  imageIds: z.array(z.string()).max(5).optional(),
  manual: z.object({
    brand: z.preprocess((v) => (v === '' ? undefined : v), z.string().max(100).optional()),
    type: z.preprocess((v) => (v === '' ? undefined : v), z.string().max(100).optional()),
    model: z.preprocess((v) => (v === '' ? undefined : v), z.string().max(100).optional()),
    keySpec: z.preprocess((v) => (v === '' ? undefined : v), z.string().max(500).optional()),
    category: z.preprocess(
      (v) => (v === '' ? undefined : v),
      z.enum(['electronics', 'clothing', 'cosmetics', 'home', 'sports', 'other']).optional()
    ),
  }).optional(),
})

export async function POST(request: NextRequest) {
  const traceId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Get authenticated user
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check quota
    await assertQuota(userId, 'magicFill')

    // Parse and validate request
    const body = await request.json()
    const validationResult = magicFillSchema.safeParse(body)
    
    if (!validationResult.success) {
      logger.error({
        message: 'Magic Fill validation failed',
        traceId,
        userId,
        errors: validationResult.error.errors,
        body,
      })
      
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.errors,
          traceId 
        },
        { status: 400 }
      )
    }
    
    const { gtin, imageIds, manual } = validationResult.data

    logger.info({
      message: 'Magic Fill request started',
      traceId,
      userId,
      gtin,
      imageIds: imageIds?.length,
      hasManual: !!manual,
    })

    let gtinData = null;
    let ocrData = null;

    // 1. GTIN Lookup (if provided)
    if (gtin) {
      try {
        // Check cache first
        const cached = await prisma.barcodeLookup.findUnique({
          where: { gtin }
        });

        if (cached) {
          gtinData = cached.rawJson as Record<string, unknown>;
          logger.info({ 
            message: 'GTIN found in cache', 
            traceId,
            gtin,
            fromCache: true 
          });
        } else {
          // External GTIN lookup
          const lookupResult = await lookupGtin(gtin);
          
          if (lookupResult.success && lookupResult.data) {
            gtinData = lookupResult.data.rawData;
            
            // Cache the result
            await prisma.barcodeLookup.create({
              data: {
                gtin,
                source: 'upcitemdb',
                brand: lookupResult.data.brand || null,
                name: lookupResult.data.name || null,
                model: lookupResult.data.model || null,
                rawJson: JSON.parse(JSON.stringify(gtinData))
              }
            });
            
            logger.info({ 
              message: 'GTIN lookup successful and cached', 
              traceId,
              gtin,
              brand: lookupResult.data.brand,
              fromCache: false 
            });
          } else {
            logger.warn({ 
              message: 'GTIN lookup failed', 
              traceId,
              gtin,
              error: lookupResult.error 
            });
          }
        }
      } catch (error) {
        logger.error({ 
          message: 'GTIN lookup error', 
          traceId,
          gtin, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // 2. OCR Processing (if images provided)
    if (imageIds && imageIds.length > 0) {
      try {
        // Get image assets from database
        const imageAssets = await prisma.imageAsset.findMany({
          where: {
            id: { in: imageIds },
            userId: userId
          }
        });

        if (imageAssets.length > 0) {
          // TODO: OCR processing requires image data to be stored in database or file system
          // For now, we'll skip OCR processing since image data is not stored in ImageAsset model
          logger.warn({ 
            message: 'OCR processing skipped - image data not available', 
            traceId,
            imageCount: imageAssets.length
          });
          
          // Mock OCR data for development
          ocrData = {
            text: 'OCR processing not yet implemented for stored images',
            confidence: 0.5,
            keyInfo: extractKeyInfoFromOcr('Sample OCR text')
          };
        }
      } catch (error) {
        logger.error({ 
          message: 'OCR processing failed', 
          traceId,
          imageIds, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // 3. LLM Enrichment
    const productData = {
      brand: manual?.brand || (gtinData as Record<string, unknown>)?.brand as string,
      type: manual?.type || (gtinData as Record<string, unknown>)?.category as string,
      model: manual?.model || (gtinData as Record<string, unknown>)?.model as string,
      keySpec: manual?.keySpec,
      category: manual?.category || (gtinData as Record<string, unknown>)?.category as string,
      gtinData: gtinData || undefined,
      ocrText: ocrData?.text,
    };

    const enrichedData = await enrichProductWithLlm(productData);

    logger.info({
      message: 'LLM enrichment completed',
      traceId,
      confidence: enrichedData.confidence,
      hasTitle: !!enrichedData.titleRU,
      hasDescription: !!enrichedData.descriptionRU,
    });

    // 4. Create ProductDraft
    const draft = await prisma.productDraft.create({
      data: {
        userId: userId,
        sku: generateSKU(enrichedData.brand || 'unknown', enrichedData.model || 'unknown'),
        brand: enrichedData.brand || 'Неизвестный бренд',
        type: enrichedData.type || 'Товар',
        model: enrichedData.model || 'Модель',
        keySpec: enrichedData.keySpec || 'Основные характеристики',
        titleRU: enrichedData.titleRU || 'Название товара',
        titleKZ: enrichedData.titleKZ || 'Тауар атауы',
        descRU: enrichedData.descriptionRU || 'Описание товара',
        descKZ: enrichedData.descriptionKZ || 'Тауар сипаттамасы',
        category: enrichedData.category || 'other',
        gtin,
        attributes: enrichedData.attributes || {},
        status: 'draft'
      }
    });

    // 5. Increment usage counter
    await incrementUsage(userId, 'magicFill');

    const processingTime = Date.now() - startTime;

    const result = {
      draftId: draft.id,
      fields: {
        sku: draft.sku,
        brand: draft.brand,
        type: draft.type,
        model: draft.model,
        keySpec: draft.keySpec,
        titleRU: draft.titleRU,
        titleKZ: draft.titleKZ,
        descRU: draft.descRU,
        descKZ: draft.descKZ,
        category: draft.category,
        gtin: draft.gtin,
        attributes: draft.attributes,
      },
      images: imageIds || [],
      metadata: {
        confidence: enrichedData.confidence,
        processingTime,
        traceId,
        sources: {
          gtin: !!gtinData,
          ocr: !!ocrData,
          llm: !!env.OPENAI_API_KEY,
        }
      }
    }

    logger.info({ 
      message: 'Magic Fill completed successfully', 
      traceId,
      userId,
      draftId: result.draftId,
      processingTime,
      confidence: enrichedData.confidence
    });

    return NextResponse.json(result)
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error({
      message: 'Magic Fill failed',
      traceId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime,
    });

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized', traceId },
          { status: 401 }
        );
      }
      if (error.message.includes('Quota exceeded')) {
        return NextResponse.json(
          { error: 'Quota exceeded', code: 'QUOTA_EXCEEDED', traceId },
          { status: 429 }
        );
      }
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body', traceId },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Magic Fill failed', 
        traceId,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to generate SKU
function generateSKU(brand: string, model: string): string {
  const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const cleanModel = model.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return `${cleanBrand}-${cleanModel}`;
}
