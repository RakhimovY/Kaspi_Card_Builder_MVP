import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { createApiContext, handleApiError } from '@/lib/server/api-utils'
import { z } from 'zod'

const updateDraftSchema = z.object({
  sku: z.string().optional(),
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
  variantsJson: z.record(z.string(), z.unknown()).optional(),
  gtin: z.string().optional(),
  status: z.enum(['draft', 'ready', 'exported']).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = createApiContext(request, 'product-drafts-patch', 'PATCH')
  const { log } = context

  try {
    const { id } = await params
    const body = await request.json()
    const updateData = updateDraftSchema.parse(body)

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.productDraft.findFirst({
      where: {
        id,
        userId: context.userId,
      },
    })

    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Update the draft
    const updatedDraft = await prisma.productDraft.update({
      where: { id },
      data: {
        ...updateData,
        attributes: updateData.attributes ? JSON.parse(JSON.stringify(updateData.attributes)) : undefined,
        variantsJson: updateData.variantsJson ? JSON.parse(JSON.stringify(updateData.variantsJson)) : undefined,
      },
      include: {
        images: true,
      },
    })

    log.info({ message: 'Draft updated', draftId: id })
    return NextResponse.json({ draft: updatedDraft })

  } catch (error) {
    return handleApiError(error, log)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = createApiContext(request, 'product-drafts-get', 'GET')
  const { log } = context

  try {
    const { id } = await params

    const draft = await prisma.productDraft.findFirst({
      where: {
        id,
        userId: context.userId,
      },
      include: {
        images: true,
      },
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    log.info({ message: 'Draft retrieved', draftId: id })
    return NextResponse.json({ draft })

  } catch (error) {
    return handleApiError(error, log)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = createApiContext(request, 'product-drafts-delete', 'DELETE')
  const { log } = context

  try {
    const { id } = await params

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.productDraft.findFirst({
      where: {
        id,
        userId: context.userId,
      },
    })

    if (!existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Delete the draft (cascade will handle related images)
    await prisma.productDraft.delete({
      where: { id },
    })

    log.info({ message: 'Draft deleted', draftId: id })
    return NextResponse.json({ success: true })

  } catch (error) {
    return handleApiError(error, log)
  }
}
