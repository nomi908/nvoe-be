import { createOrGetConversationService } from "../services/conversation.service.js";

export const startConversation = async (req, res) => {
  try {
    const userId = req.user.id; // from authenticateJWT
    const { receiverId, productId = null } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }
    if (receiverId === userId) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    const conversation = await createOrGetConversationService(userId, receiverId, productId);
    return res.status(200).json(conversation);
  } catch (err) {
    console.error("startConversation error:", err);
    return res.status(err.code || 500).json({ message: err.message || "Failed to start conversation" });
  }
};


