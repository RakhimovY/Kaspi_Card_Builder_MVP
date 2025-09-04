import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/auth-config";
import { prisma } from "@/lib/server/prisma";
import { logger } from "@/lib/server/logger";

export async function POST(request: NextRequest) {
  const log = logger.child({ endpoint: "mock-purchase-pro" });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: { in: ["active", "past_due"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active pro subscription
    const activeSubscription = user.subscriptions[0];
    if (
      activeSubscription &&
      activeSubscription.plan === "pro" &&
      activeSubscription.status === "active"
    ) {
      return NextResponse.json(
        {
          error: "User already has an active Pro subscription",
          subscription: activeSubscription,
        },
        { status: 400 }
      );
    }

    // Cancel any existing subscriptions
    if (activeSubscription) {
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          status: "canceled",
          cancelAtPeriodEnd: true,
          updatedAt: new Date(),
        },
      });
    }

    // Create new Pro subscription (mock data)
    const now = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // 1 month from now

    const newSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        provider: "mock",
        providerId: `mock_${Date.now()}`, // Mock external ID
        plan: "pro",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        customerId: `mock_customer_${user.id}`,
        metadata: {
          mockPurchase: true,
          purchaseDate: now.toISOString(),
          amount: 2900, // 29 USD in cents
          currency: "USD",
        },
      },
    });

    // Update user's Lemon Squeezy customer ID (mock)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lemonSqueezyCustomerId: `mock_customer_${user.id}`,
      },
    });

    // Initialize usage stats for current month if not exists
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
    await prisma.usageStat.upsert({
      where: {
        userId_periodYM: {
          userId: user.id,
          periodYM: currentMonth,
        },
      },
      update: {}, // Don't change existing stats
      create: {
        userId: user.id,
        periodYM: currentMonth,
        magicFillCount: 0,
        photosProcessed: 0,
        exportCount: 0,
      },
    });

    log.info({
      message: "Mock Pro subscription created successfully",
      userId: user.id,
      subscriptionId: newSubscription.id,
    });

    return NextResponse.json({
      success: true,
      message: "Pro subscription activated successfully!",
      subscription: {
        id: newSubscription.id,
        provider: newSubscription.provider,
        plan: newSubscription.plan,
        status: newSubscription.status,
        currentPeriodStart: newSubscription.currentPeriodStart,
        currentPeriodEnd: newSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: newSubscription.cancelAtPeriodEnd,
      },
    });
  } catch (error) {
    log.error({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
