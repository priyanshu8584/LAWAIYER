import { Pinecone } from "@pinecone-database/pinecone";

export async function createEmbeddings(texts: string[]) {
  if (texts.length === 0) {
    return [];
  }

  const pc = new Pinecone({ apiKey: process.env.PINECONE_AI ?? "" });
  
  // Pinecone embed API usage
  const response = await pc.inference.embed({
    model: "multilingual-e5-large",
    inputs: texts,
    parameters: {
      inputType: "passage",
      truncate: "END",
    }
  });

  // Response has a data property with the embeddings.
  const embeddingsArray = response.data;

  return (embeddingsArray ?? []).map((entry, index: number) => {
    // Cast entry to access values, as Pinecone's Embedding type union can cause issues
    const entryData = entry as { values?: number[] };
    return {
      id: `embedding-${index + 1}`,
      values: entryData.values ?? [],
      sourceTextLength: texts[index]?.length ?? 0,
    };
  });
}
