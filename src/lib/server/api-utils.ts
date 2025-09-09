import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'
import { assertQuota, incrementUsage } from './quota'
import { z } from 'zod'

export interface ApiHandlerOptions {
  requireAuth?: boolean
  requireQuota?: string
  incrementUsage?: string
}

export interface ApiContext {
  requestId: string
  log: any
  userId?: string
}

/**
 * Создает контекст для API обработчика
 */
export function createApiContext(
  request: NextRequest,
  endpoint: string,
  method: string = 'POST'
): ApiContext {
  const requestId = crypto.randomUUID()
  const log = logger.child({ requestId, endpoint, method })
  
  return {
    requestId,
    log,
    userId: 'temp-user-id' // TODO: Get from session
  }
}

/**
 * Обрабатывает ошибки API и возвращает соответствующий ответ
 */
export function handleApiError(
  error: unknown,
  log: any
): NextResponse {
  log.error({ error: error instanceof Error ? error.message : 'Unknown error' })
  
  if (error instanceof Error && error.name === 'QuotaError') {
    return NextResponse.json(
      { error: 'Quota exceeded', code: 'QUOTA_EXCEEDED' },
      { status: 429 }
    )
  }

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

/**
 * Выполняет проверки квот и авторизации
 */
export async function performApiChecks(
  context: ApiContext,
  options: ApiHandlerOptions
): Promise<NextResponse | null> {
  const { log, userId } = context

  if (options.requireAuth && !userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  if (options.requireQuota && userId) {
    try {
      await assertQuota(userId, options.requireQuota)
    } catch (error) {
      return handleApiError(error, log)
    }
  }

  return null
}

/**
 * Инкрементирует использование после успешной операции
 */
export async function incrementApiUsage(
  context: ApiContext,
  usageType: string
): Promise<void> {
  const { userId } = context
  if (userId) {
    await incrementUsage(userId, usageType)
  }
}

/**
 * Базовый обработчик API с общими проверками
 */
export async function createApiHandler<T>(
  handler: (context: ApiContext, data: T) => Promise<NextResponse>,
  schema: z.ZodSchema<T>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = createApiContext(request, 'api-handler')
    const { log } = context

    try {
      // Парсим тело запроса
      const body = await request.json()
      const data = schema.parse(body)

      // Выполняем проверки
      const checkResult = await performApiChecks(context, options)
      if (checkResult) {
        return checkResult
      }

      // Выполняем основную логику
      const result = await handler(context, data)

      // Инкрементируем использование
      if (options.incrementUsage) {
        await incrementApiUsage(context, options.incrementUsage)
      }

      return result

    } catch (error) {
      return handleApiError(error, log)
    }
  }
}
