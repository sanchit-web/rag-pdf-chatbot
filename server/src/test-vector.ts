import prisma from "./config/prisma.js";

const documentId = "771043da-d3e4-4895-9d55-e064aefe273f";

try {
  const result = await prisma.$queryRaw<
    Array<{
      chunkIndex: number;
      hasEmbedding: boolean;
      embeddingDimensions: number | null;
    }>
  >`
    SELECT
      "chunkIndex",
      "embedding" IS NOT NULL AS "hasEmbedding",
      CASE
        WHEN "embedding" IS NOT NULL
        THEN vector_dims("embedding")
        ELSE NULL
      END AS "embeddingDimensions"
    FROM "Chunk"
    WHERE "documentId" = ${documentId}::uuid
    ORDER BY "chunkIndex"
  `;

  console.log("VECTOR VERIFICATION:");
  console.table(result);
} catch (error) {
  console.error("VERIFICATION FAILED:");
  console.error(error);
} finally {
  await prisma.$disconnect();
}