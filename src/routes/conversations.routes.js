import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { startConversation } from "../controllers/conversation.controller.js";

const router = Router();

// Start or get conversation between logged-in user and receiver
router.post("/start", authenticateJWT, startConversation);

export default router;
