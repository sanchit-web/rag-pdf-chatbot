import { Request, Response } from "express";
import  prisma  from "../config/prisma.js";
import { askQuestion } from "../services/rag.service.js";

export const chat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { question, documentId } = req.body;

    // Validate request body
    if (!question || !documentId) {
      res.status(400).json({
        success: false,
        message: "Question and documentId required",
      });
      return;
    }

    // requireAuth should have added userId
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Make sure this document belongs to the logged-in user
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: req.userId,
      },
    });

    if (!document) {
      res.status(403).json({
        success: false,
        message: "Document does not belong to user",
      });
      return;
    }

    // Run the RAG pipeline
    const result = await askQuestion(
      question,
      documentId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      success: false,
      message: "Chat failed",
    });
  }
};