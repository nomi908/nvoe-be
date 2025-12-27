import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const router = Router();

// Send a message in a conversation
router.post("/send", authenticateJWT, sendMessage);

// Get all messages in a conversation (with optional pagination)
router.get("/:conversationId", authenticateJWT, getMessages);

export default router;
