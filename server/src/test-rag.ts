import { askQuestion } from "./services/rag.service.js";


async function main(){

    const result = await askQuestion(
        "What projects has Sanchit built?",
        "771043da-d3e4-4895-9d55-e064aefe273f"
    );


    console.log(result);

}


main();