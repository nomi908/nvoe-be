// Generates a 6-digit OTP code
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
