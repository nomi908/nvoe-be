import { supabase } from "../config/supabase.js";

/**
 * Send a message
 */
export const sendMessageService = async (senderId, conversationId, content) => {
  // 1️⃣ Check if sender is part of the conversation
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("user1_id, user2_id")
    .eq("id", conversationId)
    .single();

  if (convErr || !conv) throw { code: 404, message: "Conversation not found" };
  if (conv.user1_id !== senderId && conv.user2_id !== senderId) {
    throw { code: 403, message: "Not authorized to send message in this conversation" };
  }

  // 2️⃣ Insert message
  const { data: message, error: msgErr } = await supabase
    .from("messages")
    .insert([{ conversation_id: conversationId, sender_id: senderId, content }])
    .select()
    .single();

  if (msgErr) throw { code: 500, message: "Failed to send message" };

  // 3️⃣ Update conversation last_message + last_message_at
  await supabase
    .from("conversations")
    .update({ last_message: content, last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return message;
};

/**
 * Get messages in a conversation (with limit & offset)
 */
export const getMessagesService = async (userId, conversationId, limit = 20, offset = 0) => {
  // 1️⃣ Check if user is part of conversation
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("user1_id, user2_id")
    .eq("id", conversationId)
    .single();

  if (convErr || !conv) throw { code: 404, message: "Conversation not found" };
  if (conv.user1_id !== userId && conv.user2_id !== userId) {
    throw { code: 403, message: "Not authorized to view messages in this conversation" };
  }

  // 2️⃣ Fetch messages
  const { data: messages, error: msgErr } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (msgErr) throw { code: 500, message: "Failed to fetch messages" };

  return messages;
};
