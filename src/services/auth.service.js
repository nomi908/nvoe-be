import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { supabase } from "../config/supabase.js";
import { generateOTP } from "../utils/generateOTP.js";
import { otpEmailTemplate } from "../utils/emailTemplates.js";

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ----------------------
// INPUT VALIDATION
// ----------------------
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  if (password.length < 6) return "Password must be at least 6 characters long";
  if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};


// ----------------------
// REGISTER SERVICE
// ----------------------
export const registerUserService = async (email, password, name, phone) => {
  // VALIDATE INPUTS
  if (!email || !password || !name || !phone) {
    throw { code: 400, message: "Email, password, name, and phone are required" };
  }

  if (!validateEmail(email)) {
    throw { code: 400, message: "Invalid email format" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    throw { code: 400, message: passwordError };
  }

  // OPTIONAL: BASIC PHONE VALIDATION
  const phoneRegex = /^[0-9+\-() ]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    throw { code: 400, message: "Invalid phone number format" };
  }

  // Check user
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser?.is_verified) {
    throw { code: 400, message: "User already exists and verified" };
  }

  const otp = generateOTP().toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000;

  // If user exists but not verified → update OTP
  if (existingUser && !existingUser.is_verified) {
    const attempts = existingUser.otp_attempts || 0;

    if (attempts >= 5) {
      throw { code: 429, message: "Max OTP attempts reached. Try again later." };
    }

    const { error } = await supabase
      .from("users")
      .update({
        otp_code: otp,
        otp_expiry: otpExpiry,
        otp_attempts: attempts + 1,
        name,
        phone,
      })
      .eq("email", email);

    if (error) throw { code: 500, message: "Failed to update OTP" };
  }

  // Create new user
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password: hashedPassword,
          name,
          phone,
          otp_code: otp,
          otp_expiry: otpExpiry,
          otp_attempts: 1,
          is_verified: false,
        },
      ]);

    if (error) throw { code: 500, message: "Failed to create user" };
  }

  // Send OTP Email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code for Nove Marketplace",
      html: otpEmailTemplate(otp, name || email.split("@")[0]),
    });
  } catch (err) {
    throw { code: 500, message: "Failed to send OTP email" };
  }

  return { message: "OTP sent", email };
};



// ----------------------
// VERIFY OTP SERVICE
// ----------------------
export const verifyOTPService = async (email, otp) => {
  // Validate inputs
  if (!email || !otp) {
    throw { code: 400, message: "Email and OTP are required" };
  }

  if (!validateEmail(email)) {
    throw { code: 400, message: "Invalid email format" };
  }

  if (otp.length !== 6) {
    throw { code: 400, message: "OTP must be 6 digits" };
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) throw { code: 400, message: "Invalid email or OTP" };

  if (user.otp_code !== otp) throw { code: 400, message: "Invalid OTP" };

  if (Number(user.otp_expiry) < Date.now()) {
    throw { code: 400, message: "OTP expired" };
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      is_verified: true,
      otp_code: null,
      otp_expiry: null,
      otp_attempts: 0,
    })
    .eq("id", user.id);

  if (updateError) throw { code: 500, message: "Failed to verify user" };

  // JWT Token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { message: "User verified", token };
};



// ----------------------
// LOGIN SERVICE
// ----------------------
export const loginUserService = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw { code: 400, message: "Email and password are required" };
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw { code: 400, message: "Invalid email format" };
  }

  // Fetch user
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    throw { code: 400, message: "Invalid email or password" };
  }

  // Check if user is verified
  if (!user.is_verified) {
    throw { code: 403, message: "Account not verified. Please verify your OTP." };
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { code: 400, message: "Invalid email or password" };
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
};


// ----------------------
// LOGOUT SERVICE
// ----------------------
export const logoutUserService = async () => {
  return { message: "Logout successful" };
};


