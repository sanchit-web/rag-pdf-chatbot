import {Request,Response} from "express";
import * as documentService from "../services/document.service.js";
import prisma from "../config/prisma.js";


export const uploadDocument = async(
req:Request,
res:Response
)=>{

try{

const userId = req.userId;

if (!userId) {
  return res.status(401).json({
    success: false,
    message: "Authentication required",
  });
}

const file=req.file;


if(!file){
return res.status(400).json({
success:false,
message:"PDF required"
});
}


const document =
await documentService.createDocument(
userId,
file
);


res.json({
success:true,
document
});


}
catch(error){
  console.error("DOCUMENT UPLOAD ERROR:", error);

    

res.status(500).json({
success:false,
message:"Upload failed"
});

}

};

export const getDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const documents = await documentService.getUserDocuments(
      req.userId
    );

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("GET DOCUMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

export const getDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const documentId = req.params.documentId;

    if (typeof documentId !== "string" || !documentId) {
      res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
      return;
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: req.userId,
      },
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("GET DOCUMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
    });
  }
};


export const deleteDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const documentId = req.params.documentId;

    if (typeof documentId !== "string" || !documentId) {
      res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
      return;
    }

    const result = await documentService.deleteDocument(
      req.userId,
      documentId
    );

    if (result.count === 0) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DOCUMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};