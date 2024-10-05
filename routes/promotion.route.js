const router = require("express").Router();

const {
  applyPromotion,
  getActivePromotions,
} = require("../controllers/promotion.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/apply", verifyToken, applyPromotion);
router.get("/active", getActivePromotions);

module.exports = router;
