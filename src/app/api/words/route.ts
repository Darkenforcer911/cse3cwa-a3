import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const words = await prisma.word.findMany({
      include: {
        phonemes: {
          orderBy: {
            position: "asc",
          },
        },
        activity: true,
      },
    });

    return Response.json(words, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch words:", error);

    return Response.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const activityId = Number(body.activityId);

    if (!Number.isInteger(activityId)) {
      return Response.json(
        { error: "A valid activity ID is required" },
        { status: 400 }
      );
    }

    if (!body.englishWord || typeof body.englishWord !== "string") {
      return Response.json(
        { error: "English word is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.phonemes) || body.phonemes.length === 0) {
      return Response.json(
        { error: "At least one phoneme is required" },
        { status: 400 }
      );
    }

    const invalidPhoneme = body.phonemes.some(
      (phoneme: unknown) =>
        typeof phoneme !== "string" || phoneme.trim().length === 0
    );

    if (invalidPhoneme) {
      return Response.json(
        { error: "Phonemes must be valid non-empty strings" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return Response.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const word = await prisma.word.create({
      data: {
        englishWord: body.englishWord.trim(),
        hint: body.hint?.trim() || null,
        activityId,

        phonemes: {
          create: body.phonemes.map((symbol: string, index: number) => ({
            symbol: symbol.trim(),
            position: index,
          })),
        },
      },

      include: {
        phonemes: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return Response.json(word, { status: 201 });
  } catch (error) {
    console.error("Failed to create word:", error);

    return Response.json(
      { error: "Failed to create word" },
      { status: 500 }
    );
  }
}