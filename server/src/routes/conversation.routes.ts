import { Router } from "express";
import {
  getConversations,
  getConversation,
} from "../controllers/conversation.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getConversations);

router.get(
  "/:conversationId",
  requireAuth,
  getConversation
);

export default router;