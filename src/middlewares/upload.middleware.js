import multer from "multer";

// Memory storage (we’ll upload to Supabase directly)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB per file
});
