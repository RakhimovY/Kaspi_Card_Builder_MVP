import { prisma } from "./prisma";
import { logger } from "./logger";

export interface QuotaConfig {
  free: {
    photosPerMonth: number;
    magicFillPerMonth: number;
    exportPerMonth: number;
  };
  pro: {
    photosPerMonth: number;
    magicFillPerMonth: number;
    exportPerMonth: number;
  };
}

export const DEFAULT_QUOTAS: QuotaConfig = {
  free: {
    photosPerMonth: 50,
    magicFillPerMonth: 10,
    exportPerMonth: 5,
  },
  pro: {
    photosPerMonth: 500,
    magicFillPerMonth: 100,
    exportPerMonth: 50,
  },
};

export class QuotaError extends Error {
  constructor(
    message: string,
    public code: "QUOTA_EXCEEDED" | "SUBSCRIPTION_REQUIRED",
    public feature: string,
    public current: number,
    public limit: number
  ) {
    super(message);
    this.name = "QuotaError";
  }
}

export async function assertQuota(
  userId: string,
  feature: "photos" | "magicFill" | "export" | "imageProcessing"
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      usageStats: {
        where: {
          periodYM: getCurrentPeriod(),
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const plan = user.subscriptions[0]?.plan || "free";
  const quotas = DEFAULT_QUOTAS[plan as keyof QuotaConfig];
  const usage = user.usageStats[0] || {
    photosProcessed: 0,
    magicFillCount: 0,
    exportCount: 0,
  };

  let current: number;
  let limit: number;

  switch (feature) {
    case "photos":
    case "imageProcessing":
      current = usage.photosProcessed;
      limit = quotas.photosPerMonth;
      break;
    case "magicFill":
      current = usage.magicFillCount;
      limit = quotas.magicFillPerMonth;
      break;
    case "export":
      current = usage.exportCount;
      limit = quotas.exportPerMonth;
      break;
    default:
      throw new Error(`Unknown feature: ${feature}`);
  }

  if (current >= limit) {
    throw new QuotaError(
      `Quota exceeded for ${feature}`,
      "QUOTA_EXCEEDED",
      feature,
      current,
      limit
    );
  }

  // logger.info({
  //   message: "Quota check passed",
  //   userId,
  //   feature,
  //   plan,
  //   current,
  //   limit,
  // });
  console.log("Quota check passed", { userId, feature, plan, current, limit });
}

export async function incrementUsage(
  userId: string,
  feature: "photos" | "magicFill" | "export" | "imageProcessing",
  count: number = 1
): Promise<void> {
  const periodYM = getCurrentPeriod();

  await prisma.usageStat.upsert({
    where: {
      userId_periodYM: {
        userId,
        periodYM,
      },
    },
    update: {
      [feature === "photos" || feature === "imageProcessing"
        ? "photosProcessed"
        : feature === "magicFill"
        ? "magicFillCount"
        : "exportCount"]: {
        increment: count,
      },
    },
    create: {
      userId,
      periodYM,
      [feature === "photos" || feature === "imageProcessing"
        ? "photosProcessed"
        : feature === "magicFill"
        ? "magicFillCount"
        : "exportCount"]: count,
    },
  });

  // logger.info({
  //   message: "Usage incremented",
  //   userId,
  //   feature,
  //   count,
  //   periodYM,
  // });
  console.log("Usage incremented", { userId, feature, count, periodYM });
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
