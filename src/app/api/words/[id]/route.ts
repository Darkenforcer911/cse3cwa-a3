import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return Response.json({ error: "Invalid word ID" }, { status: 400 });
    }

    const word = await prisma.word.findUnique({
      where: { id: wordId },
      include: {
        phonemes: {
          orderBy: { position: "asc" },
        },
        activity: true,
      },
    });

    if (!word) {
      return Response.json({ error: "Word not found" }, { status: 404 });
    }

    return Response.json(word, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch word:", error);
    return Response.json(
      { error: "Failed to fetch word" },
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
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return Response.json({ error: "Invalid word ID" }, { status: 400 });
    }

    const existingWord = await prisma.word.findUnique({
      where: { id: wordId },
    });

    if (!existingWord) {
      return Response.json({ error: "Word not found" }, { status: 404 });
    }

    const body = await request.json();

    if (
      body.phonemes !== undefined &&
      (!Array.isArray(body.phonemes) || body.phonemes.length === 0)
    ) {
      return Response.json(
        { error: "At least one phoneme is required" },
        { status: 400 }
      );
    }

    if (Array.isArray(body.phonemes)) {
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
    }

    const word = await prisma.$transaction(async (tx) => {
      if (body.phonemes !== undefined) {
        await tx.phoneme.deleteMany({
          where: { wordId },
        });
      }

      return tx.word.update({
        where: { id: wordId },
        data: {
          ...(body.englishWord !== undefined && {
            englishWord: body.englishWord.trim(),
          }),
          ...(body.hint !== undefined && {
            hint: body.hint?.trim() || null,
          }),

          ...(body.phonemes !== undefined && {
            phonemes: {
              create: body.phonemes.map(
                (symbol: string, index: number) => ({
                  symbol: symbol.trim(),
                  position: index,
                })
              ),
            },
          }),
        },

        include: {
          phonemes: {
            orderBy: { position: "asc" },
          },
          activity: true,
        },
      });
    });

    return Response.json(word, { status: 200 });
  } catch (error) {
    console.error("Failed to update word:", error);

    return Response.json(
      { error: "Failed to update word" },
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
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return Response.json({ error: "Invalid word ID" }, { status: 400 });
    }

    const existingWord = await prisma.word.findUnique({
      where: { id: wordId },
    });

    if (!existingWord) {
      return Response.json({ error: "Word not found" }, { status: 404 });
    }

    await prisma.word.delete({
      where: { id: wordId },
    });

    return Response.json(
      { message: "Word deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete word:", error);

    return Response.json(
      { error: "Failed to delete word" },
      { status: 500 }
    );
  }
}