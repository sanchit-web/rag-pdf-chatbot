import prisma from "../config/prisma.js";
import { extractPdfText } from "./pdf.service.js";
import { chunkText } from "./chunk.service.js";
import { generateEmbedding } from "./embedding.service.js";

export const createDocument = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const document = await prisma.document.create({
    data: {
      userId,
      name: file.originalname,
      originalName: file.originalname,
      fileUrl: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: "PROCESSING",
    },
  });

  try {
    const extraction = await extractPdfText(file.path);

    const chunks = extraction.pages.flatMap((page) => {
      return chunkText(page.text).map((chunk) => ({
        content: chunk.content,
        pageNumber: page.pageNumber,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
      }));
    });

    for (const chunk of chunks) {
      const createdChunk = await prisma.chunk.create({
        data: {
          documentId: document.id,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          tokenCount: chunk.tokenCount,
        },
      });

      const embedding = await generateEmbedding(chunk.content);

      if (embedding.length !== 768) {
        throw new Error(
          `Expected 768 dimensions, received ${embedding.length}`,
        );
      }

      const vector = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        UPDATE "Chunk"
        SET "embedding" = ${vector}::vector
        WHERE "id" = ${createdChunk.id}::uuid
      `;
    }

    const updatedDocument = await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        status: "PROCESSED",
        pageCount: extraction.pageCount,
      },
    });

    return updatedDocument;
  } catch (error) {
    await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
};




export const getUserDocuments = async(
    userId:string
)=>{

    return prisma.document.findMany({

        where:{
            userId
        },

        orderBy:{
            createdAt:"desc"
        }

    });

};



export const deleteDocument = async(
    userId:string,
    id:string
)=>{

    return prisma.document.deleteMany({

        where:{
            id,
            userId
        }

    });

};