import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/server/prisma'

describe('Prisma Client', () => {
  it('should have correct models', () => {
    expect(prisma.user).toBeDefined()
    expect(prisma.subscription).toBeDefined()
    expect(prisma.productDraft).toBeDefined()
    expect(prisma.imageAsset).toBeDefined()
    expect(prisma.barcodeLookup).toBeDefined()
  })

  it('should have correct model methods', () => {
    expect(typeof prisma.user.findMany).toBe('function')
    expect(typeof prisma.user.create).toBe('function')
    expect(typeof prisma.user.update).toBe('function')
    expect(typeof prisma.user.delete).toBe('function')
  })
})
