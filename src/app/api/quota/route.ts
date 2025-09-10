import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/server/auth'
import { getClientIp } from '@/lib/server/api-utils'
import { prisma } from '@/lib/server/prisma'
import { DEFAULT_QUOTAS } from '@/lib/server/quota'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature') as 'magicFill' | 'photos' | 'export' | 'imageProcessing'
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature parameter is required' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    const ipAddress = getClientIp(request)
    const periodYM = getCurrentPeriod()

    if (userId) {
      // Авторизованный пользователь
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            where: { status: "active" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          usageStats: {
            where: { periodYM },
          },
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const plan = user.subscriptions[0]?.plan || "free"
      const quotas = DEFAULT_QUOTAS[plan as keyof typeof DEFAULT_QUOTAS]
      const usage = user.usageStats[0] || {
        photosProcessed: 0,
        magicFillCount: 0,
        exportCount: 0,
      }

      let current: number
      let limit: number

      switch (feature) {
        case "photos":
        case "imageProcessing":
          current = usage.photosProcessed
          limit = quotas.photosPerMonth
          break
        case "magicFill":
          current = usage.magicFillCount
          limit = quotas.magicFillPerMonth
          break
        case "export":
          current = usage.exportCount
          limit = quotas.exportPerMonth
          break
        default:
          return NextResponse.json(
            { error: 'Unknown feature' },
            { status: 400 }
          )
      }

      return NextResponse.json({
        isAuthenticated: true,
        current,
        limit,
        feature,
        plan,
        remaining: limit - current
      })
    } else {
      // Неавторизованный пользователь - проверяем IP-квоты
      const quotas = DEFAULT_QUOTAS.anonymous
      
      const ipQuota = await prisma.ipQuota.findUnique({
        where: {
          ipAddress_periodYM: {
            ipAddress,
            periodYM,
          },
        },
      })

      const usage = ipQuota || {
        magicFillCount: 0,
        photosProcessed: 0,
        exportCount: 0,
      }

      let current: number
      let limit: number

      switch (feature) {
        case "photos":
        case "imageProcessing":
          current = usage.photosProcessed
          limit = quotas.photosPerMonth
          break
        case "magicFill":
          current = usage.magicFillCount
          limit = quotas.magicFillPerMonth
          break
        case "export":
          current = usage.exportCount
          limit = quotas.exportPerMonth
          break
        default:
          return NextResponse.json(
            { error: 'Unknown feature' },
            { status: 400 }
          )
      }

      return NextResponse.json({
        isAuthenticated: false,
        current,
        limit,
        feature,
        plan: 'anonymous',
        remaining: limit - current
      })
    }
  } catch (error) {
    console.error('Quota info error:', error)
    return NextResponse.json(
      { error: 'Failed to get quota info' },
      { status: 500 }
    )
  }
}

function getCurrentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}
