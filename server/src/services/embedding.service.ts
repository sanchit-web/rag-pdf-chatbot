import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env["GEMINI_API_KEY"],
});

const EMBEDDING_MODEL = "gemini-embedding-001";

export const generateEmbedding = async (
  text: string,
): Promise<number[]> => {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Gemini returned no embedding");
  }

  if (embedding.length !== 768) {
    throw new Error(
      `Expected 768 dimensions, received ${embedding.length}`,
    );
  }

  return embedding;
};