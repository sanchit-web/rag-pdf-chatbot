import { chunkText } from "./services/chunk.service.js";

const text = `
Sanchit Gupta is a Computer Science student at Bennett University.
He is learning full-stack development, artificial intelligence,
RAG systems, databases, and cloud technologies.
He has worked with React, Node.js, Express, MongoDB, PostgreSQL,
Prisma, TypeScript, and various AI APIs.
This is sample text used to test the chunking system.
`.repeat(20);

console.log("ORIGINAL TEXT LENGTH:", text.length);

const chunks = chunkText(text);

console.log("TOTAL CHUNKS:", chunks.length);

for (const chunk of chunks) {
  console.log("\n-------------------------");
  console.log("CHUNK INDEX:", chunk.chunkIndex);
  console.log("TOKEN COUNT:", chunk.tokenCount);
  console.log("TEXT LENGTH:", chunk.content.length);
  console.log("CONTENT PREVIEW:", chunk.content.slice(0, 150));
}