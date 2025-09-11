import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'
import { validateEnvironment, getEnvironmentInfo } from '@/lib/server/env-validation'

/**
 * Health check endpoint for uptime monitoring
 * Returns basic system status, database connectivity, and timestamp
 */
export async function GET() {
  const requestId = crypto.randomUUID()
  const log = logger.child({ requestId, endpoint: 'health' })

  try {
    // Validate environment variables
    const envValidation = validateEnvironment()
    
    // Check database connectivity
    let dbStatus = 'unknown'
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (dbError) {
      dbStatus = 'error'
      log.error({ message: 'Database health check failed', dbError })
    }

    // Get environment info
    const envInfo = getEnvironmentInfo()

    const healthData = {
      status: dbStatus === 'connected' && envValidation.valid ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: envInfo.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: dbStatus,
        provider: 'postgresql',
      },
      environment: {
        valid: envValidation.valid,
        errors: envValidation.errors,
        info: envInfo,
      },
      services: {
        auth: envInfo.HAS_GOOGLE_OAUTH ? 'configured' : 'not-configured',
        billing: envInfo.HAS_BILLING ? 'configured' : 'not-configured',
        magicFill: envInfo.HAS_OPENAI ? 'configured' : 'not-configured',
        gtin: envInfo.HAS_GTIN ? 'configured' : 'not-configured',
        analytics: envInfo.HAS_ANALYTICS ? 'configured' : 'not-configured',
      },
    }

    log.info({ message: 'Health check completed', status: healthData.status, dbStatus })
    return NextResponse.json(healthData, { status: 200 })

  } catch (error) {
    log.error({ message: 'Health check failed', error: error instanceof Error ? error.message : 'Unknown error' })
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    )
  }
}
