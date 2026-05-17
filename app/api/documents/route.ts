import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 25,
    });

    return Response.json({
      ok: true,
      route: "documents",
      documents,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load document records.";

    return Response.json(
      {
        ok: false,
        route: "documents",
        documents: [],
        error: message,
      },
      { status: 500 },
    );
  }
}
