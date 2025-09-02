import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'
import { z } from 'zod'

const draftSchema = z.object({
  sku: z.string(),
  brand: z.string().optional(),
  type: z.string().optional(),
  model: z.string().optional(),
  keySpec: z.string().optional(),
  titleRU: z.string().optional(),
  titleKZ: z.string().optional(),
  descRU: z.string().optional(),
  descKZ: z.string().optional(),
  category: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  gtin: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = logger.child({ requestId, endpoint: 'product-drafts', method: 'GET' })

  try {
    // TODO: Get userId from session
    const userId = 'temp-user-id' // Placeholder
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const drafts = await prisma.productDraft.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        images: true,
      },
    })

    log.info({ message: 'Drafts retrieved', count: drafts.length, userId })
    return NextResponse.json({ drafts })

  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = logger.child({ requestId, endpoint: 'product-drafts', method: 'POST' })

  try {
    const body = await request.json()
    const draftData = draftSchema.parse(body)

    // TODO: Get userId from session
    const userId = 'temp-user-id' // Placeholder

    const draft = await prisma.productDraft.create({
      data: {
        ...draftData,
        userId,
        attributes: draftData.attributes ? JSON.parse(JSON.stringify(draftData.attributes)) : null,
      },
      include: {
        images: true,
      },
    })

    log.info({ message: 'Draft created', draftId: draft.id, userId })
    return NextResponse.json({ draft }, { status: 201 })

  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : 'Unknown error' })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
