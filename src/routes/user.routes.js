import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { getMyProfile, updateMyProfile } from "../controllers/user.controller.js";

const router = Router();

// Get logged-in user's profile
router.get("/me", authenticateJWT, getMyProfile);

// Update logged-in user's profile
router.put("/me", authenticateJWT, updateMyProfile);

export default router;
