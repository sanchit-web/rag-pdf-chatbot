const OLLAMA_URL = "http://localhost:11434";

const EMBEDDING_MODEL = "nomic-embed-text";

export const generateEmbedding = async (
  text: string,
): Promise<number[]> => {
  const response = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama embedding request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (!data.embeddings?.[0]) {
    throw new Error("Ollama returned no embedding");
  }

  return data.embeddings[0];
};