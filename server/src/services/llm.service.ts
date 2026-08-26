import ollama from "ollama";


export const generateAnswer = async (
    question: string,
    context: string
) => {

    const response = await ollama.chat({

        model: "llama3",

        messages: [

            {
                role: "system",
                content:
                "Answer only using the provided context. If the answer is not present in the context, say you don't know."
            },


            {
                role: "user",
                content:
`
Context:

${context}


Question:

${question}
`
            }

        ]

    });


    return response.message.content;

};