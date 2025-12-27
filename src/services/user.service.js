import { supabase } from "../config/supabase.js";

// Get user by ID
export const getLoggedInUserService = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, phone, is_verified, points, created_at")
    .eq("id", userId)
    .single();

  if (error) throw { code: 404, message: "User not found" };
  return data;
};

// Update logged-in user
export const updateLoggedInUserService = async (userId, updateData) => {
  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select("id, email, name, phone, is_verified, points, created_at")  // return updated row
    .single();

  if (error) throw { code: 500, message: "Failed to update profile" };

  return data;
};
