import { generateEmbedding } from "./services/embedding.service.js";

const text = "This is a test sentence for my RAG chatbot.";

try {
  console.log("GENERATING EMBEDDING...");

  const embedding = await generateEmbedding(text);

  console.log("SUCCESS");
  console.log("DIMENSIONS:", embedding.length);
  console.log("FIRST 10 VALUES:", embedding.slice(0, 10));
} catch (error) {
  console.error("EMBEDDING FAILED:");
  console.error(error);
}