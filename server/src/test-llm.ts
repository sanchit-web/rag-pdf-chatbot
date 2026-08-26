import { generateAnswer } from "./services/llm.service.js";


const answer = await generateAnswer(
    "What is React?",
    "React is a JavaScript library used for building user interfaces."
);


console.log(answer);