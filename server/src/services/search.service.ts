import prisma from "../config/prisma.js";
import { generateEmbedding } from "./embedding.service.js";

export const searchSimilarChunks = async (
  query: string,
  documentId: string,
  limit = 3,
) => {
  const queryEmbedding = await generateEmbedding(query);

  if (queryEmbedding.length !== 768) {
    throw new Error(
      `Expected 768 dimensions, received ${queryEmbedding.length}`,
    );
  }

  const vector = `[${queryEmbedding.join(",")}]`;

  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      content: string;
      pageNumber: number;
      chunkIndex: number;
      similarity: number;
    }>
  >`
    SELECT
      "id",
      "content",
      "pageNumber",
      "chunkIndex",
      1 - ("embedding" <=> ${vector}::vector) AS similarity
    FROM "Chunk"
    WHERE "documentId" = ${documentId}::uuid
      AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT ${limit}
  `;

  return results;
};