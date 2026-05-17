import { prisma } from "@/lib/prisma";
import { retrieveRelevantChunks } from "@/lib/retrieval";
import Groq from "groq-sdk";

async function getOrCreateSession(sessionId?: string, fallbackTitle = "New chat") {
  if (sessionId) {
    const existing = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (existing) {
      return existing;
    }
  }

  return prisma.chatSession.create({
    data: {
      title: fallbackTitle,
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({
        ok: true,
        messages: [],
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100,
    });

    return Response.json({
      ok: true,
      messages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load chat history.";

    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { message, sessionId } = (await request.json()) as {
      message?: string;
      sessionId?: string;
    };

    if (!message?.trim()) {
      return Response.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    let retrievedChunks = [] as Awaited<ReturnType<typeof retrieveRelevantChunks>>;
    let retrievalWarning = "";

    try {
      retrievedChunks = await retrieveRelevantChunks(message);
    } catch (error) {
      retrievalWarning =
        error instanceof Error
          ? error.message
          : "Vector retrieval failed. Continuing without document context.";
    }

    const context = retrievedChunks
      .map((chunk, index) => {
        const payload = chunk.payload as { text?: string; fileName?: string };
        return `Chunk ${index + 1} (${payload.fileName ?? "document"}):\n${payload.text ?? ""}`;
      })
      .join("\n\n");

    const session = await getOrCreateSession(
      sessionId,
      message.trim().slice(0, 48) || "New chat",
    );

    const recentMessages = await prisma.chatMessage.findMany({
      where: {
        sessionId: session.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
    });

    const historyText = recentMessages
      .reverse()
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
      .join("\n");

    const groq = new Groq({ apiKey: process.env.LAW_AI });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a precise legal document assistant for Shivam. Use only the retrieved document context when answering. If the answer is not in the retrieved context, say so clearly and briefly.",
        },
        {
          role: "user",
          content: `Recent chat history:\n${historyText || "No previous chat history."}\n\nQuestion:\n${message}\n\nRetrieved context:\n${context || "No indexed document context found."}`,
        }
      ],
      model: "llama-3.1-8b-instant",
    });

    const answer = completion.choices[0]?.message?.content || "No answer was generated.";

    await prisma.chatMessage.createMany({
      data: [
        {
          role: "user",
          content: message.trim(),
          sessionId: session.id,
        },
        {
          role: "assistant",
          content: answer,
          sessionId: session.id,
        },
      ],
    });

    if (recentMessages.length === 0 && session.title === "New chat") {
      await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          title: message.trim().slice(0, 48),
        },
      });
    }

    return Response.json({
      ok: true,
      answer,
      sessionId: session.id,
      chunks: retrievedChunks,
      retrievalWarning,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat request failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}
