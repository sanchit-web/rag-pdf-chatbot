import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const LLM_MODEL = "gemini-3.8-flash";

const MAX_RETRIES = 2;

export const generateAnswer = async (
  question: string,
  context: string,
): Promise<string> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: LLM_MODEL,
        contents: `
Context:

${context}

Question:

${question}
`,
        config: {
          systemInstruction:
            "Answer only using the provided context. If the answer is not present in the context, say you don't know.",
        },
      });

      const answer = response.text;

      if (!answer) {
        throw new Error("Gemini returned no answer");
      }

      return answer;
    } catch (error: any) {
      const status = error?.status;

      // Only retry temporary server overload errors
      if (status === 503 && attempt < MAX_RETRIES) {
        const delay = 1000 * Math.pow(2, attempt);

        console.log(
          `Gemini temporarily unavailable. Retrying in ${delay}ms...`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Gemini request failed after retries");
};