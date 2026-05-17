import { createUploadthing, type FileRouter } from "uploadthing/next";
import { chunkText } from "@/lib/chunker";
import { createEmbeddings } from "@/lib/embeddings";
import { parseUploadedDocument } from "@/lib/parser";
import { prisma } from "@/lib/prisma";
import { ensureQdrantCollection, getQdrantConfig } from "@/lib/qdrant";

const f = createUploadthing();

async function indexUploadedDocument(file: {
  key: string;
  name: string;
  url: string;
  type: string;
}) {
  await prisma.document.upsert({
    where: {
      storageKey: file.key,
    },
    create: {
      title: file.name,
      storageKey: file.key,
      fileUrl: file.url,
      contentType: file.type || null,
      status: "indexing",
      errorMessage: null,
    },
    update: {
      title: file.name,
      fileUrl: file.url,
      contentType: file.type || null,
      status: "indexing",
      errorMessage: null,
    },
  });

  try {
    const parsed = await parseUploadedDocument({
      fileName: file.name,
      fileUrl: file.url,
      fileType: file.type,
    });

    if (parsed.status !== "parsed") {
      throw new Error(
        `Unsupported file type for text extraction: ${file.type || "unknown"}.`,
      );
    }

    const chunks = chunkText(parsed.content);

    if (chunks.length === 0) {
      throw new Error(`No chunks were generated for ${file.name}.`);
    }

    const embeddings = await createEmbeddings(chunks);
    const client = await ensureQdrantCollection();
    const { collectionName } = getQdrantConfig();

    await client.upsert(collectionName, {
      points: embeddings.map((embedding: { values: number[] }, index: number) => ({
        id: crypto.randomUUID(),
        vector: embedding.values,
        payload: {
          fileName: file.name,
          fileUrl: file.url,
          storageKey: file.key,
          text: chunks[index],
          chunkIndex: index,
        },
      })),
    });

    await prisma.document.update({
      where: {
        storageKey: file.key,
      },
      data: {
        status: "indexed",
        errorMessage: null,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown indexing error.";

    await prisma.document.update({
      where: {
        storageKey: file.key,
      },
      data: {
        status: "failed",
        errorMessage,
      },
    });

    throw error;
  }
}

export const ourFileRouter = {
  documentUploader: f({
    text: {
      maxFileSize: "8MB",
      maxFileCount: 4,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 4,
    },
  }).onUploadComplete(async ({ file }) => {
    void indexUploadedDocument({
      key: file.key,
      name: file.name,
      url: file.url,
      type: file.type,
    }).catch((error) => {
      console.error("Upload indexing failed:", error);
    });

    return { uploadedBy: "law-ai", fileName: file.name };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
