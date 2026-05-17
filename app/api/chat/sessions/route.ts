import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 30,
    });

    return Response.json({
      ok: true,
      sessions,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load chat sessions.";

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await prisma.chatSession.create({
      data: {
        title: "New chat",
      },
    });

    return Response.json({
      ok: true,
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create chat session.";

    return Response.json({ error: message }, { status: 500 });
  }
}
