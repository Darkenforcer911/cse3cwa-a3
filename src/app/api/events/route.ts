import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.usageEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(events, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch usage events:", error);

    return Response.json(
      { error: "Failed to fetch usage events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.eventType || typeof body.eventType !== "string") {
      return Response.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    const event = await prisma.usageEvent.create({
      data: {
        eventType: body.eventType,
        activityType: body.activityType ?? null,
        page: body.page ?? null,
        durationMs: body.durationMs ?? null,
        success: body.success ?? null,
        message: body.message ?? null,
      },
    });

    return Response.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create usage event:", error);

    return Response.json(
      { error: "Failed to create usage event" },
      { status: 500 }
    );
  }
}