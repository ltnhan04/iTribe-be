const express = require("express");
const {
  signUp,
  login,
  logout,
  refreshToken,
  verifySignUp,
} = require("../controllers/auth.controller");
const router = express.Router();
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-signup", verifySignUp);
router.post("/refresh-token", refreshToken);
module.exports = router;
