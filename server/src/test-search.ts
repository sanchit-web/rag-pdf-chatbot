import { searchSimilarChunks } from "./services/search.service.js";

const documentId = "771043da-d3e4-4895-9d55-e064aefe273f";

const query = "What technologies does Sanchit know?";

try {
  console.log("SEARCHING...");

  const results = await searchSimilarChunks(
    query,
    documentId,
    3,
  );

  console.log("RESULTS:", results.length);

  for (const result of results) {
    console.log("\n--- RESULT ---");
    console.log("CHUNK:", result.chunkIndex);
    console.log("PAGE:", result.pageNumber);
    console.log("SIMILARITY:", result.similarity);
    console.log("CONTENT:");
    console.log(result.content);
  }
} catch (error) {
  console.error("SEARCH FAILED:");
  console.error(error);
}