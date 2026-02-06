import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "Missing details",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Welcome! ${name}`,
      text: `Your Account has created with email id:${email}`, // ✅ FIXED
    };

    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: "Registered successfully",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({
      success: true,
      message: "You have successfully logged out",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEND VERIFY OTP =================
export const sendVerifyOtp = async (req, res) => {
  try {
    // 1. Validate userId
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID missing",
      });
    }

    // 2. Find user
    let user;
    try {
      user = await userModel.findById(req.userId);
    } catch (dbError) {
      console.error("❌ Database Find Error:", dbError);

      return res.status(500).json({
        success: false,
        message: "Database error while fetching user",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check verification status
    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    // 4. Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    // 5. Save user
    try {
      await user.save();
    } catch (saveError) {
      console.error("❌ Database Save Error:", saveError);

      return res.status(500).json({
        success: false,
        message: "Failed to save OTP",
      });
    }

    // 6. Prepare email
    if (!process.env.SENDER_EMAIL) {
      console.error("❌ Missing SENDER_EMAIL env");

      return res.status(500).json({
        success: false,
        message: "Email service not configured",
      });
    }

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE
        .replace("{{otp}}", otp)
        .replace("{{email}}", user.email),
    };

    // 7. Send mail
    try {
      await transporter.sendMail(mailOption);
    } catch (mailError) {
      console.error("❌ Email Send Error:", mailError);

      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    // 8. Success
    return res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
    });

  } catch (error) {
    // 9. Fallback error handler
    console.error("🔥 Unexpected Server Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "Missing details",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User Not found",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (!user.verifyOtpExpireAt || user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = null;

    await user.save();

    return res.json({
      success: true,
      message: "Verified successfully",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= AUTH CHECK =================
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEND RESET OTP =================
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not Found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset Otp",
      html: PASSWORD_RESET_TEMPLATE
        .replace("{{otp}}", otp)
        .replace("{{email}}", user.email),
    };

    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: "Reset OTP is sent on Email!",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Something Went Wrong",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User Not found",
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = null; // ✅ FIXED

    await user.save();

    return res.json({
      success: true,
      message: "Password Changed Successfully",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
