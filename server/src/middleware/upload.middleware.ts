import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});


const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {

  if(file.mimetype === "application/pdf"){
    cb(null,true);
  }
  else{
    cb(new Error("Only PDF files allowed"));
  }

};


export const upload = multer({
  storage,
  fileFilter,
  limits:{
    fileSize:10*1024*1024
  }
});