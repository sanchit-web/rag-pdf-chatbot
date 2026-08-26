import { searchSimilarChunks } from "./search.service.js";
import { generateAnswer } from "./llm.service.js";


export const askQuestion = async (
    question: string,
    documentId: string
) => {

    const chunks = await searchSimilarChunks(
        question,
        documentId
    );


    const context = chunks
        .map((chunk)=>chunk.content)
        .join("\n\n");


    const answer = await generateAnswer(
        question,
        context
    );


    return {
        answer,
        sources: chunks.map(chunk => ({
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex
        }))
    };
};