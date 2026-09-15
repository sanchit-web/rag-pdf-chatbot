import { Router } from "express";
import { getConversations } from "../controllers/conversation.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getConversations);

export default router;