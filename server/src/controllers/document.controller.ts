import {Request,Response} from "express";
import * as documentService from "../services/document.service.js";


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