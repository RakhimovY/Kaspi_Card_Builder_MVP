import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../lib/server/prisma'

describe('Prisma Database Connection', () => {
  beforeAll(async () => {
    // Ensure database is ready
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should connect to database successfully', async () => {
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    expect(result).toEqual([{ test: 1 }])
  })

  it('should have correct database schema', async () => {
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('User', 'Account', 'Session', 'ProductDraft', 'ImageAsset')
    `
    
    const tableNames = (tables as any[]).map(t => t.name)
    expect(tableNames).toContain('User')
    expect(tableNames).toContain('Account')
    expect(tableNames).toContain('Session')
    expect(tableNames).toContain('ProductDraft')
    expect(tableNames).toContain('ImageAsset')
  })

  it('should handle basic CRUD operations', async () => {
    // Test creating a user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe('test@example.com')
    expect(user.name).toBe('Test User')

    // Test reading the user
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    expect(foundUser).toBeDefined()
    expect(foundUser?.email).toBe('test@example.com')

    // Clean up
    await prisma.user.delete({
      where: { id: user.id }
    })
  })
})
