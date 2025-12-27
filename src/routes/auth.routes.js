import express from "express";
import { registerUser, verifyUserOTP, loginUser, logoutUser, forgotPasswordController, verifyForgotOTPController, resetPasswordController  } from "../controllers/auth.controller.js";

const router = express.Router();

// Register
router.post("/register", registerUser);
router.post("/verify-otp", verifyUserOTP);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-forgot-otp", verifyForgotOTPController);
router.post("/reset-password", resetPasswordController);



// Login
// router.post("/login", loginUser);

export default router;
