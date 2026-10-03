import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return Response.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        words: {
          include: {
            phonemes: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    if (!activity) {
      return Response.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return Response.json(activity, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch activity:", error);

    return Response.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

 export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return Response.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!existingActivity) {
      return Response.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (
      body.type !== undefined &&
      !["WORDLE", "WORD_SEARCH"].includes(body.type)
    ) {
      return Response.json(
        { error: "Activity type must be WORDLE or WORD_SEARCH" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.update({
      where: {
        id: activityId,
      },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.difficulty !== undefined && {
          difficulty: body.difficulty,
        }),
        ...(body.showHints !== undefined && {
          showHints: body.showHints,
        }),
        ...(body.maxGuesses !== undefined && {
          maxGuesses: body.maxGuesses,
        }),
        ...(body.gridSize !== undefined && {
          gridSize: body.gridSize,
        }),
      },
      include: {
        words: {
          include: {
            phonemes: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    return Response.json(activity, { status: 200 });
  } catch (error) {
    console.error("Failed to update activity:", error);

    return Response.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return Response.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!existingActivity) {
      return Response.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    await prisma.activity.delete({
      where: {
        id: activityId,
      },
    });

    return Response.json(
      { message: "Activity deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete activity:", error);

    return Response.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}