import prisma from "../config/prisma.js";
import { generateEmbedding } from "./embedding.service.js";

export const embedDocumentChunks = async (
  documentId: string,
): Promise<number> => {
  const chunks = await prisma.chunk.findMany({
    where: {
      documentId,
    },
    orderBy: {
      chunkIndex: "asc",
    },
  });

  let embeddedCount = 0;

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content);

    if (embedding.length !== 768) {
      throw new Error(
        `Expected 768 dimensions, received ${embedding.length}`,
      );
    }

    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "Chunk"
      SET "embedding" = ${vector}::vector
      WHERE "id" = ${chunk.id}::uuid
    `;

    embeddedCount++;
  }

  return embeddedCount;
};