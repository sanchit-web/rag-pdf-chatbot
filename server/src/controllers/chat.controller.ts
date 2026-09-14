import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { askQuestion } from "../services/rag.service.js";

export const chat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      question,
      documentId,
      conversationId,
    } = req.body;

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

    // Find existing conversation or create a new one
    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: req.userId,
        },
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: req.userId,
          title: question.slice(0, 100),
        },
      });
    }

    // Save user's message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: question,
      },
    });

    // Run the RAG pipeline
    const result = await askQuestion(
      question,
      documentId
    );

    // Save assistant's answer
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: result.answer,
      },
    });

    // Return answer + conversation ID + sources
    res.status(200).json({
      success: true,
      conversationId: conversation.id,
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