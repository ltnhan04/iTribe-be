const redis = require("../libs/redis");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../services/mailtrap/email");
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
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });
    await storeRefreshToken(user._id, refreshToken);
    res.status(200).json({
      accessToken: accessToken,
      message: "Email verified and user created successfully",
    });
  } catch (error) {
    console.log("Error in verify sign up controller: ", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(user._id);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });
      await storeRefreshToken(user._id, refreshToken);

      res.status(200).json({ accessToken, message: "Login success" });
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

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
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
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.REFRESH_TOKEN_SECRET
    );
    await storeRefreshToken(decoded.userId, newRefreshToken);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
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

module.exports = {
  signUp,
  login,
  logout,
  refreshToken,
  verifySignUp,
  getProfile,
};
