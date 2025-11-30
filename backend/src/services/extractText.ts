const MAX_CHUNK_LENGTH = 700; // characters

export function chunkText(text: string): string[] {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > MAX_CHUNK_LENGTH) {
      if (current.trim().length > 0) chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }
  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks;
}
