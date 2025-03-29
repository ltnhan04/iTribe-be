const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth.middleware");
const {
  getRecommendedProducts,
  getPopularProducts,
  getSearchSuggestions,
  saveSearchHistory
} = require("../../controllers/customer/recommendation.controller");

// Product recommendation routes
router.get("/recommended", verifyToken, getRecommendedProducts);
router.get("/popular", getPopularProducts);
router.get("/search-suggestions", verifyToken, getSearchSuggestions);
router.post("/search-history", verifyToken, saveSearchHistory);

module.exports = router; 