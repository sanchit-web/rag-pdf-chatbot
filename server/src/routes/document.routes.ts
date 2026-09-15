import {Router} from "express";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/document.controller.js";
import {upload} from "../middleware/upload.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router=Router();


router.post(
"/upload",
requireAuth,
upload.single("file"),
uploadDocument
);

router.get(
  "/",
  requireAuth,
  getDocuments
);

router.get(
  "/:documentId",
  requireAuth,
  getDocument
);

router.delete(
  "/:documentId",
  requireAuth,
  deleteDocument
);


export default router;