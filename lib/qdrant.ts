import { QdrantClient } from "@qdrant/js-client-rest";

export const QDRANT_VECTOR_SIZE = 1024;

function normalizeQdrantUrl(url: string) {
  const trimmed = url.trim();

  if (trimmed.startsWith("http://https://")) {
    return trimmed.replace("http://https://", "https://");
  }

  if (trimmed.startsWith("https://http://")) {
    return trimmed.replace("https://http://", "http://");
  }

  return trimmed;
}

export function getQdrantConfig() {
  return {
    url: normalizeQdrantUrl(process.env.QDRANT_URL ?? "http://localhost:6333"),
    apiKey: process.env.QDRANT_API_KEY ?? "",
    collectionName: process.env.QDRANT_COLLECTION ?? "law-ai-documents",
  };
}

export function getQdrantClient() {
  const { url, apiKey } = getQdrantConfig();

  return new QdrantClient({
    url,
    apiKey: apiKey || undefined,
  });
}

export async function ensureQdrantCollection() {
  const client = getQdrantClient();
  const { collectionName } = getQdrantConfig();
  const exists = await client.collectionExists(collectionName);

  if (!exists.exists) {
    await client.createCollection(collectionName, {
      vectors: {
        size: QDRANT_VECTOR_SIZE,
        distance: "Cosine",
      },
    });
  } else {
    const collection = await client.getCollection(collectionName);
    const vectorsConfig = collection.config?.params?.vectors;

    if (
      vectorsConfig &&
      !Array.isArray(vectorsConfig) &&
      "size" in vectorsConfig &&
      vectorsConfig.size !== QDRANT_VECTOR_SIZE
    ) {
      throw new Error(
        `Qdrant collection "${collectionName}" has vector size ${vectorsConfig.size}, but Pinecone embeddings need ${QDRANT_VECTOR_SIZE}. Delete and recreate the collection, or use a new collection name.`,
      );
    }
  }

  return client;
}
