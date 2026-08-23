import prisma from "../config/prisma.js";


export const createDocument = async(
    userId:string,
    file:Express.Multer.File
)=>{

    return prisma.document.create({

    data:{
        userId,

        name:file.originalname,

        originalName:file.originalname,

        fileUrl:file.path,

        fileSize:file.size,

        mimeType:file.mimetype,

        status:"UPLOADED"
    }

});

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