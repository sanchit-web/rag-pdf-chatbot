import { Request, Response } from "express";
import { askQuestion } from "../services/rag.service.js";


export const chat = async (
    req: Request,
    res: Response
) => {

    try {

        const { question, documentId } = req.body;


        if (!question || !documentId) {
            return res.status(400).json({
                success:false,
                message:"Question and documentId required"
            });
        }


        const result = await askQuestion(
            question,
            documentId
        );


        return res.status(200).json({
            success:true,
            ...result
        });


    } catch(error){

        console.error(error);

        return res.status(500).json({
            success:false,
            message:"Chat failed"
        });
    }
};