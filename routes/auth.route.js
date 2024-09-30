const express = require("express");
const {
  signUp,
  login,
  logout,
  refreshToken,
  verifySignUp,
  getProfile,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, getProfile);
router.post("/verify-signup", verifySignUp);
router.post("/refresh-token", refreshToken);

module.exports = router;
