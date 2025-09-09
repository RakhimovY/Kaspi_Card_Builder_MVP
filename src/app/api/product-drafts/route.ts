import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { createApiContext, handleApiError } from '@/lib/server/api-utils'
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
  const context = createApiContext(request, 'product-drafts', 'GET')
  const { log } = context

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const drafts = await prisma.productDraft.findMany({
      where: {
        userId: context.userId,
        ...(status && { status }),
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        images: true,
      },
    })

    log.info({ message: 'Drafts retrieved', count: drafts.length })
    return NextResponse.json({ drafts })

  } catch (error) {
    return handleApiError(error, log)
  }
}

export async function POST(request: NextRequest) {
  const context = createApiContext(request, 'product-drafts', 'POST')
  const { log } = context

  try {
    const body = await request.json()
    const draftData = draftSchema.parse(body)

    const draft = await prisma.productDraft.create({
      data: {
        ...draftData,
        userId: context.userId,
        attributes: draftData.attributes ? JSON.parse(JSON.stringify(draftData.attributes)) : null,
      },
      include: {
        images: true,
      },
    })

    log.info({ message: 'Draft created', draftId: draft.id })
    return NextResponse.json({ draft }, { status: 201 })

  } catch (error) {
    return handleApiError(error, log)
  }
}
