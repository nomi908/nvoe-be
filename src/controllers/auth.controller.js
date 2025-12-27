import { registerUserService, verifyOTPService, loginUserService, logoutUserService, forgotPasswordService, 
    verifyForgotOTPService, resetPasswordService } from "../services/auth.service.js";


// Register Controller
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const result = await registerUserService(email, password, name, phone);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};



// Verify OTP Controller
export const verifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOTPService(email, otp);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};



// LOGIN Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUserService(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};


// LOGOUT Controller
export const logoutUser = async (req, res) => {
  try {
    const result = await logoutUserService();
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};


// ----------------------
// FORGOT PASSWORD CONTROLLER
// ----------------------
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};

// ----------------------
// VERIFY FORGOT OTP CONTROLLER
// ----------------------
export const verifyForgotOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyForgotOTPService(email, otp);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};

// ----------------------
// RESET PASSWORD CONTROLLER
// ----------------------
export const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;
    if (!password || !confirmPassword)
      throw { code: 400, message: "Password and confirm password are required" };
    if (password !== confirmPassword)
      throw { code: 400, message: "Password and confirm password do not match" };

    const result = await resetPasswordService(email, otp, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};