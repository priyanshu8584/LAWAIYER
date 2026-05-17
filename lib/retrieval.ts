import { createEmbeddings } from "./embeddings";
import { ensureQdrantCollection, getQdrantConfig } from "./qdrant";

export async function retrieveRelevantChunks(query: string) {
  const [embedding] = await createEmbeddings([query]);
  const client = await ensureQdrantCollection();
  const { collectionName } = getQdrantConfig();

  const results = await client.search(collectionName, {
    vector: embedding.values,
    limit: 6,
    with_payload: true,
  });

  return results.map((result) => ({
    id: String(result.id),
    score: result.score,
    payload: result.payload,
  }));
}
