const express = require("express");
const {
  signUp,
  login,
  logout,
  refreshToken,
  verifySignUp,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  resentOTP,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, getProfile);
router.post("/update-profile", verifyToken, updateProfile);
router.post("/verify-signup", verifySignUp);
router.post("/resent-otp", resentOTP);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
