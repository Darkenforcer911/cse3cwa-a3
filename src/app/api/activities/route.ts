import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        words: {
          include: {
            phonemes: true,
          },
        },
      },
    });

    return Response.json(activities, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch activities:", error);

    return Response.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return Response.json(
        { error: "Activity name is required" },
        { status: 400 }
      );
    }

    if (!["WORDLE", "WORD_SEARCH"].includes(body.type)) {
      return Response.json(
        { error: "Activity type must be WORDLE or WORD_SEARCH" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.words) || body.words.length === 0) {
      return Response.json(
        { error: "At least one word is required" },
        { status: 400 }
      );
    }

    for (const word of body.words) {
      if (!word.englishWord || typeof word.englishWord !== "string") {
        return Response.json(
          { error: "Each word must have an English word" },
          { status: 400 }
        );
      }

      if (!Array.isArray(word.phonemes) || word.phonemes.length === 0) {
        return Response.json(
          { error: `Phonemes are required for ${word.englishWord}` },
          { status: 400 }
        );
      }
    }

    const activity = await prisma.activity.create({
      data: {
        name: body.name,
        type: body.type,
        difficulty: body.difficulty ?? "medium",
        showHints: body.showHints ?? true,
        maxGuesses: body.maxGuesses ?? null,
        gridSize: body.gridSize ?? null,

        words: {
          create: body.words.map(
            (word: {
              englishWord: string;
              hint?: string;
              phonemes: string[];
            }) => ({
              englishWord: word.englishWord,
              hint: word.hint ?? null,

              phonemes: {
                create: word.phonemes.map((symbol, index) => ({
                  symbol,
                  position: index,
                })),
              },
            })
          ),
        },
      },

      include: {
        words: {
          include: {
            phonemes: true,
          },
        },
      },
    });

    try {
  await prisma.usageEvent.create({
    data: {
      eventType: "ACTIVITY_CREATED",
      activityType: activity.type,
      success: true,
      message: `${activity.name} created`,
    },
  });
} catch (metricError) {
  console.error("Failed to record activity creation metric:", metricError);
}

    return Response.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);

    return Response.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}