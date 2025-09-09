import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { z } from 'zod'

const magicFillSchema = z.object({
  gtin: z.string().optional(),
  imageIds: z.array(z.string()).optional(),
  manual: z.object({
    brand: z.string().optional(),
    type: z.string().optional(),
    model: z.string().optional(),
    keySpec: z.string().optional(),
    category: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gtin, imageIds, manual } = magicFillSchema.parse(body)
    
    // Mock user ID for now
    const userId = 'temp-user-id'

    console.log({ message: 'Magic Fill request', gtin, imageIds: imageIds?.length, manual })

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
          console.log({ message: 'GTIN found in cache', gtin });
        } else {
          // TODO: Implement external GTIN lookup (GS1 API, etc.)
          // For now, create a mock entry
          gtinData = {
            brand: 'Sample Brand',
            name: 'Sample Product',
            model: 'Sample Model',
            category: 'electronics'
          };

          // Cache the result
          await prisma.barcodeLookup.create({
            data: {
              gtin,
              source: 'mock',
              brand: gtinData.brand,
              name: gtinData.name,
              model: gtinData.model,
              rawJson: gtinData
            }
          });
          console.log({ message: 'GTIN cached', gtin });
        }
      } catch (error) {
        console.error({ message: 'GTIN lookup failed', gtin, error });
      }
    }

    // 2. OCR Processing (if images provided)
    if (imageIds && imageIds.length > 0) {
      try {
        // TODO: Implement OCR processing
        // For now, return mock OCR data
        ocrData = {
          text: 'Sample OCR text from image',
          confidence: 0.85
        };
        console.log({ message: 'OCR processing completed', imageCount: imageIds.length });
      } catch (error) {
        console.error({ message: 'OCR processing failed', imageIds, error });
      }
    }

    // 3. Generate product data
    const brand = (gtinData as Record<string, unknown>)?.brand as string || manual?.brand || 'Неизвестный бренд';
    const type = (gtinData as Record<string, unknown>)?.category as string || manual?.type || 'Товар';
    const model = (gtinData as Record<string, unknown>)?.model as string || manual?.model || 'Модель';
    const keySpec = manual?.keySpec || 'Основные характеристики';
    const category = (gtinData as Record<string, unknown>)?.category as string || manual?.category || 'other';

    // 4. Generate titles and descriptions
    const titleRU = `${type} ${brand} ${model} ${keySpec}`.trim();
    const titleKZ = `${type} ${brand} ${model} ${keySpec}`.trim(); // TODO: Translate to Kazakh

    const descRU = `• Высокое качество и надежность
• Современный дизайн
• Удобство в использовании
• Соответствие стандартам

Характеристики:
• Бренд: ${brand}
• Модель: ${model}
• Тип: ${type}
${keySpec ? `• Особенности: ${keySpec}` : ''}`;

    const descKZ = `• Жоғары сапа және сенімділік
• Заманауи дизайн
• Пайдалануға ыңғайлы
• Стандарттарға сәйкестік

Сипаттамалар:
• Бренд: ${brand}
• Модель: ${model}
• Түрі: ${type}
${keySpec ? `• Ерекшеліктері: ${keySpec}` : ''}`;

    // 5. Generate attributes based on category
    const attributes = generateAttributesByCategory(category, { brand, type, model, keySpec });

    // 6. Create ProductDraft
    const draft = await prisma.productDraft.create({
      data: {
        userId: userId!,
        sku: generateSKU(brand, model),
        brand,
        type,
        model,
        keySpec,
        titleRU,
        titleKZ,
        descRU,
        descKZ,
        category,
        gtin,
        attributes: attributes,
        status: 'draft'
      }
    });

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
    }

    console.log({ message: 'Magic Fill completed', draftId: result.draftId })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Magic Fill error:', error)
    return NextResponse.json(
      { error: 'Magic Fill failed' },
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

// Helper function to generate attributes by category
function generateAttributesByCategory(category: string, data: Record<string, string>) {
  const baseAttributes = {
    brand: data.brand,
    model: data.model,
    type: data.type,
  };

  switch (category) {
    case 'electronics':
      return {
        ...baseAttributes,
        power: '220В, 50-60Гц',
        warranty: '12 месяцев',
        country: 'Китай',
        cert: 'EAC, ТР ТС'
      };
    case 'clothing':
      return {
        ...baseAttributes,
        material: 'Хлопок 100%',
        care: 'Машинная стирка',
        country: 'Китай',
        season: 'Всесезонный'
      };
    case 'cosmetics':
      return {
        ...baseAttributes,
        volume: '50мл',
        shelfLife: '36 месяцев',
        country: 'Китай',
        cert: 'ТР ТС'
      };
    default:
      return baseAttributes;
  }
}
