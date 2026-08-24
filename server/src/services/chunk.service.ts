export interface TextChunk {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(text: string): TextChunk[] {
  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: TextChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      cleanedText.length,
    );

    const content = cleanedText.slice(start, end).trim();

    if (content) {
      chunks.push({
        content,
        chunkIndex,
        tokenCount: estimateTokenCount(content),
      });

      chunkIndex++;
    }

    if (end >= cleanedText.length) {
      break;
    }

    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}