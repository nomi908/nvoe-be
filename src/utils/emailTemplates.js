// OTP Email Template
export const otpEmailTemplate = (otp, userName = "User") => `
<div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 40px 0;">
  <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <h2 style="color: #2F80ED; margin-bottom: 20px;">Welcome to Nvoe Marketplace!</h2>
    
    <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
      Hi ${userName},<br/>
      Use the OTP below to verify your account. It will expire in 10 minutes.
    </p>
    
    <div style="font-size: 32px; font-weight: bold; color: #2F80ED; letter-spacing: 5px; margin-bottom: 30px;">
      ${otp}
    </div>
    
    <p style="font-size: 14px; color: #555;">
      If you did not request this, please ignore this email.<br/>
      Thank you for joining Nvoe Marketplace!
    </p>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    
    <p style="font-size: 12px; color: #999;">
      Nvoe Marketplace • Your trusted Buy & Sell platform
    </p>
    
  </div>
</div>
`;
