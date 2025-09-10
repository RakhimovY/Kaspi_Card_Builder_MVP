import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { getUserIdFromRequest } from '@/lib/server/auth'
import { assertQuota, incrementUsage, assertIpQuota, incrementIpUsage, QuotaError } from '@/lib/server/quota'
import { lookupGtin } from '@/lib/server/gtin-lookup'
import { extractKeyInfoFromOcr } from '@/lib/server/ocr'
import { enrichProductWithLlm } from '@/lib/server/llm'
import { env } from '@/lib/server/env'
import { debugLogger } from '@/lib/server/debug-logger'
import { getClientIp } from '@/lib/server/api-utils'
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
  const ipAddress = getClientIp(request)
  
  // Get authenticated user (optional) - объявляем вне try блока
  let userId: string | null = null

  try {
    userId = await getUserIdFromRequest(request)
    
    // Check quota - для авторизованных пользователей или по IP
    if (userId) {
      await assertQuota(userId, 'magicFill')
    } else {
      await assertIpQuota(ipAddress, 'magicFill')
    }

    const body = await request.json()
    const validationResult = magicFillSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('Magic Fill validation failed:', validationResult.error.errors)
      
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
    
    // Дополнительная проверка - если manual данные пришли, но мы в режиме Magic Fill, игнорируем их
    if (manual && Object.values(manual).some(v => v && String(v).trim())) {
      console.warn('Manual data received in Magic Fill mode, ignoring it');
    }

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
            
          } else {
            console.warn('GTIN lookup failed:', lookupResult.error);
          }
        }
      } catch (error) {
        console.error('GTIN lookup error:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // 2. OCR Processing (if images provided)
    if (imageIds && imageIds.length > 0) {
      try {
        // Get image assets from database (только для авторизованных пользователей)
        const imageAssets = userId ? await prisma.imageAsset.findMany({
          where: {
            id: { in: imageIds },
            userId: userId
          }
        }) : [];

        if (imageAssets.length > 0) {
          // OCR processing requires image data to be stored in database or file system
          // For now, we'll skip OCR processing since image data is not stored in ImageAsset model
          
          // Mock OCR data for development
          ocrData = {
            text: 'OCR processing not yet implemented for stored images',
            confidence: 0.5,
            keyInfo: extractKeyInfoFromOcr('Sample OCR text')
          };
        }
      } catch (error) {
        console.error('OCR processing failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // 3. LLM Enrichment
    const gtinItems = gtinData && (gtinData as Record<string, unknown>)?.items as Array<Record<string, unknown>>;
    const hasGtinData = gtinItems && gtinItems.length > 0 && gtinItems[0]?.brand;
    
    const productData = hasGtinData ? {
      brand: gtinItems[0]?.brand as string,
      type: gtinItems[0]?.title as string,
      model: gtinItems[0]?.model as string,
      keySpec: gtinItems[0]?.description as string,
      category: gtinItems[0]?.category as string,
      gtinData: gtinData || undefined,
      ocrText: ocrData?.text,
    } : {
      brand: manual?.brand || undefined,
      type: manual?.type || undefined,
      model: manual?.model || undefined,
      keySpec: manual?.keySpec || undefined,
      category: manual?.category || undefined,
      gtinData: undefined,
      ocrText: ocrData?.text,
    };

    const enrichedData = await enrichProductWithLlm(productData);

    // 4. Create ProductDraft
    let draft = null;
    if (userId) {
      draft = await prisma.productDraft.create({
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
    }

    // 5. Increment usage counter
    if (userId) {
      await incrementUsage(userId, 'magicFill');
    } else {
      await incrementIpUsage(ipAddress, 'magicFill');
    }

    const processingTime = Date.now() - startTime;

    const result = {
      draftId: draft?.id || null,
      fields: {
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
      },
      images: imageIds || [],
      metadata: {
        confidence: enrichedData.confidence,
        processingTime,
        traceId,
        isAuthenticated: !!userId,
        dataSource: hasGtinData ? 'GTIN' : 'MANUAL',
        sources: {
          gtin: !!gtinData,
          ocr: !!ocrData,
          llm: !!env.OPENAI_API_KEY,
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Magic Fill failed:', error instanceof Error ? error.message : 'Unknown error');

    // Return appropriate error response
    if (error instanceof QuotaError) {
      const isAnonymous = !userId;
      const message = isAnonymous 
        ? `Вы использовали все бесплатные попытки (${error.limit}) для этого IP-адреса. Зарегистрируйтесь для получения большего лимита.`
        : `Вы превысили лимит использования (${error.current}/${error.limit}). Обновите подписку для увеличения лимита.`;
      
      return NextResponse.json(
        { 
          error: message,
          code: 'QUOTA_EXCEEDED',
          isAnonymous,
          current: error.current,
          limit: error.limit,
          traceId 
        },
        { status: 429 }
      );
    }
    
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { 
            error: 'Неверный формат данных запроса', 
            code: 'INVALID_JSON',
            traceId 
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { 
            error: 'Ошибка валидации данных', 
            code: 'VALIDATION_ERROR',
            traceId 
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Произошла ошибка при обработке запроса. Попробуйте еще раз.', 
        code: 'INTERNAL_ERROR',
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
