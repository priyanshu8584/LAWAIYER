export function chunkText(text: string, chunkSize = 1000, overlap = 200) {
  if (!text.trim()) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += Math.max(chunkSize - overlap, 1);
  }

  return chunks;
}
