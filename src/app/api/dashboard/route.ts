import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalActivities,
      wordleCount,
      wordSearchCount,
      totalWords,
      successfulGenerations,
      failedGenerations,
      timeEvents,
      usageEvents,
      recentEvents,
    ] = await Promise.all([
      prisma.activity.count(),

      prisma.activity.count({
        where: { type: "WORDLE" },
      }),

      prisma.activity.count({
        where: { type: "WORD_SEARCH" },
      }),

      prisma.word.count(),

      prisma.usageEvent.count({
        where: {
          eventType: "GENERATION_SUCCESS",
        },
      }),

      prisma.usageEvent.count({
        where: {
          eventType: "GENERATION_FAILED",
        },
      }),

      prisma.usageEvent.findMany({
        where: {
          eventType: "TIME_ON_PAGE",
          durationMs: {
            not: null,
          },
        },
      }),

      prisma.usageEvent.findMany({
        where: {
          activityType: {
            not: null,
          },
        },
      }),

      prisma.usageEvent.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    const totalDuration = timeEvents.reduce(
      (sum, event) => sum + (event.durationMs ?? 0),
      0
    );

    const averageTimeMs =
      timeEvents.length > 0
        ? Math.round(totalDuration / timeEvents.length)
        : 0;

    const typeCounts: Record<string, number> = {};

    usageEvents.forEach((event) => {
      if (!event.activityType) return;

      typeCounts[event.activityType] =
        (typeCounts[event.activityType] ?? 0) + 1;
    });

    let mostUsedActivityType: string | null = null;

    for (const [type, count] of Object.entries(typeCounts)) {
      if (
        mostUsedActivityType === null ||
        count > typeCounts[mostUsedActivityType]
      ) {
        mostUsedActivityType = type;
      }
    }

    return Response.json(
      {
        health: "healthy",
        totalActivities,
        wordleCount,
        wordSearchCount,
        totalWords,
        successfulGenerations,
        failedGenerations,
        totalGenerated:
          successfulGenerations + failedGenerations,
        averageTimeMs,
        mostUsedActivityType,
        recentEvents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load dashboard metrics:", error);

    return Response.json(
      {
        health: "unhealthy",
        error: "Failed to load dashboard metrics",
      },
      { status: 500 }
    );
  }
}
