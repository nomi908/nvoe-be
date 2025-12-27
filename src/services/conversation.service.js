import { supabase } from "../config/supabase.js";

/**
 * Ensure we always store the smaller UUID string first to prevent duplicate pairs.
 * Returns existing conversation or creates a new one.
 */
export const createOrGetConversationService = async (userId, receiverId, productId = null) => {
  // order the pair deterministically (string comparison). This avoids (A,B) vs (B,A).
  const [u1, u2] = userId < receiverId ? [userId, receiverId] : [receiverId, userId];

  // 1) Try to find existing conversation
  const { data: existing, error: selectErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("user1_id", u1)
    .eq("user2_id", u2)
    .single();

  if (selectErr && selectErr.code !== "PGRST116") {
    // PGRST116 (or similar) may mean no rows - handle generically
    // but still log unexpected errors
    if (selectErr.code) console.warn("Supabase select error:", selectErr);
  }

  if (existing) {
    return existing;
  }

  // 2) Create new conversation
  const insertPayload = {
    user1_id: u1,
    user2_id: u2,
    product_id: productId ?? null,
    last_message: null,
    last_message_at: new Date().toISOString()
  };

  const { data: created, error: insertErr } = await supabase
    .from("conversations")
    .insert([insertPayload])
    .select()
    .single();

  if (insertErr) {
    console.error("create conversation error:", insertErr);
    throw { code: 500, message: "Failed to create conversation" };
  }

  return created;
};