// ----------------------
// FORGOT PASSWORD SERVICE
// ----------------------
export const forgotPasswordService = async (email) => {
  if (!email) throw { code: 400, message: "Email is required" };

  // Normalize and trim
  const normalizedEmail = String(email).trim();

  // Try a case-insensitive lookup to avoid missing users due to casing
  const { data: user, error } = await supabase
    .from("users")
    .select("id,email")
    .ilike("email", normalizedEmail)
    .single();

  if (error || !user) throw { code: 404, message: "User not found" };

  // Cleanup expired OTP rows globally before creating a new one
  await removeExpiredPasswordResetEntries();

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Remove any existing OTP rows for this user then insert new OTP
  const { error: deleteError } = await supabase
    .from("password_reset")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) throw { code: 500, message: "Failed to clear previous OTPs" };

  const { data: insertedRows, error: insertError } = await supabase
    .from("password_reset")
    .insert({
      user_id: user.id,
      otp,
      expires_at: otpExpiry,
    })
    .select();

  if (insertError || !insertedRows || insertedRows.length === 0)
    throw { code: 500, message: "Failed to create OTP" };

  if (insertError) throw { code: 500, message: "Failed to create OTP" };

  // Send OTP email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email || email,
      subject: "Password Reset OTP",
      html: otpEmailTemplate(otp, (user.email || email).split("@")[0]),
    });
  } catch (err) {
    throw { code: 500, message: "Failed to send OTP email" };
  }

  return { message: "OTP sent to email" };
};

// ----------------------
// VERIFY FORGOT OTP SERVICE
// ----------------------
export const verifyForgotOTPService = async (email, otp) => {
  if (!email || !otp) throw { code: 400, message: "Email and OTP are required" };

  // Normalize and trim
  const normalizedEmail = String(email).trim();

  // Cleanup expired OTP rows globally before verification
  await removeExpiredPasswordResetEntries();

  const { data: user } = await supabase
    .from("users")
    .select("id,email")
    .ilike("email", normalizedEmail)
    .single();

  if (!user) throw { code: 404, message: "User not found" };

  const { data: otpRow } = await supabase
    .from("password_reset")
    .select("*")
    .eq("user_id", user.id)
    .eq("otp", otp)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!otpRow) throw { code: 400, message: "Invalid OTP" };

  if (Number(otpRow.expires_at) < Date.now()) throw { code: 400, message: "OTP expired" };

  return { message: "OTP verified" };
};

// ----------------------
// UTILS: CLEANUP EXPIRED PASSWORD RESETS
// ----------------------
const removeExpiredPasswordResetEntries = async () => {
  try {
    const { error } = await supabase
      .from("password_reset")
      .delete()
      .lt("expires_at", Date.now());

    if (error) {
      // Don't throw here to avoid breaking flows; log or surface as needed
      console.error("Failed to remove expired password_reset entries", error);
    }
  } catch (err) {
    console.error("Error cleaning expired password_reset entries", err);
  }
};

// ----------------------
// RESET PASSWORD SERVICE
// ----------------------
export const resetPasswordService = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword) throw { code: 400, message: "Email, OTP and new password are required" };

  // Normalize and trim
  const normalizedEmail = String(email).trim();

  // Validate email format
  if (!validateEmail(normalizedEmail)) 
    throw { code: 400, message: "Invalid email format" };

  // Validate password (at least 6 chars, letters + numbers)
  const passwordError = validatePassword(newPassword);
  if (passwordError) 
    throw { code: 400, message: passwordError };

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("email", normalizedEmail)
    .single();

  if (!user) throw { code: 404, message: "User not found" };

  // Cleanup expired OTP rows globally before validation
  await removeExpiredPasswordResetEntries();

  // Validate OTP exists and is not expired for this user
  const { data: otpRow } = await supabase
    .from("password_reset")
    .select("*")
    .eq("user_id", user.id)
    .eq("otp", otp)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!otpRow) throw { code: 400, message: "Invalid OTP" };
  if (Number(otpRow.expires_at) < Date.now()) throw { code: 400, message: "OTP expired" };

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", user.id);

  if (error) throw { code: 500, message: "Failed to reset password" };

  // Delete used OTP only
  await supabase
    .from("password_reset")
    .delete()
    .eq("user_id", user.id)
    .eq("otp", otp);

  return { message: "Password reset successfully" };
};