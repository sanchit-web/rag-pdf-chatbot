import { embedDocumentChunks } from "./services/chunk-embedding.service.js";

const documentId = "771043da-d3e4-4895-9d55-e064aefe273f";

try {
  console.log("STARTING CHUNK EMBEDDING...");

  const count = await embedDocumentChunks(documentId);

  console.log("SUCCESS");
  console.log("EMBEDDED CHUNKS:", count);
} catch (error) {
  console.error("EMBEDDING FAILED:");
  console.error(error);
}