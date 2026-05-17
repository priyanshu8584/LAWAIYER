export function getPineconeConfig() {
  return {
    apiKey: process.env.PINECONE_API_KEY ?? "",
    indexName: process.env.PINECONE_INDEX_NAME ?? "law-ai",
  };
}
