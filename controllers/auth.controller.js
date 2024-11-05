const redis = require("../libs/redis");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} = require("../services/nodemailer/email");
const {
  generateToken,
  storeRefreshToken,
} = require("../services/token.services");

const signUp = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    await redis.set(
      `signup:${email}`,
      JSON.stringify({ name, password, verificationCode }),
      "EX",
      60
    );

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: "Check your email for the OTP" });
  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const verifySignUp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const storedData = await redis.get(`signup:${email}`);

    if (!storedData) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    const { name, password, verificationCode } = JSON.parse(storedData);

    if (otp !== verificationCode.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const user = await User.create({ name, email, password });
    await redis.del(`signup:${email}`);

    const { accessToken, refreshToken } = generateToken(user._id);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });
    await storeRefreshToken(user._id, refreshToken);
    res.status(200).json({
      accessToken: accessToken,
      name: user.name,
      message: "Email verified and user created successfully",
    });
  } catch (error) {
    console.log("Error in verify sign up controller: ", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role = "user" } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      if (user.role !== role) {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }

      const { accessToken, refreshToken } = generateToken(user._id);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });

      await storeRefreshToken(user._id, refreshToken);

      res
        .status(200)
        .json({ accessToken, name: user.name, message: "Login success" });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller: ", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const resentOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const storedData = await redis.get(`signup:${email}`);
    if (!storedData) {
      return res
        .status(400)
        .json({ message: "OTP expired or invalid. Please sign up again." });
    }

    const countKey = `signup:count:${email}`;
    let resendCount = await redis.get(countKey);
    resendCount = resendCount ? parseInt(resendCount, 10) : 0;

    if (resendCount > 3) {
      return res.status(429).json({
        message:
          "You have reached the limit for resending OTP. Please try after 10 mins.",
      });
    }

    const { name, password } = JSON.parse(storedData);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    await redis.set(
      `signup:${email}`,
      JSON.stringify({ name, password, verificationCode }),
      "EX",
      60
    );

    if (resendCount === 0) {
      await redis.set(countKey, 1, "EX", 600);
    } else {
      await redis.incr(countKey);
    }

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: "Verification code resent successfully." });
  } catch (error) {
    console.log("Error in resend OTP controller: ", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15s" }
    );
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.REFRESH_TOKEN_SECRET
    );
    await storeRefreshToken(decoded.userId, newRefreshToken);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });
    res
      .status(200)
      .json({ accessToken, message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken", error);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    await redis.set(
      `resetpassword:${resetToken}`,
      JSON.stringify({ userId: user._id, resetToken }),
      "EX",
      5 * 60
    );

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const userData = await redis.get(`resetpassword:${token}`);

    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const parsedData = JSON.parse(userData);

    const { userId } = parsedData;
    if (!userId) {
      return res
        .status(500)
        .json({ success: false, message: "userId not found in Redis data" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.password = password;
    await user.save();

    await sendResetSuccessEmail(user.email);
    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  signUp,
  login,
  logout,
  refreshToken,
  verifySignUp,
  getProfile,
  forgotPassword,
  resetPassword,
  resentOTP,
};
