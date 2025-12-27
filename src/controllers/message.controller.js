import { sendMessageService, getMessagesService } from "../services/message.service.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ message: "conversationId and content are required" });
    }

    const message = await sendMessageService(senderId, conversationId, content);
    res.status(200).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(err.code || 500).json({ message: err.message || "Failed to send message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const messages = await getMessagesService(userId, conversationId, parseInt(limit), parseInt(offset));
    res.status(200).json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(err.code || 500).json({ message: err.message || "Failed to fetch messages" });
  }
};
