export function estimateTokenCount(text: string) {
  return Math.ceil(text.trim().length / 4);
}
