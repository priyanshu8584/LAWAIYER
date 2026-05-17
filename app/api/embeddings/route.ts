export async function POST() {
  return Response.json({
    ok: true,
    route: "embeddings",
    message:
      "Embeddings endpoint scaffolded. Wire OpenAI embedding generation and vector upserts here.",
  });
}
